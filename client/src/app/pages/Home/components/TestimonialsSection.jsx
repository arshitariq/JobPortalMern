// src/app/pages/Home/components/TestimonialsSection.jsx
import React from 'react';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'TechCorp',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=5eb883&color=fff',
      text: 'Found my dream job within 2 weeks! The platform is intuitive and the chat feature helped me connect directly with hiring managers.'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'StartupXYZ',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=5eb883&color=fff',
      text: 'As an employer, this platform has been a game-changer. We hired 5 amazing candidates in the last month alone!'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      company: 'DesignHub',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=5eb883&color=fff',
      text: 'The job alerts feature is fantastic. I received notifications for roles that perfectly matched my skills.'
    }
  ];

  return (
    <section className="py-16 bg-[#c1fbd9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0f3d2e]">
            Success Stories
          </h2>
          <p className="text-[#1f5f46] mt-2">
            See what our users are saying
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#b6e6c8] p-6 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#5eb883] text-[#5eb883]"
                  />
                ))}
              </div>

              <p className="text-[#1f5f46] mb-6">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full" 
                />
                <div>
                  <div className="font-semibold text-[#0f3d2e]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[#1f5f46]">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
