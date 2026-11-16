import { notFound } from 'next/navigation';
import { db, ok, PER_STUDENT } from '@/lib/db';
import Test from './Test';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = await db.from('tests').select('title').eq('slug', slug).maybeSingle();
  return {
    title: t.data?.title ? `${t.data.title} — Online Test` : 'Online Test',
    description: 'Online bilim va ko‘nikmalarni baholash testi',
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const t = ok(await db.from('tests').select('id,title').eq('slug', slug).maybeSingle());
  if (!t) notFound();
  // answers are NOT selected: the browser never sees them
  const all = ok(await db.from('questions').select('id,text,text_ru,options,options_ru').eq('test_id', t.id).order('id'));
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const questions = all.slice(0, PER_STUDENT); // random 25 per student
  
  return (
    <main className="portal-wrapper">
      <Test slug={slug} title={t.title} questions={questions} />
    </main>
  );
}
