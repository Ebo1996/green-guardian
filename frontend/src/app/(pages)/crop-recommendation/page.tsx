'use client'

import { useState } from 'react'
import axios from 'axios'

interface CropResult {
  recommended_crop: string
  description: string
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
  confidence?: number
  model?: string
}

interface FormState {
  nitrogen: string
  phosphorus: string
  potassium: string
  rainfall: string
  humidity: string
  temperature: string
  ph: string
}

const initialForm: FormState = {
  nitrogen: '',
  phosphorus: '',
  potassium: '',
  rainfall: '',
  humidity: '',
  temperature: '',
  ph: '',
}

// All 22 crops from the Kaggle Crop Recommendation Dataset
const cropEmojis: Record<string, string> = {
  rice:        '🌾',
  maize:       '🌽',
  chickpea:    '🫘',
  kidneybeans: '🫘',
  pigeonpeas:  '🌿',
  mothbeans:   '🌱',
  mungbean:    '🌱',
  blackgram:   '🌑',
  lentil:      '🟤',
  pomegranate: '🍎',
  banana:      '🍌',
  mango:       '🥭',
  grapes:      '🍇',
  watermelon:  '🍉',
  muskmelon:   '🍈',
  apple:       '🍏',
  orange:      '🍊',
  papaya:      '🧡',
  coconut:     '🥥',
  cotton:      '🤍',
  jute:        '🪢',
  coffee:      '☕',
  // keep original casing variants as fallback
  Rice:        '🌾',
  Maize:       '🌽',
  Wheat:       '🌾',
  Soybean:     '🫘',
  Barley:      '🌿',
}

export default function CropRecommendationPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CropResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {}

    // Nitrogen validation (typical range: 0-140 kg/ha)
    if (!form.nitrogen.trim()) {
      newErrors.nitrogen = 'Nitrogen value is required'
    } else if (isNaN(Number(form.nitrogen)) || Number(form.nitrogen) < 0) {
      newErrors.nitrogen = 'Please enter a valid positive number'
    } else if (Number(form.nitrogen) > 200) {
      newErrors.nitrogen = 'Nitrogen value seems too high (typical range: 0-140 kg/ha)'
    }

    // Phosphorus validation (typical range: 5-145 kg/ha)
    if (!form.phosphorus.trim()) {
      newErrors.phosphorus = 'Phosphorus value is required'
    } else if (isNaN(Number(form.phosphorus)) || Number(form.phosphorus) < 0) {
      newErrors.phosphorus = 'Please enter a valid positive number'
    } else if (Number(form.phosphorus) > 200) {
      newErrors.phosphorus = 'Phosphorus value seems too high (typical range: 5-145 kg/ha)'
    }

    // Potassium validation (typical range: 5-205 kg/ha)
    if (!form.potassium.trim()) {
      newErrors.potassium = 'Potassium value is required'
    } else if (isNaN(Number(form.potassium)) || Number(form.potassium) < 0) {
      newErrors.potassium = 'Please enter a valid positive number'
    } else if (Number(form.potassium) > 250) {
      newErrors.potassium = 'Potassium value seems too high (typical range: 5-205 kg/ha)'
    }

    // Rainfall validation (typical range: 20-300 mm)
    if (!form.rainfall.trim()) {
      newErrors.rainfall = 'Rainfall value is required'
    } else if (isNaN(Number(form.rainfall)) || Number(form.rainfall) < 0) {
      newErrors.rainfall = 'Please enter a valid positive number'
    } else if (Number(form.rainfall) > 400) {
      newErrors.rainfall = 'Rainfall value seems too high (typical range: 20-300 mm)'
    }

    // Humidity validation (0-100%)
    if (!form.humidity.trim()) {
      newErrors.humidity = 'Humidity value is required'
    } else if (isNaN(Number(form.humidity))) {
      newErrors.humidity = 'Please enter a valid number'
    } else {
      const humidityVal = Number(form.humidity)
      if (humidityVal < 0 || humidityVal > 100) {
        newErrors.humidity = 'Humidity must be between 0 and 100%'
      }
    }

    // Temperature validation (typical range: 8-43°C)
    if (!form.temperature.trim()) {
      newErrors.temperature = 'Temperature value is required'
    } else if (isNaN(Number(form.temperature))) {
      newErrors.temperature = 'Please enter a valid number'
    } else {
      const tempVal = Number(form.temperature)
      if (tempVal < -10 || tempVal > 60) {
        newErrors.temperature = 'Temperature value seems unusual (typical range: 8-43°C)'
      }
    }

    // pH validation (0-14)
    if (!form.ph.trim()) {
      newErrors.ph = 'pH value is required'
    } else if (isNaN(Number(form.ph))) {
      newErrors.ph = 'Please enter a valid number'
    } else {
      const phVal = Number(form.ph)
      if (phVal < 0 || phVal > 14) {
        newErrors.ph = 'pH must be between 0 and 14'
      } else if (phVal < 3.5 || phVal > 9.5) {
        newErrors.ph = 'pH value is extreme (typical agricultural range: 3.5-9.5)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Allow empty string, numbers, and decimal point
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setForm((prev) => ({ ...prev, [name]: value }))
      if (errors[name as keyof FormState]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setApiError(null)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/crop-recommend/`,
        {
          nitrogen: Number(form.nitrogen),
          phosphorus: Number(form.phosphorus),
          potassium: Number(form.potassium),
          temperature: Number(form.temperature),
          humidity: Number(form.humidity),
          ph: Number(form.ph),
          rainfall: Number(form.rainfall),
        }
      )
      setResult(response.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.error ||
          'Failed to get recommendation. Please ensure the backend server is running.'
        )
      } else {
        setApiError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setForm(initialForm)
    setErrors({})
    setResult(null)
    setApiError(null)
  }

  const InputField = ({
    label,
    name,
    placeholder,
    unit,
  }: {
    label: string
    name: keyof FormState
    placeholder: string
    unit?: string
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {unit && <span className="text-gray-400 font-normal text-xs">({unit})</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          type="text"
          name={name}
          value={form[name]}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          inputMode="decimal"
          autoComplete="off"
          className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 hover:-translate-y-0.5 hover:shadow-md ${
            errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-9v-4l4 4-4 4V9z"/>
              <path d="M11 7h2v10h-2z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-3">Crop Recommendation</h1>
          <p className="text-gray-600 text-lg">
            Enter your soil and environmental data to get the best crop suggestion.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Soil Nutrients */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">🧪</span>
                  Soil Nutrients
                </h3>
                <div className="space-y-4">
                  <InputField label="Nitrogen (N)" name="nitrogen" placeholder="e.g. 90" unit="kg/ha" />
                  <InputField label="Phosphorus (P)" name="phosphorus" placeholder="e.g. 42" unit="kg/ha" />
                  <InputField label="Potassium (K)" name="potassium" placeholder="e.g. 43" unit="kg/ha" />
                </div>
              </div>

              {/* Environmental Factors */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">🌦</span>
                  Environmental Factors
                </h3>
                <div className="space-y-4">
                  <InputField label="Rainfall" name="rainfall" placeholder="e.g. 800" unit="mm" />
                  <InputField label="Humidity" name="humidity" placeholder="e.g. 65" unit="%" />
                  <InputField label="Temperature" name="temperature" placeholder="e.g. 22" unit="°C" />
                  <InputField label="Soil pH" name="ph" placeholder="e.g. 6.5" unit="0–14" />
                </div>
              </div>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {apiError}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 justify-center">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-7 py-3 rounded-full transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-full shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Getting Recommendation...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Get Recommendation
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Result Card */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-green-500">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center text-white">
              <div className="text-6xl mb-3">{cropEmojis[result.recommended_crop] || cropEmojis[result.recommended_crop.toLowerCase()] || '🌱'}</div>
              <h2 className="text-3xl font-bold mb-1">Recommended Crop</h2>
              <div className="text-5xl font-extrabold mt-2 capitalize">{result.recommended_crop}</div>
              {result.confidence !== undefined && (
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {result.confidence}% AI Confidence
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="bg-green-50 rounded-xl p-5 border border-green-100 mb-6">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About {result.recommended_crop}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{result.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Soil Summary */}
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <h5 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                    🧪 Soil Analysis
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nitrogen (N)</span>
                      <span className="font-semibold text-gray-800">{result.nitrogen} kg/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phosphorus (P)</span>
                      <span className="font-semibold text-gray-800">{result.phosphorus} kg/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potassium (K)</span>
                      <span className="font-semibold text-gray-800">{result.potassium} kg/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Soil pH</span>
                      <span className="font-semibold text-gray-800">{result.ph}</span>
                    </div>
                  </div>
                </div>

                {/* Environmental Summary */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    🌦 Environmental Data
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature</span>
                      <span className="font-semibold text-gray-800">{result.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity</span>
                      <span className="font-semibold text-gray-800">{result.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rainfall</span>
                      <span className="font-semibold text-gray-800">{result.rainfall} mm</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-7 py-3 rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">Analyzing soil conditions...</p>
              <p className="text-gray-400 text-sm mt-1">Finding the best crop for you</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
