import { db, ok, admin } from '@/lib/db';

export const DELETE = admin(async (_, { id }) => { ok(await db.from('results').delete().eq('id', id)); return {}; });
