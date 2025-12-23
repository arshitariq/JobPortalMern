// src/app/pages/Home/components/CTASection.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const CTASection = () => {
  return (
    <div className="bg-[#c1fbd9] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* App Name / Heading */}
        <h2 className="text-3xl font-bold text-[#0f3d2e] mb-6">
          Welcome to Your App Name
        </h2>

        <p className="text-[#1f5f46] text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of companies and job seekers who found their perfect match through our platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auth/register"
            className="bg-[#0f3d2e] hover:bg-[#145a43] text-white font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            Create Account
          </Link>

          <Link
            to="/customer-support"
            className="border-2 border-[#0f3d2e] text-[#0f3d2e] hover:bg-[#e7f8ef] font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            Schedule a Demo
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CTASection
