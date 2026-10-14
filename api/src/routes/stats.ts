import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { getUserId, requireAuth } from '../middleware/require-auth.js';

export const statsRouter = Router();

statsRouter.use(requireAuth);

const isTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// The user's time zone decides which calendar day a late-night workout belongs to.
const query = z.object({
  tz: z.string().max(64).refine(isTimeZone, 'Unknown time zone').default('UTC'),
});

type Totals = { total_workouts: number; this_week: number; total_exercises: number; total_sets: number; total_volume_kg: number };
type Day = { day: string; volume_kg: number; workouts: number };
type Record = { name: string; weight_kg: number; reps: number };

// Aggregated in SQL so the app gets a few numbers instead of downloading every set it has ever logged.
statsRouter.get('/', async (req, res) => {
  const userId = getUserId(req);
  const { tz } = query.parse(req.query);

  const [totalsRows, days, records] = await Promise.all([
    prisma.$queryRaw<Totals[]>`
      SELECT
        count(DISTINCT w.id)::int AS total_workouts,
        -- Last 7 calendar days in the user's time zone, the same window as the chart.
        count(DISTINCT w.id) FILTER (
          WHERE ((w.started_at AT TIME ZONE 'UTC') AT TIME ZONE ${tz})::date >= (now() AT TIME ZONE ${tz})::date - 6
        )::int AS this_week,
        count(DISTINCT we.id)::int AS total_exercises,
        (count(s.id) FILTER (WHERE s.completed))::int AS total_sets,
        coalesce(sum(s.reps * s.weight_kg) FILTER (WHERE s.completed), 0)::float AS total_volume_kg
      FROM workouts w
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
      WHERE w.user_id = ${userId}::uuid`,

    // Volume per local calendar day for the last week. Times are stored in UTC.
    prisma.$queryRaw<Day[]>`
      SELECT
        to_char((w.started_at AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD') AS day,
        coalesce(sum(s.reps * s.weight_kg) FILTER (WHERE s.completed), 0)::float AS volume_kg,
        count(DISTINCT w.id)::int AS workouts
      FROM workouts w
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
      WHERE w.user_id = ${userId}::uuid
        AND w.started_at >= (now() AT TIME ZONE 'UTC') - interval '8 days'
      GROUP BY 1`,

    // Best set (weight x reps) per exercise, then the top 5. DISTINCT ON keeps the first row per exercise.
    prisma.$queryRaw<Record[]>`
      SELECT name, weight_kg, reps FROM (
        SELECT DISTINCT ON (we.exercise_id)
          e.name, s.weight_kg::float AS weight_kg, s.reps, (s.reps * s.weight_kg) AS score
        FROM workout_sets s
        JOIN workout_exercises we ON we.id = s.workout_exercise_id
        JOIN workouts w ON w.id = we.workout_id
        JOIN exercises e ON e.id = we.exercise_id
        WHERE w.user_id = ${userId}::uuid AND s.completed AND s.weight_kg > 0
        ORDER BY we.exercise_id, score DESC
      ) best
      ORDER BY score DESC
      LIMIT 5`,
  ]);

  const totals = totalsRows[0];
  res.json({
    totalWorkouts: totals?.total_workouts ?? 0,
    thisWeekWorkouts: totals?.this_week ?? 0,
    totalExercises: totals?.total_exercises ?? 0,
    totalSets: totals?.total_sets ?? 0,
    totalVolumeKg: totals?.total_volume_kg ?? 0,
    days: days.map((d) => ({ date: d.day, volumeKg: d.volume_kg, workouts: d.workouts })),
    personalRecords: records.map((r) => ({ exercise: r.name, weightKg: r.weight_kg, reps: r.reps })),
  });
});
