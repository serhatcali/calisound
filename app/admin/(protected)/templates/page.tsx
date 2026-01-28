import { requireAdmin } from '@/lib/admin-auth'
import { getTemplates } from '@/lib/release-planning-service'
import { TemplatesList } from '@/components/admin/templates/TemplatesList'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  await requireAdmin()

  const templates = await getTemplates()

  return <TemplatesList templates={templates} />
}
