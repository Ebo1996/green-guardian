'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

interface ReportData {
  id: number
  disease_name: string
  status: string
  accuracy: number
  organic_treatment: string
  chemical_treatment: string
  image_url: string | null
  created_at: string
}

const demoReport: ReportData = {
  id: 0,
  disease_name: 'Leaf Rust',
  status: 'Infected',
  accuracy: 94.0,
  organic_treatment: 'Bordeaux mixture or sulfur sprays work effectively against Leaf Rust. Improve air circulation and reduce leaf wetness by proper plant spacing and pruning. Remove and dispose of infected plant material.',
  chemical_treatment: 'Triazole fungicides (e.g., Propiconazole) applied preventatively during rainy seasons. Repeat applications every 14 days as needed. Always follow label directions and observe pre-harvest intervals.',
  image_url: null,
  created_at: new Date().toISOString(),
}

const diseaseDescriptions: Record<string, string> = {
  'Leaf Rust': 'Leaf rust is caused by fungal pathogens (Puccinia spp.) that produce orange-brown pustules on leaf surfaces. It spreads rapidly in warm, humid conditions and can significantly reduce crop yield if left untreated.',
  'Phoma': 'Phoma is a fungal disease causing dark, sunken lesions on stems and leaves. It is favored by cool, wet conditions and can cause severe damage to plant tissue. Early intervention is critical.',
  'Miner': 'Leaf miners are larvae of flies, moths, or sawflies that tunnel through leaf tissue, creating distinctive serpentine patterns. Heavy infestations can reduce photosynthesis and weaken plants.',
  'Cercospora': 'Cercospora leaf spot is caused by Cercospora fungi, producing circular brown lesions with lighter centers. It is common in warm, humid climates and can defoliate plants if severe.',
  'Healthy': 'Your plant is in excellent health! No disease symptoms were detected. Continue your current care routine and monitor regularly to maintain this healthy status.',
}

function ReportContent() {
  const searchParams = useSearchParams()
  const scanId = searchParams.get('id')

  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (scanId && scanId !== '0') {
      fetchReport(scanId)
    } else {
      setReport(demoReport)
    }
  }, [scanId])

  const fetchReport = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/scans/${id}/`
      )
      setReport(response.data)
    } catch {
      setError('Could not load report. Showing demo data.')
      setReport(demoReport)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => window.print()

  const handleShare = (platform: string) => {
    const text = `Plant Disease Report from GreenGuardians: ${report?.disease_name} detected with ${report?.accuracy}% accuracy.`
    const url = window.location.href

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    }

    if (urls[platform]) window.open(urls[platform], '_blank')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!report) return null

  const isHealthy = report.status === 'Healthy'
  const description = diseaseDescriptions[report.disease_name] || 'Plant disease detected. Please follow the treatment recommendations below.'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 print:bg-white print:py-4">
      <div className="container mx-auto max-w-3xl">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Demo indicator */}
        {(!scanId || scanId === '0') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm text-center">
            📋 This is a demo report. Scan a plant to generate a real report.
          </div>
        )}

        {/* Report Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1">GreenGuardians Full Report</h1>
            <p className="text-sm opacity-80">Complete diagnosis and treatment plan</p>
            {report.created_at && (
              <p className="text-xs opacity-60 mt-2">{formatDate(report.created_at)}</p>
            )}
          </div>

          <div className="p-8">
            {/* Scanned Image */}
            {report.image_url && (
              <div className="text-center mb-6">
                <img
                  src={report.image_url}
                  alt="Scanned plant"
                  className="max-h-56 mx-auto rounded-xl shadow-md border-2 border-green-200 object-contain"
                />
                <p className="text-xs text-gray-400 mt-2">Submitted plant image</p>
              </div>
            )}

            {/* Detection Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Detection Accuracy</p>
                <p className="text-2xl font-bold text-blue-600">{report.accuracy}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Plant Status</p>
                <p className={`text-lg font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                  {isHealthy ? '✓ Healthy' : '⚠ Infected'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Disease Identified</p>
                <p className="text-lg font-bold text-amber-700">{report.disease_name}</p>
              </div>
            </div>

            {/* Disease Description */}
            <div className={`p-5 rounded-xl border-l-4 mb-5 ${isHealthy ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
              <h4 className={`font-bold mb-2 flex items-center gap-2 ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
                {isHealthy ? '🌿' : '🦠'} {report.disease_name}
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
            </div>

            {/* Treatment Plan */}
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Treatment Plan
            </h3>

            {/* Organic Treatment */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-100 mb-4">
              <h5 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                🌿 Organic Treatment
              </h5>
              <p className="text-gray-700 text-sm leading-relaxed">{report.organic_treatment}</p>
            </div>

            {/* Environmental Management */}
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 mb-4">
              <h5 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                🌱 Environmental Management
              </h5>
              <ul className="text-gray-700 text-sm space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Ensure proper plant spacing to improve air circulation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Avoid overhead irrigation; water at the base of plants
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Remove and destroy infected plant material immediately
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Practice crop rotation to break disease cycles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Monitor regularly and act at early signs of disease
                </li>
              </ul>
            </div>

            {/* Chemical Treatment */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mb-6">
              <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                🧴 Chemical Treatment
              </h5>
              <p className="text-gray-700 text-sm leading-relaxed">{report.chemical_treatment}</p>
              <p className="text-xs text-gray-400 mt-3 italic">
                ⚠ Always read and follow label directions. Use protective equipment when applying chemicals.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Share */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">Share:</span>
                  {[
                    { platform: 'twitter', label: 'X', color: 'bg-gray-900' },
                    { platform: 'facebook', label: 'f', color: 'bg-blue-600' },
                    { platform: 'whatsapp', label: 'W', color: 'bg-green-500' },
                  ].map((s) => (
                    <button
                      key={s.platform}
                      onClick={() => handleShare(s.platform)}
                      className={`${s.color} text-white w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold hover:opacity-80 hover:scale-110 transition-all`}
                      aria-label={`Share on ${s.platform}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Print & Back */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-full transition-all print:hidden"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <Link
                    href="/scanning"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all print:hidden"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Scan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
