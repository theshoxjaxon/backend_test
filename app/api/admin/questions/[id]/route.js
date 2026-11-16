import { db, ok, admin } from '@/lib/db';

export const DELETE = admin(async (_, { id }) => { ok(await db.from('questions').delete().eq('id', id)); return {}; });
