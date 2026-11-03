-- Rename the existing RSVP table and related database objects without changing saved responses.
alter table public.wedding_rsvps rename to engagement_rsvps;
alter sequence public.wedding_rsvps_id_seq rename to engagement_rsvps_id_seq;
alter table public.engagement_rsvps rename constraint wedding_rsvps_attendance_check to engagement_rsvps_attendance_check;
alter table public.engagement_rsvps rename constraint wedding_rsvps_guest_count_check to engagement_rsvps_guest_count_check;
alter table public.engagement_rsvps rename constraint wedding_rsvps_guest_name_check to engagement_rsvps_guest_name_check;
alter table public.engagement_rsvps rename constraint wedding_rsvps_note_check to engagement_rsvps_note_check;
alter table public.engagement_rsvps rename constraint wedding_rsvps_pkey to engagement_rsvps_pkey;
alter index public.wedding_rsvps_created_at_idx rename to engagement_rsvps_created_at_idx;
alter policy "Visitors can submit wedding RSVPs"
  on public.engagement_rsvps
  rename to "Visitors can submit engagement RSVPs";