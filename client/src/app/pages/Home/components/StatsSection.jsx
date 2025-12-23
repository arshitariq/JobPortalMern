// src/app/pages/Home/components/StatsSection.jsx
import React from 'react'
import { Briefcase, Building, Users, UserCheck } from 'lucide-react'

const StatsSection = () => {
  const stats = [
    { label: 'Active Jobs', value: '5,342', icon: <Briefcase className="h-6 w-6" /> },
    { label: 'Companies', value: '1,250', icon: <Building className="h-6 w-6" /> },
    { label: 'Applicants', value: '45,892', icon: <Users className="h-6 w-6" /> },
    { label: 'Hired This Month', value: '2,150', icon: <UserCheck className="h-6 w-6" /> },
  ]

  return (
    <div className="bg-[#c1fbd9] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg border border-[#b6e6c8] transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#0f3d2e]">
                    {stat.value}
                  </p>
                  <p className="text-[#1f5f46] mt-2">
                    {stat.label}
                  </p>
                </div>
                <div className="text-[#145a43]">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsSection
