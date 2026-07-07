import Link from 'next/link'

const diseases = [
  {
    name: 'Phoma',
    status: 'Affected',
    accuracy: '92%',
    description: 'Phoma is a fungal disease that causes dark, sunken lesions on stems and leaves. It thrives in wet and cool conditions.',
    organic: 'Apply copper-based fungicides or baking soda solution. Remove and destroy infected plant parts. Improve drainage and avoid overhead irrigation.',
    chemical: 'Use systemic fungicides like Triazoles or Strobilurins. Follow manufacturer instructions carefully and rotate fungicide classes to prevent resistance.',
    color: 'red',
  },
  {
    name: 'Miner',
    status: 'Affected',
    accuracy: '87%',
    description: 'Leaf miners are larvae of insects that create winding tunnels (mines) through leaf tissue, causing characteristic serpentine patterns.',
    organic: 'Neem oil spray or introduce natural predators like parasitic wasps. Remove heavily infested leaves and dispose away from the garden.',
    chemical: 'Apply Abamectin or Spinosad-based insecticides. Rotate chemicals to prevent resistance. Apply in early morning or evening.',
    color: 'orange',
  },
  {
    name: 'Leaf Rust',
    status: 'Affected',
    accuracy: '95%',
    description: 'Leaf rust is caused by fungal pathogens that produce orange-brown pustules on leaves. It spreads rapidly in warm, humid conditions.',
    organic: 'Bordeaux mixture or sulfur sprays work effectively. Improve air circulation and reduce leaf wetness by proper plant spacing and pruning.',
    chemical: 'Triazole fungicides (e.g., Propiconazole) applied preventatively during rainy seasons. Repeat applications every 14 days as needed.',
    color: 'amber',
  },
  {
    name: 'Cercospora',
    status: 'Affected',
    accuracy: '89%',
    description: 'Cercospora leaf spot causes circular to irregularly-shaped brown lesions with lighter centers and darker borders on leaves.',
    organic: 'Copper fungicides or potassium bicarbonate applied at first signs. Prune to improve air circulation and avoid wetting foliage during irrigation.',
    chemical: 'Chlorothalonil or Mancozeb applied at first signs of disease, repeat every 10-14 days. Ensure thorough coverage of all leaf surfaces.',
    color: 'purple',
  },
  {
    name: 'Healthy',
    status: 'Unaffected',
    accuracy: '98%',
    description: 'Plant is healthy with no signs of disease. Continue good agricultural practices to maintain plant health and productivity.',
    organic: 'Maintain good cultural practices: proper spacing, balanced nutrition with compost, regular monitoring, and watering at the base of plants.',
    chemical: 'No chemical treatment needed. Focus on preventive measures such as crop rotation, resistant varieties, and maintaining plant health.',
    color: 'green',
  },
]

const colorMap: Record<string, { header: string; badge: string; border: string; icon: string; sectionBorder: string; sectionBg: string }> = {
  red: {
    header: 'bg-red-700',
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-t-red-500',
    icon: '🦠',
    sectionBorder: 'border-red-400',
    sectionBg: 'bg-red-50',
  },
  orange: {
    header: 'bg-orange-600',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    border: 'border-t-orange-500',
    icon: '🐛',
    sectionBorder: 'border-orange-400',
    sectionBg: 'bg-orange-50',
  },
  amber: {
    header: 'bg-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    border: 'border-t-amber-500',
    icon: '🍂',
    sectionBorder: 'border-amber-400',
    sectionBg: 'bg-amber-50',
  },
  purple: {
    header: 'bg-purple-700',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    border: 'border-t-purple-500',
    icon: '🔵',
    sectionBorder: 'border-purple-400',
    sectionBg: 'bg-purple-50',
  },
  green: {
    header: 'bg-green-600',
    badge: 'bg-green-100 text-green-700 border-green-200',
    border: 'border-t-green-500',
    icon: '✅',
    sectionBorder: 'border-green-400',
    sectionBg: 'bg-green-50',
  },
}

export default function RecommendationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 110-16 8 8 0 010 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-3">Disease Recommendations</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive disease identification guide with organic and chemical treatment options for each condition.
          </p>
        </div>

        {/* Disease Cards */}
        <div className="space-y-6">
          {diseases.map((disease) => {
            const c = colorMap[disease.color]
            return (
              <div
                key={disease.name}
                className={`bg-white rounded-2xl shadow-md overflow-hidden border-t-4 ${c.border} hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
              >
                {/* Card Header */}
                <div className={`${c.header} text-white p-5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">{disease.name}</h3>
                        <p className="text-sm opacity-80">Detection Accuracy: {disease.accuracy}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${
                      disease.status === 'Unaffected'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-white/20 text-white border-white/40'
                    }`}>
                      {disease.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{disease.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Organic Treatment */}
                    <div className={`p-4 rounded-xl border-l-4 ${c.sectionBorder} ${c.sectionBg}`}>
                      <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                        🌿 Organic Treatment
                      </h5>
                      <p className="text-gray-600 text-sm leading-relaxed">{disease.organic}</p>
                    </div>

                    {/* Chemical Treatment */}
                    <div className="p-4 rounded-xl border-l-4 border-blue-400 bg-blue-50">
                      <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                        🧴 Chemical Treatment
                      </h5>
                      <p className="text-gray-600 text-sm leading-relaxed">{disease.chemical}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Back Button */}
        <div className="text-center mt-10">
          <Link
            href="/scanning"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-full shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Scan
          </Link>
        </div>
      </div>
    </div>
  )
}
