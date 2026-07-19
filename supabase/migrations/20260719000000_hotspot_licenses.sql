create table if not exists hotspot_licenses (
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

create index if not exists idx_hotspot_licenses_reference on hotspot_licenses(reference);
create index if not exists idx_hotspot_licenses_contact_email on hotspot_licenses(contact_email);
create index if not exists idx_hotspot_licenses_customer_id on hotspot_licenses(customer_id);

drop trigger if exists trg_hotspot_licenses_updated_at on hotspot_licenses;
create trigger trg_hotspot_licenses_updated_at
  before update on hotspot_licenses
  for each row
  execute function update_updated_at();

create table if not exists hotspot_vouchers (
  id              uuid primary key default gen_random_uuid(),
  license_id      uuid not null references hotspot_licenses(id) on delete cascade,
  code            text not null,
  package_name    text not null,
  price           numeric(12,2) not null default 0,
  duration_hours  integer not null default 24,
  status          text not null default 'active'
                  check (status in ('active','used','expired','revoked')),
  used_by_phone   text,
  used_at         timestamptz,
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_hotspot_vouchers_code on hotspot_vouchers(code);
create index if not exists idx_hotspot_vouchers_license_id on hotspot_vouchers(license_id);
create index if not exists idx_hotspot_vouchers_status on hotspot_vouchers(status);

create table if not exists voucher_sessions (
  id              uuid primary key default gen_random_uuid(),
  voucher_id      uuid not null references hotspot_vouchers(id) on delete cascade,
  session_id      text not null,
  nas_ip          text,
  mac_address     text,
  input_octets    numeric(20,0) not null default 0,
  output_octets   numeric(20,0) not null default 0,
  session_time    integer not null default 0,
  started_at      timestamptz not null default now(),
  stopped_at      timestamptz
);

create index if not exists idx_voucher_sessions_voucher_id on voucher_sessions(voucher_id);
create index if not exists idx_voucher_sessions_session_id on voucher_sessions(session_id);
