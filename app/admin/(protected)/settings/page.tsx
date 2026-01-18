import { requireAdmin } from '@/lib/admin-auth'
import { SettingsAdminForm } from '@/components/admin/settings/SettingsAdminForm'

export default async function AdminSettingsPage() {
  await requireAdmin()

  return <SettingsAdminForm />
}
