import { prisma } from '../src/lib/db.js';
import { exercises } from './exercises.js';

// Upsert by slug so the seed can run any number of times.
async function main() {
  await prisma.$transaction(
    exercises.map((exercise) =>
      prisma.exercise.upsert({
        where: { slug: exercise.slug },
        update: { name: exercise.name, muscleGroup: exercise.muscleGroup, equipment: exercise.equipment },
        create: exercise,
      }),
    ),
  );
  const count = await prisma.exercise.count({ where: { userId: null } });
  console.log(`Seeded ${exercises.length} exercises (${count} built-in exercises in the database).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
