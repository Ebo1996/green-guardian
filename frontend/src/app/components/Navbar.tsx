'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/crop-recommendation', label: 'Crop Recommendation' },
    { href: '/recommendation', label: 'Recommendation' },
    { href: '/report', label: 'Report' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-gray-50 border-b border-green-100 py-3'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34A1 1 0 0 0 5.27 22c2.17-2.78 4.45-4.44 8.73-4.81V21a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1c-.45 0-1.25.26-1.5.35A13.07 13.07 0 0 1 17 8z"/>
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-800 group-hover:text-green-600 transition-colors">
            GreenGuardians
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(link.href)
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* CTA Button (desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/scanning"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            Start Scanning
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span
              className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex flex-col gap-1 border-t border-green-100">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/scanning"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-full text-sm text-center shadow-sm"
          >
            Start Scanning
          </Link>
        </div>
      </div>
    </nav>
  )
}
