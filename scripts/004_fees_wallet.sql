-- Fee ledger: percentages and inspection amount are mirrored in lib/fees.ts.
do $$ begin
  create type public.wallet_transaction_type as enum ('rental_earning','sale_earning','commission_deducted','service_fee_charged','inspection_fee_deducted','deposit_held','deposit_returned');
exception when duplicate_object then null; end $$;

alter table public.listings add column if not exists deposit numeric(10,2) check (deposit is null or deposit >= 0);
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.wallet_transaction_type not null,
  amount numeric(10,2) not null check (amount >= 0),
  related_request_id uuid references public.requests(id) on delete set null,
  related_check_id uuid references public.checks(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists wallet_transactions_user_idx on public.wallet_transactions(user_id, created_at desc);
alter table public.wallet_transactions enable row level security;
drop policy if exists wallet_transactions_select_own on public.wallet_transactions;
create policy wallet_transactions_select_own on public.wallet_transactions for select using (auth.uid() = user_id or public.is_admin());
create or replace view public.wallet_balances as
select u.id as user_id, coalesce(sum(case when wt.type in ('rental_earning','sale_earning','deposit_returned') then wt.amount else -wt.amount end), 0)::numeric(12,2) as balance
from public.users u left join public.wallet_transactions wt on wt.user_id = u.id group by u.id;
grant select on public.wallet_balances to authenticated;
grant usage on type public.wallet_transaction_type to authenticated;
grant select on public.wallet_transactions to authenticated;

create or replace function public.record_request_completion(p_request_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_listing public.listings%rowtype; v_request public.requests%rowtype; v_commission numeric; v_service numeric;
begin
 select * into v_request from public.requests where id=p_request_id;
 select * into v_listing from public.listings where id=v_request.listing_id;
 if v_request.status <> 'completed' or v_listing.seller_id <> auth.uid() then raise exception 'not allowed'; end if;
 if exists(select 1 from public.wallet_transactions where related_request_id=p_request_id and type in ('sale_earning','rental_earning')) then return; end if;
 v_commission := round(v_listing.price * 0.08, 2); v_service := round(v_listing.price * 0.04, 2);
 insert into public.wallet_transactions(user_id,type,amount,related_request_id) values
 (v_listing.seller_id, case when v_listing.type='rent' then 'rental_earning'::public.wallet_transaction_type else 'sale_earning'::public.wallet_transaction_type end, v_listing.price-v_commission, p_request_id),
 (v_listing.seller_id, 'commission_deducted', v_commission, p_request_id),
 (v_request.buyer_id, 'service_fee_charged', v_service, p_request_id);
end; $$;
revoke all on function public.record_request_completion(uuid) from public;
grant execute on function public.record_request_completion(uuid) to authenticated;

create or replace function public.record_inspection_fee(p_check_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_check public.checks%rowtype; v_user uuid;
begin
 select * into v_check from public.checks where id=p_check_id;
 if v_check.status not in ('passed','failed') or v_check.charged_to is null then return; end if;
 if exists(select 1 from public.wallet_transactions where related_check_id=p_check_id and type='inspection_fee_deducted') then return; end if;
 if v_check.charged_to='seller' then select seller_id into v_user from public.listings where id=v_check.listing_id; else select buyer_id into v_user from public.requests where id=v_check.related_request_id; end if;
 insert into public.wallet_transactions(user_id,type,amount,related_request_id,related_check_id) values(v_user,'inspection_fee_deducted',v_check.cost,v_check.related_request_id,p_check_id);
end; $$;
revoke all on function public.record_inspection_fee(uuid) from public;
grant execute on function public.record_inspection_fee(uuid) to authenticated;
