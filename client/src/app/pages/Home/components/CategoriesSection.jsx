// src/app/pages/Home/components/CategoriesSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoriesSection() {
  const categories = [
    { name: 'Technology', icon: '💻', count: 1247 },
    { name: 'Marketing', icon: '📊', count: 856 },
    { name: 'Design', icon: '🎨', count: 623 },
    { name: 'Sales', icon: '💼', count: 734 },
    { name: 'Finance', icon: '💰', count: 512 },
    { name: 'Healthcare', icon: '🏥', count: 445 },
    { name: 'Education', icon: '📚', count: 389 },
    { name: 'Engineering', icon: '⚙️', count: 978 }
  ];

  return (
    <section className="py-16 bg-[#c1fbd9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0f3d2e]">
            Browse by Category
          </h2>
          <p className="text-[#1f5f46] mt-2">
            Explore jobs in different industries
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/jobs?category=${category.name}`}
              className="bg-white border border-[#b6e6c8] rounded-2xl p-6 text-center transition-all group hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-4xl mb-3">
                {category.icon}
              </div>

              <h3 className="font-semibold text-[#0f3d2e] mb-1 group-hover:text-[#145a43]">
                {category.name}
              </h3>

              <p className="text-sm text-[#1f5f46]">
                {category.count} jobs available
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
