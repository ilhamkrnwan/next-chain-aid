import { redirect } from "next/navigation"

export default function PendingOrganisasiPage() {
  // Redirect to main organisasi page with pending filter
  redirect("/admin/organisasi?status=pending")
}
