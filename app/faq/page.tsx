import { Metadata } from 'next'
import { StructuredData } from '@/components/shared/StructuredData'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export const metadata: Metadata = {
  title: 'FAQ - CALI Sound | Frequently Asked Questions',
  description: 'Frequently asked questions about CALI Sound, Afro House music, DJ sets, and the Global City Series. Find answers to common questions.',
  keywords: [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    'FAQ',
    'questions',
    'help',
  ],
  openGraph: {
    title: 'FAQ - CALI Sound',
    description: 'Frequently asked questions about CALI Sound and the Global Afro House City Series.',
    url: 'https://calisound.com/faq',
  },
  alternates: {
    canonical: 'https://calisound.com/faq',
  },
}

const faqs = [
  {
    question: 'What is CALI Sound?',
    answer: 'CALI Sound is a Global Afro House City Series that brings you city-inspired melodic club music from around the world. Each track represents a different city, capturing its unique energy through Afro House and Afrobeat rhythms.',
  },
  {
    question: 'What is Afro House music?',
    answer: 'Afro House is a genre of electronic dance music that combines traditional African rhythms with modern house music elements. It features deep basslines, percussive elements, and melodic progressions that create an energetic and uplifting sound.',
  },
  {
    question: 'How often do you release new city tracks?',
    answer: 'We regularly release new city tracks as part of our Global Afro House City Series. Follow us on social media to stay updated on the latest releases.',
  },
  {
    question: 'Where can I listen to CALI Sound music?',
    answer: 'You can listen to CALI Sound on all major streaming platforms including Spotify, Apple Music, YouTube Music, SoundCloud, and more. Check our Links page for all available platforms.',
  },
  {
    question: 'Can I use CALI Sound music in my projects?',
    answer: 'For licensing inquiries, please contact us through our Contact page. We\'d be happy to discuss usage rights for your project.',
  },
  {
    question: 'Do you perform live DJ sets?',
    answer: 'Yes! CALI Sound performs live DJ sets featuring our Global City Series. For booking inquiries, please contact us through our Contact page.',
  },
]

export default function FAQPage() {
  // FAQ Structured Data for SEO
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <StructuredData data={faqStructuredData} />
      <div className="min-h-screen bg-white dark:bg-black py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { name: 'Home', url: '/' },
            { name: 'FAQ', url: '/faq' },
          ]} />
          
          <div className="bg-white dark:bg-black rounded-3xl shadow-soft-xl p-8 md:p-12 border border-gray-100 dark:border-gray-900">
            <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-12 text-lg">
              Find answers to common questions about CALI Sound, our music, and the Global Afro House City Series.
            </p>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-colors"
                >
                  <summary className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-orange-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-12 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-900/50">
              <p className="text-gray-900 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Still have questions?</strong>{' '}
                <a href="/contact" className="text-orange-500 hover:text-orange-600 underline">
                  Contact us
                </a>{' '}
                and we'll be happy to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
