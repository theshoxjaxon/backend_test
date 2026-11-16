import { db, ok, bad, admin } from '@/lib/db';

export const GET = admin(async () => ok(await db.from('tests').select('*').order('id')));
export const POST = admin(async req => {
  const { slug, title } = await req.json();
  if (!/^[a-z0-9-]+$/.test(slug ?? '') || !title) throw bad('slug (a-z0-9-) and title required');
  return ok(await db.from('tests').insert({ slug, title }).select().single());
});
