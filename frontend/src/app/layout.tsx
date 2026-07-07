import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'GreenGuardians - Smart Plant Disease Detection',
  description: 'Empowering farmers with smart plant disease detection and crop recommendation technology.',
  icons: {
    icon: 'https://cdn.qwenlm.ai/output/076a6d91-8c80-4fcf-960a-5fd1f188c6cb/t2i/70ef825b-dad5-4ca0-98a8-06d98c496a69/1754742173.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
