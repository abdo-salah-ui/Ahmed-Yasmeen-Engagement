-- Run once on an existing guestbook_messages table.
-- Existing messages stay approved; new messages are hidden until approved.
begin;
alter table public.guestbook_messages
  add column if not exists approved boolean not null default true;
alter table public.guestbook_messages
  alter column approved set default false;

drop policy if exists "Anyone can read guestbook messages" on public.guestbook_messages;
drop policy if exists "Anyone can read approved guestbook messages" on public.guestbook_messages;
create policy "Anyone can read approved guestbook messages"
  on public.guestbook_messages
  for select
  to anon
  using (approved is true);
commit;
