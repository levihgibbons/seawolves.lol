import { redirect } from "next/navigation";

// Full create/edit/delete for announcements now lives on the public
// /announcements page itself (shown to admins only) instead of duplicating
// that UI here — see src/components/AnnouncementsFeed.tsx.
export default function AdminAnnouncementsRedirect() {
  redirect("/announcements");
}
