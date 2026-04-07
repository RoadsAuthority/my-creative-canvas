-- Run once in Neon SQL Editor if your `portfolios` table was created before social_links existed.
alter table portfolios add column if not exists social_links jsonb not null default '{}'::jsonb;
