'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import jsPDF from 'jspdf'

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

// Keys match the MobileNetV2 model's id2label exactly (38 PlantVillage classes)
const diseaseDescriptions: Record<string, string> = {
  'Apple Scab': 'Apple scab is caused by the fungus Venturia inaequalis, creating dark, scaly lesions on leaves and fruit. It thrives in cool, wet spring weather and can cause significant fruit damage and defoliation.',
  'Apple with Black Rot': 'Black rot is caused by Botryosphaeria obtusa, producing brown rotted areas on fruit and frog-eye leaf spots. Infected mummified fruit and dead wood are the primary sources of inoculum.',
  'Cedar Apple Rust': 'Cedar apple rust is caused by Gymnosporangium juniperi-virginianae, requiring both apple/crabapple and juniper/cedar hosts to complete its life cycle. It produces bright orange lesions on apple leaves.',
  'Healthy Apple': 'Your apple tree is in excellent health! Continue regular pruning for good air circulation, maintain orchard sanitation, and monitor for early signs of scab or rust at bud break.',
  'Healthy Blueberry Plant': 'Your blueberry plant is healthy! Maintain acidic soil (pH 4.5–5.5), apply mulch to conserve moisture, and monitor regularly for mummy berry and botrytis during flowering.',
  'Cherry with Powdery Mildew': 'Cherry powdery mildew is caused by Podosphaera clandestina, producing white powdery growth on young leaves, shoots, and fruit. It is favored by warm days and cool nights with high humidity.',
  'Healthy Cherry Plant': 'Your cherry tree is healthy! Remove mummified fruit after harvest, maintain good pruning practices for air circulation, and apply dormant copper spray before bud swell next season.',
  'Corn (Maize) with Cercospora and Gray Leaf Spot': 'Gray leaf spot, caused by Cercospora zeae-maydis, produces rectangular tan-to-gray lesions parallel to leaf veins. It is favored by warm, humid conditions and infected crop residue left in the field.',
  'Corn (Maize) with Common Rust': 'Common rust is caused by Puccinia sorghi, producing cinnamon-brown powdery pustules on both leaf surfaces. It spreads rapidly in cool, moist conditions with heavy dew.',
  'Corn (Maize) with Northern Leaf Blight': 'Northern leaf blight, caused by Exserohilum turcicum, produces long elliptical gray-green to tan lesions on leaves. Severe infections can cause significant yield loss by reducing photosynthetic area.',
  'Healthy Corn (Maize) Plant': 'Your corn crop is healthy! Maintain balanced nitrogen fertilization, scout regularly at tasseling, and rotate with non-grass crops to reduce disease carryover in residue.',
  'Grape with Black Rot': 'Grape black rot is caused by Guignardia bidwellii, producing brown circular leaf spots and shriveling berries into hard black mummies. It is most destructive during warm, wet weather from bloom through harvest.',
  'Grape with Esca (Black Measles)': 'Esca is a complex wood disease involving multiple fungal pathogens that colonize grapevine wood. It causes tiger-stripe leaf symptoms and black spotting on berries. No effective cure exists once the vine is infected.',
  'Grape with Isariopsis Leaf Spot': 'Isariopsis leaf spot (Leaf blight) causes angular brown lesions on upper leaf surfaces with gray-brown sporulation underneath. It typically occurs later in the season and can cause premature defoliation.',
  'Healthy Grape Plant': 'Your grape vine is healthy! Maintain proper canopy management for air circulation, remove dropped leaves after harvest, and apply preventive copper spray at bud swell next season.',
  'Orange with Citrus Greening': 'Citrus greening (Huanglongbing/HLB) is a devastating bacterial disease spread by the Asian citrus psyllid. It causes blotchy mottling of leaves, lopsided bitter fruit, and eventually tree death. There is currently no cure.',
  'Peach with Bacterial Spot': 'Bacterial spot of peach is caused by Xanthomonas arboricola pv. pruni, producing water-soaked angular leaf spots that turn brown and fall out. It can cause severe defoliation and fruit spotting in warm, wet conditions.',
  'Healthy Peach Plant': 'Your peach tree is healthy! Thin fruit for good air circulation, keep up with dormant pruning, and apply a copper spray before bloom for preventive bacterial spot protection.',
  'Bell Pepper with Bacterial Spot': 'Bacterial spot of pepper is caused by Xanthomonas euvesicatoria, producing small water-soaked lesions that enlarge and turn brown with yellow halos. It spreads rapidly during warm, rainy weather.',
  'Healthy Bell Pepper Plant': 'Your pepper plant is healthy! Water at the base to keep foliage dry, ensure good air circulation, and monitor for aphids which can transmit viral diseases.',
  'Potato with Early Blight': 'Early blight of potato is caused by Alternaria solani, producing dark concentric ring "bullseye" lesions on lower leaves first. It is most severe on stressed plants and in warm, humid conditions.',
  'Potato with Late Blight': 'Potato late blight, caused by Phytophthora infestans, was responsible for the Irish Famine. It produces dark, water-soaked lesions on leaves and stems that expand rapidly, and can rot tubers within days under cool, wet conditions.',
  'Healthy Potato Plant': 'Your potato plant is healthy! Monitor closely during cool wet weather when late blight is most threatening. Use certified disease-free seed potatoes and practice crop rotation.',
  'Healthy Raspberry Plant': 'Your raspberry canes are healthy! Prune out all two-year-old canes after fruiting, remove dead canes to improve air circulation, and apply lime sulfur spray during dormancy.',
  'Healthy Soybean Plant': 'Your soybean crop is healthy! Rotate with non-legume crops to reduce soil-borne disease pressure, maintain balanced nutrition, and scout at R1–R3 growth stage for frogeye leaf spot.',
  'Squash with Powdery Mildew': 'Squash powdery mildew is caused by Podosphaera xanthii and Erysiphe cichoracearum, producing white powdery patches on leaf surfaces. Unlike most fungal diseases, it thrives in warm, dry conditions with high humidity.',
  'Strawberry with Leaf Scorch': 'Strawberry leaf scorch is caused by Diplocarpon earlianum, producing irregular purple-to-red spots on upper leaf surfaces that coalesce and give a "scorched" appearance. Severe infections cause leaf death and reduce yields.',
  'Healthy Strawberry Plant': 'Your strawberry plants are healthy! Renovate beds after harvest by mowing foliage, apply fresh mulch, and remove old leaves to prevent disease carry-over into the next season.',
  'Tomato with Bacterial Spot': 'Tomato bacterial spot is caused by Xanthomonas species, producing small dark water-soaked lesions on leaves, stems, and fruit. It is most destructive in warm, wet weather and spreads rapidly through rain splash.',
  'Tomato with Early Blight': 'Tomato early blight, caused by Alternaria solani, produces dark bullseye-patterned lesions on lower leaves first. It thrives in warm, humid weather and spreads upward through the canopy, reducing photosynthesis.',
  'Tomato with Late Blight': 'Tomato late blight is caused by Phytophthora infestans, producing dark, greasy-looking lesions on leaves and brown firm rotted areas on fruit. It spreads explosively in cool, wet conditions and must be treated immediately.',
  'Tomato with Leaf Mold': 'Tomato leaf mold is caused by Passalora fulva, producing pale green-to-yellow patches on upper leaf surfaces with olive-brown velvety sporulation beneath. It is common in high-humidity greenhouse and tunnel conditions.',
  'Tomato with Septoria Leaf Spot': 'Septoria leaf spot, caused by Septoria lycopersici, produces small circular lesions with dark borders and lighter centers on lower leaves. It is one of the most common tomato foliage diseases in humid climates.',
  'Tomato with Spider Mites or Two-spotted Spider Mite': 'Two-spotted spider mites (Tetranychus urticae) pierce plant cells to feed, causing stippled, bronzed foliage. Severe infestations produce fine webbing and can cause leaf drop. They thrive in hot, dry, dusty conditions.',
  'Tomato with Target Spot': 'Target spot of tomato is caused by Corynespora cassiicola, producing concentric ring lesions resembling a target on leaves, stems, and fruit. It is favored by warm temperatures and high humidity.',
  'Tomato Yellow Leaf Curl Virus': 'Tomato yellow leaf curl virus (TYLCV) is transmitted by silverleaf whiteflies (Bemisia tabaci). Infected plants show upward leaf curling, yellowing, stunting, and severe fruit set reduction. There is no cure once infected.',
  'Tomato Mosaic Virus': 'Tomato mosaic virus (ToMV) causes mottled light and dark green mosaic patterns on leaves, distortion, and reduced fruit size. It spreads easily via contaminated tools, hands, and plant-to-plant contact.',
  'Healthy Tomato Plant': 'Your tomato plant is in excellent health! Maintain proper spacing for air circulation, water at the base to keep foliage dry, stake plants to prevent soil contact, and monitor weekly for early disease signs.',
}

function ReportContent() {
  const searchParams = useSearchParams()
  const scanId = searchParams.get('id')

  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (scanId) {
      fetchReport(scanId)
    } else {
      setError('No scan ID provided. Please scan a plant first.')
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
      setError('Could not load report from the server. The backend may be offline or this report no longer exists.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    if (!report) return
    
    const csvData = [
      ['Field', 'Value'],
      ['Scan ID', report.id.toString()],
      ['Disease Name', report.disease_name],
      ['Status', report.status],
      ['Accuracy', `${report.accuracy}%`],
      ['Scan Date', report.created_at ? new Date(report.created_at).toISOString() : 'N/A'],
      ['Description', diseaseDescriptions[report.disease_name] || ''],
      ['Organic Treatment', report.organic_treatment],
      ['Chemical Treatment', report.chemical_treatment],
    ]
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `green-guardians-report-${report.id}.csv`
    link.click()
  }

  const handleExportPDF = () => {
    if (!report) return
    
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const lineHeight = 7
    let yPos = 20
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('GreenGuardians Report', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${report.created_at ? formatDate(report.created_at) : 'N/A'}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 15
    
    // Summary Box
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F')
    yPos += 8
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Disease: ${report.disease_name}`, margin + 5, yPos)
    yPos += 7
    doc.text(`Status: ${report.status}`, margin + 5, yPos)
    yPos += 7
    doc.text(`Accuracy: ${report.accuracy}%`, margin + 5, yPos)
    yPos += 15
    
    // Description
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Description', margin, yPos)
    yPos += 7
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const description = diseaseDescriptions[report.disease_name] || 'No description available.'
    const descLines = doc.splitTextToSize(description, pageWidth - 2 * margin)
    doc.text(descLines, margin, yPos)
    yPos += descLines.length * lineHeight + 5
    
    // Organic Treatment
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Organic Treatment', margin, yPos)
    yPos += 7
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const organicLines = doc.splitTextToSize(report.organic_treatment, pageWidth - 2 * margin)
    doc.text(organicLines, margin, yPos)
    yPos += organicLines.length * lineHeight + 5
    
    // Chemical Treatment
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Chemical Treatment', margin, yPos)
    yPos += 7
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const chemicalLines = doc.splitTextToSize(report.chemical_treatment, pageWidth - 2 * margin)
    doc.text(chemicalLines, margin, yPos)
    yPos += chemicalLines.length * lineHeight + 10
    
    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Generated by GreenGuardians AI Plant Disease Detection', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
    
    doc.save(`green-guardians-report-${report.id}.pdf`)
  }

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

  // Error state — no mock fallback, direct user to scan
  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Report Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'No scan data available. Please scan a plant to generate a real report.'}</p>
          <Link
            href="/scanning"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Scan a Plant Now
          </Link>
        </div>
      </div>
    )
  }

  const isHealthy = report.status === 'Healthy'
  const description = diseaseDescriptions[report.disease_name] || 'Plant disease detected. Please follow the treatment recommendations below.'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 print:bg-white print:py-4">
      <div className="container mx-auto max-w-3xl">
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
                <p className="text-sm font-bold text-amber-700">{report.disease_name}</p>
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
                {[
                  'Ensure proper plant spacing to improve air circulation',
                  'Avoid overhead irrigation; water at the base of plants',
                  'Remove and destroy infected plant material immediately',
                  'Practice crop rotation to break disease cycles',
                  'Monitor regularly and act at early signs of disease',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">Share:</span>
                  {[
                    { platform: 'twitter',   label: 'X', color: 'bg-gray-900' },
                    { platform: 'facebook',  label: 'f', color: 'bg-blue-600' },
                    { platform: 'whatsapp',  label: 'W', color: 'bg-green-500' },
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
                <div className="flex gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-full transition-all print:hidden"
                    title="Export as CSV"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-full transition-all print:hidden"
                    title="Export as PDF"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-full transition-all print:hidden"
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
