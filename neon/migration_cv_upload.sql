-- Run once in Neon SQL Editor if your `portfolios` table was created before CV fields existed.
alter table portfolios add column if not exists cv_url text not null default '';
alter table portfolios add column if not exists cv_file_name text not null default '';
