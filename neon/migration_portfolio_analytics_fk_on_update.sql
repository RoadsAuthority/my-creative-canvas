-- Run once in Neon: allow portfolio slug renames without breaking analytics FK.
-- Without ON UPDATE CASCADE, changing portfolios.slug fails when analytics rows exist.

alter table portfolio_analytics
  drop constraint if exists portfolio_analytics_portfolio_slug_fkey;

alter table portfolio_analytics
  add constraint portfolio_analytics_portfolio_slug_fkey
  foreign key (portfolio_slug) references portfolios (slug) on delete cascade on update cascade;
