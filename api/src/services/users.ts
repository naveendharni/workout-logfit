import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/db.js';

// Deletes users and everything they own. Workouts go first: a workout entry blocks deletion of the
// exercise it points to (onDelete: Restrict), so removing the user's custom exercises via the user
// cascade only works once their workouts are gone. One transaction, so it's all or nothing.
export const deleteUsers = (where: Prisma.UserWhereInput) =>
  prisma.$transaction([
    prisma.workout.deleteMany({ where: { user: where } }),
    prisma.user.deleteMany({ where }),
  ]);
