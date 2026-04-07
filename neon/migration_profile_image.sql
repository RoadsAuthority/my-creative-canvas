-- Run once in Neon SQL Editor if your `portfolios` table was created before profile_image_url existed.
alter table portfolios add column if not exists profile_image_url text not null default '';
