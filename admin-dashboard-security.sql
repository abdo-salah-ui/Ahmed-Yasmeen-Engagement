-- Dashboard user UID: da2bdf1b-1d6c-4bf4-b4d2-f924cced01b0
-- The fixed ID prevents any other Auth user from gaining dashboard access.
-- Public visitors can still submit RSVPs and only see approved guestbook notes.
begin;

alter table public.engagement_rsvps enable row level security;
alter table public.guestbook_messages enable row level security;

grant select, delete on table public.engagement_rsvps to authenticated;
grant select, delete on table public.guestbook_messages to authenticated;
grant update (approved) on table public.guestbook_messages to authenticated;

drop policy if exists "Couple can read engagement RSVPs" on public.engagement_rsvps;
create policy "Couple can read engagement RSVPs"
  on public.engagement_rsvps for select to authenticated
  using (auth.uid() = 'da2bdf1b-1d6c-4bf4-b4d2-f924cced01b0'::uuid);

drop policy if exists "Couple can delete engagement RSVPs" on public.engagement_rsvps;
create policy "Couple can delete engagement RSVPs"
  on public.engagement_rsvps for delete to authenticated
  using (auth.uid() = 'da2bdf1b-1d6c-4bf4-b4d2-f924cced01b0'::uuid);

drop policy if exists "Couple can read all guestbook messages" on public.guestbook_messages;
create policy "Couple can read all guestbook messages"
  on public.guestbook_messages for select to authenticated
  using (auth.uid() = 'da2bdf1b-1d6c-4bf4-b4d2-f924cced01b0'::uuid);

drop policy if exists "Couple can approve guestbook messages" on public.guestbook_messages;
create policy "Couple can approve guestbook messages"
  on public.guestbook_messages for update to authenticated
  using (auth.uid() = 'da2bdf1b-1d6c-4bf4-b4d2-f924cced01b0'::uuid)
  with check (auth.uid() = 'da2bdf1b-1d6c-4bf4-b4d2-f924cced01b0'::uuid);

drop policy if exists "Couple can delete guestbook messages" on public.guestbook_messages;
create policy "Couple can delete guestbook messages"
  on public.guestbook_messages for delete to authenticated
  using (auth.uid() = 'da2bdf1b-1d6c-4bf4-b4d2-f924cced01b0'::uuid);

commit;
