'use client'

import { useState } from 'react'
import Link from 'next/link'

const steps = [
  {
    number: 1,
    title: 'Take a Photo',
    image: 'https://helios-i.mashable.com/imagery/articles/00IdsOeeRxXUbOUZsaljJ8W/hero-image.fill.size_1248x702.v1682099374.png',
    description: 'Capture a clear, well-lit photo of the affected plant part (leaf, stem, or fruit). Make sure the diseased area is visible and in focus.',
    details: [
      'Use natural daylight for best results',
      'Focus on the affected area of the plant',
      'Capture both sides of the leaf if possible',
      'Avoid blurry or dark images',
      'Supported formats: JPG, PNG, WEBP',
    ],
    icon: '📸',
    color: 'from-blue-500 to-blue-600',
    lightColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    number: 2,
    title: 'Let AI Analyze',
    image: 'https://cdn3.saiwa.ai/Blog/plant_disease_detection_using_image_processing_featured_image_5cbddca5_a831_4b39_b9c8_e9b02a914f4c_9818cf5400.jpg',
    description: 'Our advanced AI model processes your image to identify plant diseases. The system analyzes visual patterns and compares against thousands of disease signatures.',
    details: [
      'Deep learning model with 91.3% accuracy',
      'Detects: Phoma, Leaf Rust, Miner, Cercospora',
      'Analysis completes in seconds',
      'Identifies 5+ disease conditions',
      'Works on coffee, wheat, maize & more',
    ],
    icon: '🤖',
    color: 'from-purple-500 to-purple-600',
    lightColor: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-700',
  },
  {
    number: 3,
    title: 'View Results',
    image: 'https://www.csm.tech/storage/uploads/news/65c1bdcab8b9c1707195850Thumb.jpg',
    description: 'Receive a detailed diagnosis including disease type, detection accuracy percentage, and plant health status (Healthy or Infected) instantly.',
    details: [
      'Disease name and description',
      'Confidence/accuracy percentage',
      'Plant health status indicator',
      'Visual result summary card',
      'Instant results on your device',
    ],
    icon: '📊',
    color: 'from-green-500 to-green-600',
    lightColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
  },
  {
    number: 4,
    title: 'Get Treatment Advice',
    image: 'https://orchardly.co/grow/wp-content/uploads/2023/09/ph-1024x587.jpg.webp',
    description: 'Receive both organic and chemical treatment recommendations tailored to the detected disease. Get a full PDF-ready report for your records.',
    details: [
      'Organic treatment options listed first',
      'Chemical treatments with dosage guidance',
      'Environmental management tips',
      'Full printable/shareable report',
      'Available in EN / AM / OM languages',
    ],
    icon: '💊',
    color: 'from-amber-500 to-amber-600',
    lightColor: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-700',
  },
]

const languages = ['EN', 'AM', 'OM']

export default function HowToUsePage() {
  const [activeLang, setActiveLang] = useState('EN')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Language Switcher */}
        <div className="flex justify-end mb-6 gap-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                activeLang === lang
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-white text-green-700 border-green-400 hover:bg-green-50'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 110-16 8 8 0 010 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-3">How to Use GreenGuardians</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Follow these 4 simple steps to detect plant diseases and get actionable treatment advice for your crops.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${
                index % 2 === 0 ? '' : ''
              }`}
            >
              {/* Step header bar */}
              <div className={`bg-gradient-to-r ${step.color} p-1`} />

              <div className={`p-8 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''} flex flex-col md:flex-row gap-8 items-center`}>
                {/* Image */}
                <div className="md:w-2/5 flex-shrink-0">
                  <div className="relative rounded-xl overflow-hidden shadow-md aspect-video">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 left-3 w-10 h-10 bg-gradient-to-br ${step.color} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-3/5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{step.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-800">
                      <span className="text-green-600">Step {step.number}:</span> {step.title}
                    </h2>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-5">{step.description}</p>

                  {/* Technical Details */}
                  <div className={`rounded-xl p-4 border ${step.lightColor}`}>
                    <h5 className={`font-bold mb-3 text-sm uppercase tracking-wide ${step.textColor}`}>
                      Key Details
                    </h5>
                    <ul className="space-y-1.5">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm text-gray-700">
                          <svg className={`w-4 h-4 flex-shrink-0 ${step.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-14 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-green-100 mb-6 text-lg">
            Scan your first plant now and get instant disease detection results.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/scanning"
              className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-3.5 rounded-full shadow-md hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              🌿 Start Scanning
            </Link>
            <Link
              href="/crop-recommendation"
              className="bg-green-500 hover:bg-green-400 text-white border-2 border-green-400 font-bold px-8 py-3.5 rounded-full shadow-md hover:-translate-y-1 transition-all"
            >
              🌾 Crop Recommendation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
