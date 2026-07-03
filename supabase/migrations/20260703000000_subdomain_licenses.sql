create table if not exists subdomain_licenses (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  org_name        text not null,
  contact_email   text not null,
  contact_phone   text not null,
  domain          text not null,
  token           text not null unique,
  status          text not null default 'pending'
                  check (status in ('pending','active','revoked')),
  total           numeric(12,2) not null,
  currency        text not null default 'UGX',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  customer_id     uuid references customers(id)
);

create index if not exists idx_subdomain_licenses_reference on subdomain_licenses(reference);
create index if not exists idx_subdomain_licenses_contact_email on subdomain_licenses(contact_email);
create index if not exists idx_subdomain_licenses_customer_id on subdomain_licenses(customer_id);

drop trigger if exists trg_subdomain_licenses_updated_at on subdomain_licenses;
create trigger trg_subdomain_licenses_updated_at
  before update on subdomain_licenses
  for each row
  execute function update_updated_at();

create table if not exists subdomain_configs (
  id              uuid primary key default gen_random_uuid(),
  license_id      uuid not null references subdomain_licenses(id) on delete cascade,
  subdomain       text not null,
  record_type     text not null default 'A',
  record_value    text not null,
  ssl_status      text not null default 'pending'
                  check (ssl_status in ('pending','active','failed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_subdomain_configs_license_id on subdomain_configs(license_id);

drop trigger if exists trg_subdomain_configs_updated_at on subdomain_configs;
create trigger trg_subdomain_configs_updated_at
  before update on subdomain_configs
  for each row
  execute function update_updated_at();

create table if not exists nsis_licenses (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  org_name        text not null,
  contact_email   text not null,
  contact_phone   text not null,
  token           text not null unique,
  status          text not null default 'pending'
                  check (status in ('pending','active','revoked')),
  total           numeric(12,2) not null,
  currency        text not null default 'UGX',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  customer_id     uuid references customers(id)
);

create index if not exists idx_nsis_licenses_reference on nsis_licenses(reference);
create index if not exists idx_nsis_licenses_contact_email on nsis_licenses(contact_email);
create index if not exists idx_nsis_licenses_customer_id on nsis_licenses(customer_id);

drop trigger if exists trg_nsis_licenses_updated_at on nsis_licenses;
create trigger trg_nsis_licenses_updated_at
  before update on nsis_licenses
  for each row
  execute function update_updated_at();
