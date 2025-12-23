// src/app/pages/Home/components/ApplicantFeaturesSection.jsx
import React from 'react'
import { Briefcase, CheckCircle, MessageSquare, Shield } from 'lucide-react'

const ApplicantFeaturesSection = () => {
  const applicantFeatures = [
    { icon: <Briefcase />, title: 'Find Dream Jobs', description: 'Curated job matches based on your profile' },
    { icon: <CheckCircle />, title: 'Easy Apply', description: 'One-click application process' },
    { icon: <MessageSquare />, title: 'Chat with HR', description: 'Direct communication with employers' },
    { icon: <Shield />, title: 'Privacy Control', description: 'Choose who sees your profile' },
  ]

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          For <span className="text-green-600">Job Seekers</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {applicantFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ApplicantFeaturesSection