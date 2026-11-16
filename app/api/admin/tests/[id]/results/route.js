import { db, ok, admin } from '@/lib/db';

export const GET = admin(async (_, { id }) =>
  ok(await db.from('results').select('*').eq('test_id', id).order('created_at', { ascending: false })));
