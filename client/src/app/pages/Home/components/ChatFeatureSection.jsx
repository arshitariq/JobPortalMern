// src/app/pages/Home/components/ChatFeatureSection.jsx
import React from 'react'
import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

const ChatFeatureSection = () => {
  return (
    <div className=" text-[#0f3d2e] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">

          <MessageSquare className="h-16 w-16 mx-auto mb-6 text-[#145a43]" />

          <h2 className="text-4xl font-bold mb-6">
            Real-Time Chat
          </h2>

          <p className="text-xl mb-8 max-w-3xl mx-auto text-[#1f5f46]">
            Communicate directly with employers or candidates. No more waiting for emails – 
            instant messaging makes hiring and job searching faster and more efficient.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-[#0f3d2e] text-white hover:bg-[#145a43] font-bold py-3 px-8 rounded-lg text-lg transition"
            >
              Start Chatting
            </Link>

            <Link
              to="/customer-support"
              className="border-2 border-[#0f3d2e] text-[#0f3d2e] hover:bg-[#e7f8ef] font-bold py-3 px-8 rounded-lg text-lg transition"
            >
              Learn More
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ChatFeatureSection
