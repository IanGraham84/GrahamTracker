-- Agent Onboarding Tracker — database schema
-- Run this in the Supabase SQL editor, in order, on a fresh project.

-- 1. Core tables
create extension if not exists "pgcrypto";

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  upline text,
  start_date date not null default current_date,
  type text not null check (type in ('licensed', 'unlicensed')),
  unique_token uuid not null default gen_random_uuid() unique,
  phone text,
  email text,
  state text,
  notes text,
  stall_snoozed_until date,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists agent_checks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  step_id text not null,
  checked boolean not null default false,
  checked_at timestamptz,
  checked_by text check (checked_by in ('agent', 'admin')),
  unique (agent_id, step_id)
);

create table if not exists agent_dates (
  agent_id uuid primary key references agents(id) on delete cascade,
  exam_date date,
  exam_date_set_at timestamptz,
  contracts_sent_at timestamptz
);

create table if not exists agent_schedules (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  label text,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);

create index if not exists agent_schedules_agent_id_idx on agent_schedules(agent_id);

-- 2. Row Level Security
alter table agents enable row level security;
alter table agent_checks enable row level security;
alter table agent_dates enable row level security;

create policy "Admin full access on agents"
  on agents for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin full access on agent_checks"
  on agent_checks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin full access on agent_dates"
  on agent_dates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Note: agent_schedules intentionally has RLS left disabled — both the admin
-- API routes and the token-based agent self-service routes talk to it only
-- through the service-role client (lib/supabaseAdmin.ts), never directly
-- from the browser, so table-level RLS isn't the enforcement point there.

-- 3. Realtime
alter table agents replica identity full;
alter table agent_checks replica identity full;
alter table agent_dates replica identity full;
-- Then in the Supabase Dashboard: Database → Replication, enable
-- replication for the `agents`, `agent_checks`, and `agent_dates` tables.
-- The dashboard listens for changes on all three (agent create/archive
-- included) to keep the sidebar and metrics live.
