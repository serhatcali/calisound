import { requireAdmin } from '@/lib/admin-auth'
import { ContactsAdminList } from '@/components/admin/contacts/ContactsAdminList'

export default async function AdminContactsPage() {
  await requireAdmin()

  return <ContactsAdminList />
}
