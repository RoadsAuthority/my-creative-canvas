-- Billing: tier + Stripe customer id (run once on existing DBs)
alter table users add column if not exists billing_tier text not null default 'free';
alter table users add column if not exists stripe_customer_id text;

-- Optional: enforce allowed values (skip if your Postgres version dislikes adding CHECK to populated tables)
-- alter table users add constraint users_billing_tier_check
--   check (billing_tier in ('free', 'basic', 'premium'));
