create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  billing_tier text not null default 'free' check (billing_tier in ('free', 'basic', 'premium')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  slug text unique not null,
  full_name text not null,
  profile_image_url text not null default '',
  cv_url text not null default '',
  cv_file_name text not null default '',
  headline text not null,
  bio text not null default '',
  email text not null default '',
  location text not null default '',
  theme text not null default 'glass',
  custom_domain text not null default '',
  custom_domain_verified boolean not null default false,
  social_links jsonb not null default '{}'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_analytics (
  id uuid primary key default gen_random_uuid(),
  portfolio_slug text not null references portfolios(slug) on delete cascade,
  event_type text not null check (event_type in ('view', 'project_click')),
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolios_user_id on portfolios(user_id);
create index if not exists idx_portfolios_slug on portfolios(slug);
create index if not exists idx_analytics_slug on portfolio_analytics(portfolio_slug);

-- If you created portfolios before social_links existed, run:
-- alter table portfolios add column if not exists social_links jsonb not null default '{}'::jsonb;
