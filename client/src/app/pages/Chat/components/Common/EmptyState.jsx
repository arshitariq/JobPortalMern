import React from 'react';
import { MessageSquare, Users, Phone, Video } from 'lucide-react';

export default function EmptyState({ 
  title = "Select a conversation",
  description = "Choose from your conversations to start messaging",
  icon = "message-circle",
  showFeatures = true 
}) {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-16 w-16 text-green-500" />;
      case 'phone':
        return <Phone className="h-16 w-16 text-green-500" />;
      case 'video':
        return <Video className="h-16 w-16 text-green-500" />;
      default:
        return <MessageSquare className="h-16 w-16 text-green-500" />;
    }
  };

  const features = [
    { icon: '🔒', title: 'End-to-end encrypted', description: 'Your messages are secure' },
    { icon: '💬', title: 'Rich messaging', description: 'Send text, photos, videos and files' },
    { icon: '📞', title: 'Voice & video calls', description: 'High-quality calls' },
    { icon: '👥', title: 'Group chats', description: 'Chat with multiple people' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
          {getIcon()}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-8">{description}</p>
        
        {showFeatures && (
          <div className="grid grid-cols-2 gap-4 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          <p>WhatsApp-like chat experience</p>
          <p className="text-xs mt-1">Secure • Fast • Reliable</p>
        </div>
      </div>
    </div>
  );
}