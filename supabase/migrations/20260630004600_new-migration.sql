-- MTN MoMo Payments table
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

-- Activations table
create table if not exists activations (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  org_name        text not null,
  contact_email   text not null,
  contact_phone   text not null,
  token           text not null,
  smtp_password   text not null,
  status          text not null default 'activated'
                  check (status in ('activated','revoked')),
  proof_text      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_activations_reference on activations(reference);
create index if not exists idx_activations_contact_email on activations(contact_email);

drop trigger if exists trg_activations_updated_at on activations;
create trigger trg_activations_updated_at
  before update on activations
  for each row
  execute function update_updated_at();

-- Domain orders table
create table if not exists domain_orders (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  domain          text not null,
  tld             text not null,
  years           integer not null default 1,
  total           numeric(12,2) not null,
  currency        text not null default 'UGX',
  contact_email   text not null,
  contact_phone   text not null,
  org_name        text not null,
  status          text not null default 'pending'
                  check (status in ('pending','processing','active','failed','cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_domain_orders_reference on domain_orders(reference);
create index if not exists idx_domain_orders_contact_email on domain_orders(contact_email);
create index if not exists idx_domain_orders_status on domain_orders(status);

drop trigger if exists trg_domain_orders_updated_at on domain_orders;
create trigger trg_domain_orders_updated_at
  before update on domain_orders
  for each row
  execute function update_updated_at();

-- Customers table (for accounts)
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  password_hash   text not null,
  org_name        text,
  phone           text,
  email_verified  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_customers_email on customers(email);

drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at
  before update on customers
  for each row
  execute function update_updated_at();

-- Customer sessions (auth tokens)
create table if not exists customer_sessions (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references customers(id) on delete cascade,
  token           text not null unique,
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_customer_sessions_token on customer_sessions(token);
create index if not exists idx_customer_sessions_customer_id on customer_sessions(customer_id);

-- Link existing orders to customer accounts
alter table domain_orders add column if not exists customer_id uuid references customers(id);
alter table activations add column if not exists customer_id uuid references customers(id);
