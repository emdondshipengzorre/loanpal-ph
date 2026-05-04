-- Run this in your Supabase SQL Editor to set up the database tables
-- Go to: https://supabase.com/dashboard → your project → SQL Editor

create table loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  app text not null,
  custom_app_name text,
  amount_borrowed numeric not null,
  remaining_balance numeric not null,
  monthly_payment numeric not null,
  next_due_date date not null,
  status text not null default 'active' check (status in ('active', 'paid')),
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  loan_id uuid references loans(id) on delete cascade,
  amount numeric not null,
  date date not null,
  note text,
  created_at timestamptz default now()
);

-- Row Level Security: users can only see their own data
alter table loans enable row level security;
alter table payments enable row level security;

create policy "Users can manage their own loans"
  on loans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own payments"
  on payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Bills Tracker tables

create table bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null check (category in ('utilities', 'telecom', 'housing', 'insurance', 'subscriptions', 'other')),
  provider text not null,
  custom_provider_name text,
  typical_amount numeric not null,
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  status text not null default 'active' check (status in ('active', 'paused')),
  notes text,
  created_at timestamptz default now()
);

create table bill_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  bill_id uuid references bills(id) on delete cascade,
  amount numeric not null,
  date date not null,
  period text not null,
  note text,
  created_at timestamptz default now()
);

alter table bills enable row level security;
alter table bill_payments enable row level security;

create policy "Users can manage their own bills"
  on bills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own bill payments"
  on bill_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
