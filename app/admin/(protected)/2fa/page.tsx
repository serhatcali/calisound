import { Metadata } from 'next'
import { TwoFactorSettings } from '@/components/admin/2fa/TwoFactorSettings'

export const metadata: Metadata = {
  title: '2FA Settings - Admin | CALI Sound',
  description: 'Manage two-factor authentication',
}

export default function TwoFactorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Two-Factor Authentication
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Secure your admin account with 2FA
        </p>
      </div>
      <TwoFactorSettings />
    </div>
  )
}
