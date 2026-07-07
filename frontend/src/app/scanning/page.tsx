'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'

interface ScanResult {
  id: number
  disease_name: string
  status: string
  accuracy: number
  organic_treatment: string
  chemical_treatment: string
  image_url: string | null
}

export default function ScanningPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    setSelectedFile(file)
    setError(null)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileChange(file)
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange(file)
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image to analyze.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/scan/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setResult(response.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          'Failed to analyze the image. Please ensure the backend server is running.'
        )
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const statusColor =
    result?.status === 'Healthy'
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-red-600 bg-red-50 border-red-200'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg rotate-3">
            <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11 -rotate-3">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34A1 1 0 0 0 5.27 22c2.17-2.78 4.45-4.44 8.73-4.81V21a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1c-.45 0-1.25.26-1.5.35A13.07 13.07 0 0 1 17 8z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-3">Plant Disease Scanner</h1>
          <p className="text-gray-600 text-lg">
            Upload a photo of your plant for instant AI-powered disease detection.
          </p>
        </div>

        {!result ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !preview && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-green-500 bg-green-50 scale-[1.02]'
                  : preview
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50 cursor-pointer'
              }`}
            >
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md border-2 border-green-400 object-contain"
                  />
                  <p className="mt-3 text-sm text-green-700 font-medium">
                    ✓ {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">Drag & drop your plant image here</p>
                  <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    JPG, PNG, WEBP supported
                  </span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-full transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Image
              </button>

              {preview && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-5 py-2.5 rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-7 py-2.5 rounded-full shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Analyze Plant
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>
        ) : (
          /* Results Card */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-green-500 animate-in fade-in duration-500">
            <div className="p-8">
              {/* Results Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-9 h-9 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-700">Scan Results</h2>
                <p className="text-gray-500 text-sm mt-1">Detailed analysis of your plant health</p>
              </div>

              {/* Uploaded Image */}
              {preview && (
                <div className="text-center mb-6">
                  <img
                    src={preview}
                    alt="Scanned plant"
                    className="max-h-48 mx-auto rounded-xl shadow-md border-2 border-green-300 object-contain"
                  />
                </div>
              )}

              {/* Result Rows */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Disease Type</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full text-sm border border-amber-200">
                    {result.disease_name}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Detection Accuracy</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full text-sm border border-blue-200">
                    {result.accuracy}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Plant Status</span>
                  <span className={`font-bold px-4 py-1.5 rounded-full text-sm border ${statusColor}`}>
                    {result.status === 'Healthy' ? '✓ ' : '⚠ '}{result.status}
                  </span>
                </div>
              </div>

              {/* Treatment sections */}
              <div className={`mt-6 p-5 rounded-xl border-l-4 ${result.status === 'Healthy' ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                <h4 className={`font-bold mb-3 flex items-center gap-2 ${result.status === 'Healthy' ? 'text-green-700' : 'text-red-700'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Organic Treatment
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{result.organic_treatment}</p>
              </div>

              <div className="mt-4 p-5 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Chemical Treatment
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{result.chemical_treatment}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-8 justify-center">
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Scan Again
                </button>
                <Link
                  href={`/report?id=${result.id}`}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Full Report
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">Analyzing your plant...</p>
              <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
