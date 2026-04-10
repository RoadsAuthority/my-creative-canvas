-- Run once if users table existed before profile fields.
alter table users add column if not exists full_name text not null default '';
alter table users add column if not exists company text not null default '';
alter table users add column if not exists avatar_url text not null default '';
