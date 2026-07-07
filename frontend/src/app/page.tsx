import Image from 'next/image'
import Link from 'next/link'

const features = [
  {
    image: 'https://cdn3.saiwa.ai/Blog/plant_disease_detection_using_image_processing_featured_image_5cbddca5_a831_4b39_b9c8_e9b02a914f4c_9818cf5400.jpg',
    badge: 'AI-Powered',
    title: 'Image-based Plant Disease Detection',
    description: 'Accurate and rapid identification of plant diseases using advanced image analysis technology.',
    alt: 'AI analyzing plant leaves for disease detection',
  },
  {
    image: 'https://camo.githubusercontent.com/1bdf0f0577d91db85f8f22e7f8ed20e301498a172302c0d4455b58669114195c/68747470733a2f2f6d656469612e6c6963646e2e636f6d2f646d732f696d6167652f76322f4335313132415145366466527a5633454a74412f61727469636c652d636f7665725f696d6167652d736872696e6b5f3630305f323030302f61727469636c652d636f7665725f696d6167652d736872696e6b5f3630305f323030302f302f313535373738373830353739393f653d3231343734383336343726763d6265746126743d5f33394447695868377236307046704a4176486c756454794652344d726143616e4c325353377532787255',
    badge: 'Smart',
    title: 'Personalized Crop Recommendations',
    description: 'Tailored recommendations for crop management based on detected diseases and plant health.',
    alt: 'Farmer receiving crop recommendations on tablet',
  },
  {
    image: 'https://www.csm.tech/storage/uploads/news/65c1bdcab8b9c1707195850Thumb.jpg',
    badge: 'Easy-to-Use',
    title: 'Farmer-friendly Interface',
    description: 'Intuitive and easy-to-use platform designed for farmers of all technical backgrounds.',
    alt: 'Farmer using mobile app in field',
  },
  {
    image: 'https://orchardly.co/grow/wp-content/uploads/2023/09/ph-1024x587.jpg.webp',
    badge: 'Precision',
    title: 'Soil Nutrient & pH Detection',
    description: 'Enter soil ingredient values and the system classifies soil type and suggests the best crops to grow.',
    alt: 'Soil testing with digital device',
  },
]

const stats = [
  { value: '91.3%', label: 'Accuracy Rate' },
  { value: '10K+', label: 'Farmers Served' },
  { value: '5+', label: 'Plant Diseases' },
  { value: '24/7', label: 'Support' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center text-center text-white"
        style={{
          background: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=2071&q=80') center/cover no-repeat",
          minHeight: '60vh',
          padding: '100px 20px',
        }}
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Empowering Farmers with Smart Plant Disease Detection
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Scan. Detect. Act. Grow healthy crops with confidence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/scanning"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-full text-lg shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all animate-pulse"
              style={{ animationDuration: '2s' }}
            >
              Plant Detection
            </Link>
            <Link
              href="/crop-recommendation"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 font-semibold px-8 py-3.5 rounded-full text-lg transition-all hover:-translate-y-1"
            >
              Crop Recommendation
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {feature.badge}
                </span>
              </div>
              <div className="p-5 flex-1">
                <h5 className="font-semibold text-gray-800 mb-2">{feature.title}</h5>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <h3 className="text-4xl font-bold text-green-600 mb-2">{stat.value}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 pb-16">
        <div
          className="rounded-2xl p-12 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold leading-snug">
            We're on a mission to revolutionize agriculture with technology,
            making farming more efficient and sustainable.
          </h2>
        </div>
      </section>

      {/* CTA Section */}
      <div className="text-center pb-16">
        <Link
          href="/how-to-use"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-4 rounded-full text-lg shadow-md hover:-translate-y-1 hover:shadow-lg transition-all inline-block"
        >
          Learn More
        </Link>
      </div>
    </>
  )
}
