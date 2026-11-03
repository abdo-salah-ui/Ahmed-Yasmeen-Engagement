-- Rename the existing RSVP table and its related objects without changing any saved responses.
alter table public.wedding_rsvps rename to engagement_rsvps;
alter sequence public.wedding_rsvps_id_seq rename to engagement_rsvps_id_seq;
alter index public.wedding_rsvps_created_at_idx rename to engagement_rsvps_created_at_idx;
alter policy "Visitors can submit wedding RSVPs"
  on public.engagement_rsvps
  rename to "Visitors can submit engagement RSVPs";

