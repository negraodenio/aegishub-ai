create extension if not exists "pgcrypto";
create extension if not exists "vector";

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  vertical text not null default 'generic',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  role text not null,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  external_id text,
  full_name text not null,
  department text,
  business_unit text,
  site_name text,
  manager_id uuid,
  shift_type text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  protocol_version text not null default '1.0',
  vertical_pack text not null default 'generic',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table assessment_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  instrument_code text not null,
  item_code text not null,
  answer_numeric numeric,
  answer_text text,
  created_at timestamptz not null default now(),
  unique (session_id, instrument_code, item_code)
);

create table assessment_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references assessment_sessions(id) on delete cascade,
  phq9_score numeric,
  gad7_score numeric,
  burnout_score numeric,
  wellbeing_score numeric,
  psychosocial_risk_score numeric,
  voice_signal_score numeric,
  composite_risk_score numeric not null,
  risk_level text not null,
  requires_human_review boolean not null default false,
  confidence numeric not null default 0,
  reasons text[] not null default '{}',
  scored_at timestamptz not null default now()
);

create table risk_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  session_id uuid references assessment_sessions(id) on delete set null,
  alert_type text not null,
  severity text not null,
  requires_human_review boolean not null default true,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table care_referrals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  session_id uuid references assessment_sessions(id),
  referral_type text not null,
  urgency text not null default 'routine',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table manager_dashboard_aggregates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  org_unit_id uuid,
  period_from date not null,
  period_to date not null,
  total_employees integer not null default 0,
  assessed_count integer not null default 0,
  low_risk_count integer not null default 0,
  moderate_risk_count integer not null default 0,
  high_risk_count integer not null default 0,
  critical_risk_count integer not null default 0,
  avg_composite_score numeric,
  open_alerts_count integer not null default 0,
  open_referrals_count integer not null default 0,
  compliance_score numeric,
  computed_at timestamptz not null default now()
);

create table return_to_work_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  start_date date not null,
  expected_return_date date,
  actual_return_date date,
  return_status text not null default 'planned',
  readiness_score numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table benchmark_snapshots (
  id uuid primary key default gen_random_uuid(),
  vertical text not null,
  metric_code text not null,
  metric_value numeric not null,
  sample_size integer not null,
  reference_period date not null,
  created_at timestamptz not null default now()
);

create table predictive_risk_signals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  signal_date date not null,
  predicted_risk_score numeric not null,
  predicted_risk_level text not null,
  drivers jsonb not null default '[]',
  model_version text not null,
  created_at timestamptz not null default now()
);

create table repo_nodes (
  id text primary key,
  path text not null unique,
  kind text not null,
  language text not null default 'typescript',
  summary text,
  symbols text[] not null default '{}',
  imports text[] not null default '{}',
  tags text[] not null default '{}',
  indexed_at timestamptz not null default now()
);

create table repo_chunks (
  id text primary key,
  node_id text not null references repo_nodes(id) on delete cascade,
  path text not null,
  content text not null,
  start_line integer not null,
  end_line integer not null,
  symbol_name text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table patch_jobs (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  candidate_paths text[] not null default '{}',
  constraints text[] not null default '{}',
  status text not null default 'pending',
  proposals jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

alter table tenants enable row level security;
alter table profiles enable row level security;
alter table employees enable row level security;
alter table assessment_sessions enable row level security;
alter table assessment_answers enable row level security;
alter table assessment_scores enable row level security;
alter table risk_alerts enable row level security;
alter table care_referrals enable row level security;
alter table manager_dashboard_aggregates enable row level security;
alter table return_to_work_cases enable row level security;
alter table predictive_risk_signals enable row level security;

create or replace function current_tenant_id()
returns uuid
language sql
stable
security definer
as $$
  select tenant_id from profiles where id = auth.uid()
$$;

create or replace function current_user_role()
returns text
language sql
stable
security definer
as $$
  select role from profiles where id = auth.uid()
$$;

create table ai_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  decision_type text not null,
  status text not null default 'pending',
  memory_updates jsonb,
  created_at timestamptz not null default now()
);

create table ai_audit_logs (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references ai_decisions(id) on delete cascade,
  action text not null,
  actor text not null,
  old_memory jsonb,
  new_memory jsonb,
  scaffold_changes jsonb,
  created_at timestamptz not null default now()
);

alter table ai_decisions enable row level security;
alter table ai_audit_logs enable row level security;
