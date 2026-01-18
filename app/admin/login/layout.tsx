// Separate layout for login page to avoid admin layout
// Force dynamic rendering since we don't need static generation for login
export const dynamic = 'force-dynamic'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
