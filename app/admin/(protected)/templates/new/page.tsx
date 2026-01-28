import { requireAdmin } from '@/lib/admin-auth'
import { NewTemplateForm } from '@/components/admin/templates/NewTemplateForm'

export const dynamic = 'force-dynamic'

export default async function NewTemplatePage() {
  await requireAdmin()

  return <NewTemplateForm />
}
