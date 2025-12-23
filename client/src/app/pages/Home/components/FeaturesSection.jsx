// src/app/pages/Home/components/CompanyFeaturesSection.jsx
import React from 'react'
import { TrendingUp, Users, MessageSquare, Shield } from 'lucide-react'

const FeaturesSection = () => {
  const companyFeatures = [
    { icon: <TrendingUp />, title: 'Post Jobs Instantly', description: 'Reach thousands of qualified candidates' },
    { icon: <Users />, title: 'Manage Applicants', description: 'Streamlined applicant tracking system' },
    { icon: <MessageSquare />, title: 'Direct Chat', description: 'Communicate directly with candidates' },
    { icon: <Shield />, title: 'Verified Profiles', description: 'Access to pre-verified talent pool' },
  ]

  return (
    <div className=" bg-[#c1fbd9] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <h2 className="text-3xl font-bold text-center text-[#0f3d2e] mb-12">
          For <span className="text-[#145a43]">Companies</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-[#b6e6c8] text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#e7f8ef] text-[#145a43] rounded-lg mb-4">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold text-[#0f3d2e] mb-2">
                {feature.title}
              </h3>

              <p className="text-[#1f5f46]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturesSection
