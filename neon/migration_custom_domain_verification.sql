-- Run once if portfolios table existed before domain verification fields.
alter table portfolios add column if not exists custom_domain_verify_token text not null default '';
alter table portfolios add column if not exists custom_domain_last_checked_at timestamptz;
create index if not exists idx_portfolios_custom_domain on portfolios(custom_domain);
