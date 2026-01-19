import { Metadata } from 'next'
import Link from 'next/link'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calisound.music'

export const metadata: Metadata = {
  title: 'Cookie Policy - CALI Sound',
  description: 'Learn about how CALI Sound uses cookies and how to manage your preferences. Our cookie policy explains what cookies we use and how you can control them.',
  keywords: [
    'calisound',
    'cookie policy',
    'privacy',
    'data protection',
  ],
  openGraph: {
    title: 'Cookie Policy - CALI Sound',
    description: 'Learn about how CALI Sound uses cookies and how to manage your preferences.',
    url: `${baseUrl}/cookie-policy`,
  },
  alternates: {
    canonical: `${baseUrl}/cookie-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-black rounded-3xl shadow-soft-xl p-8 md:p-12 border border-gray-100 dark:border-gray-900">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Cookie Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                What Are Cookies?
              </h2>
              <p className="text-white dark:text-gray-300 mb-4">
                Cookies are small text files that are placed on your device when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to the site owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                How We Use Cookies
              </h2>
              <p className="text-white dark:text-gray-300 mb-4">
                CALI Sound uses cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-white dark:text-gray-300 space-y-2 mb-4">
                <li>
                  <strong>Necessary Cookies:</strong> These cookies are essential for the website to function properly. 
                  They enable basic functions like page navigation and access to secure areas of the website.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website 
                  by collecting and reporting information anonymously.
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> These cookies are used to deliver personalized advertisements 
                  and track campaign performance.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Managing Your Cookie Preferences
              </h2>
              <p className="text-white dark:text-gray-300 mb-4">
                You can manage your cookie preferences at any time by:
              </p>
              <ul className="list-disc pl-6 text-white dark:text-gray-300 space-y-2 mb-4">
                <li>Clicking on the cookie consent banner when it appears</li>
                <li>Adjusting your browser settings to block or delete cookies</li>
                <li>Contacting us if you have questions about our cookie usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Third-Party Cookies
              </h2>
              <p className="text-white dark:text-gray-300 mb-4">
                Some cookies on our website are set by third-party services such as:
              </p>
              <ul className="list-disc pl-6 text-white dark:text-gray-300 space-y-2 mb-4">
                <li>YouTube (for embedded videos)</li>
                <li>Social media platforms (for sharing features)</li>
                <li>Analytics services (if enabled)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Contact Us
              </h2>
              <p className="text-white dark:text-gray-300 mb-4">
                If you have any questions about our use of cookies, please{' '}
                <Link href="/contact" className="text-orange-500 hover:text-orange-600 underline">
                  contact us
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
