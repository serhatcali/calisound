import { requireAdmin } from '@/lib/admin-auth'
import { getTemplate } from '@/lib/release-planning-service'
import { EditTemplateForm } from '@/components/admin/templates/EditTemplateForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditTemplatePage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()

  try {
    const template = await getTemplate(params.id)
    return <EditTemplateForm template={template} />
  } catch (error) {
    notFound()
  }
}
