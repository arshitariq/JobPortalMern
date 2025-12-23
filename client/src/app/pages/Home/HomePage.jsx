// Updated HomePage.jsx with all sections
import React from 'react'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import CategoriesSection from './components/CategoriesSection' // Added
import FeaturedJobsSection from './components/FeaturedJobsSection'
import FeaturesSection from './components/FeaturesSection'
import ApplicantFeaturesSection from './components/ApplicantFeaturesSection'
import TopCompaniesSection from './components/TopCompaniesSection' // Added
import ChatFeatureSection from './components/ChatFeatureSection'
import TestimonialsSection from './components/TestimonialsSection' // Added
import CTASection from './components/CTASection'

const HomePage = () => {
  return (
    <div className="min-h-screen ">
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <FeaturedJobsSection />
      <FeaturesSection />
      <ApplicantFeaturesSection />
      <TopCompaniesSection />
      <ChatFeatureSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}

export default HomePage