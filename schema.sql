-- Fresh install: run all of this in the Supabase SQL editor.
create table tests (
  id bigint generated always as identity primary key,
  slug text unique not null,          -- URL: /<slug>
  title text not null
);
create table questions (
  id bigint generated always as identity primary key,
  test_id bigint not null references tests(id) on delete cascade,
  text text not null,                 -- Uzbek
  options jsonb not null,             -- Uzbek ["A","B","C","D"]
  text_ru text,                       -- Russian (optional)
  options_ru jsonb,
  answer int not null                 -- 0-based index of correct option
);
create table results (
  id bigint generated always as identity primary key,
  test_id bigint not null references tests(id) on delete cascade,
  student text not null,              -- first name
  surname text,
  grp text,                           -- group number
  score int not null,
  total int not null,
  violations int default 0,           -- times the student left the test page
  created_at timestamptz default now()
);
alter table tests enable row level security;
alter table questions enable row level security;
alter table results enable row level security;

-- Already ran the old version? Run only these instead:
-- alter table questions add column text_ru text, add column options_ru jsonb;
-- alter table results add column surname text, add column grp text;
-- Anti-cheat column on an existing DB:
-- alter table results add column violations int default 0;
