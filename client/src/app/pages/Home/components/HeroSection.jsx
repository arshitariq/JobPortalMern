// src/app/pages/Home/components/HeroSection.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#65ce91]">
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-10"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-[#0b2f24]">
            Find Your{" "}
            <span className="bg-gradient-to-r from-[#0f3d2e] to-[#1f7a5a] bg-clip-text text-transparent">
              Dream Job
            </span>{" "}
            or{" "}
            <span className="bg-gradient-to-r from-[#0f3d2e] to-[#1f7a5a] bg-clip-text text-transparent">
              Perfect Candidate
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-[#134e3a] font-medium">
            Connecting <span className="font-semibold text-[#0f3d2e]">top talent</span> with{" "}
            <span className="font-semibold text-[#0f3d2e]">leading companies</span> worldwide
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="bg-[#0f3d2e] hover:bg-[#145a43] text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              I'm Looking for a Job
            </Link>

            <Link
              to="/find-employers"
              className="bg-transparent hover:bg-[#e7f8ef] border-2 border-[#0f3d2e] text-[#0f3d2e] font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
            >
              I'm Hiring Talent
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HeroSection
