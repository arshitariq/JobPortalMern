// src/app/pages/Home/components/TopCompaniesSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function TopCompaniesSection() {
  const topCompanies = [
    { name: 'Google', logo: 'https://ui-avatars.com/api/?name=Google&background=5eb883&color=fff', jobs: 45 },
    { name: 'Microsoft', logo: 'https://ui-avatars.com/api/?name=Microsoft&background=5eb883&color=fff', jobs: 38 },
    { name: 'Amazon', logo: 'https://ui-avatars.com/api/?name=Amazon&background=5eb883&color=fff', jobs: 52 },
    { name: 'Apple', logo: 'https://ui-avatars.com/api/?name=Apple&background=5eb883&color=fff', jobs: 28 },
    { name: 'Meta', logo: 'https://ui-avatars.com/api/?name=Meta&background=5eb883&color=fff', jobs: 34 },
    { name: 'Netflix', logo: 'https://ui-avatars.com/api/?name=Netflix&background=5eb883&color=fff', jobs: 19 }
  ];

  return (
    <section className="py-16 bg-[#c1fbd9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0f3d2e]">
            Top Companies Hiring
          </h2>
          <p className="text-[#1f5f46] mt-2">
            Join industry-leading organizations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {topCompanies.map((company, index) => (
            <Link
              key={index}
              to={`/find-employers?company=${company.name}`}
              className="bg-white rounded-2xl border border-[#b6e6c8] p-6 text-center transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-16 h-16 mx-auto mb-3 rounded-xl" 
              />
              <h3 className="font-semibold text-[#0f3d2e] mb-1">
                {company.name}
              </h3>
              <p className="text-sm text-[#1f5f46]">
                {company.jobs} open positions
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
