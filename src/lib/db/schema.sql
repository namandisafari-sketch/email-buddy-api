-- MTN MoMo Payments table
-- Run this in your PostgreSQL / Supabase SQL editor

create table if not exists momo_payments (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null,
  phone         text not null,
  network       text not null default 'mtn',
  amount        numeric(12,2) not null,
  currency      text not null default 'UGX',
  status        text not null default 'pending'
                check (status in ('pending','processing','successful','failed')),
  momo_transaction_id text,
  error_message text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_momo_payments_reference on momo_payments(reference);
create index if not exists idx_momo_payments_phone on momo_payments(phone);
create index if not exists idx_momo_payments_status on momo_payments(status);

-- trigger to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_momo_payments_updated_at on momo_payments;
create trigger trg_momo_payments_updated_at
  before update on momo_payments
  for each row
  execute function update_updated_at();
