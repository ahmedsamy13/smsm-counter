-- One shared counter row. The browser can read or increment it only via RPC.
create table if not exists public.smsm_counter (
  id boolean primary key default true check (id),
  total bigint not null default 0 check (total >= 0)
);

insert into public.smsm_counter (id, total)
values (true, 0)
on conflict (id) do nothing;

alter table public.smsm_counter enable row level security;
revoke all on public.smsm_counter from anon, authenticated;

create or replace function public.get_total_clicks()
returns bigint
language sql
security definer
set search_path = ''
as $$
  select total from public.smsm_counter where id = true;
$$;

create or replace function public.increment_total_clicks()
returns bigint
language sql
security definer
set search_path = ''
as $$
  update public.smsm_counter
  set total = total + 1
  where id = true
  returning total;
$$;

revoke all on function public.get_total_clicks() from public;
revoke all on function public.increment_total_clicks() from public;
grant execute on function public.get_total_clicks() to anon, authenticated;
grant execute on function public.increment_total_clicks() to anon, authenticated;
