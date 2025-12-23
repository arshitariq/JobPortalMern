import React from 'react';
import { X, MessageSquare, Image as ImageIcon, File, Mic } from 'lucide-react';

export default function ReplyPreview({ message, onCancel }) {
  if (!message) return null;

  const getMessagePreview = () => {
    if (message.deletedForMe) {
      return 'This message was deleted';
    }

    switch (message.type) {
      case 'image':
        return (
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-green-500" />
            <span className="truncate">Photo</span>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-green-500" />
            <span className="truncate">Video</span>
          </div>
        );
      case 'voice':
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-green-500" />
            <span className="truncate">Voice message</span>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-green-500" />
            <span className="truncate">File</span>
          </div>
        );
      default:
        return message.content || 'Message';
    }
  };

  return (
    <div className="px-4 py-2 bg-blue-50 border-l-4 border-green-500 flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-3 w-3 text-green-600" />
          <p className="text-xs text-green-600 font-semibold truncate">
            Replying to {message.sender?.name || 'User'}
          </p>
        </div>
        <p className="text-sm text-gray-700 truncate">
          {getMessagePreview()}
        </p>
      </div>
      <button 
        onClick={onCancel}
        className="p-1 hover:bg-blue-100 rounded-full ml-2 flex-shrink-0"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}