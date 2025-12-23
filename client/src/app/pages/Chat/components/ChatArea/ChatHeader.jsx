import React, { useState } from 'react';
import { Phone, Video, MoreVertical, Search, Trash2, Archive, VolumeX, UserPlus, Info } from 'lucide-react';
import { getOtherParticipant } from '../../utils/participantHelpers';

export default function ChatHeader({ 
  chat, 
  onAudioCall, 
  onVideoCall, 
  onClearChat, 
  onDeleteChat,
  currentUserId 
}) {
  const [showMenu, setShowMenu] = useState(false);
  
  const otherParticipant = getOtherParticipant(chat?.participants, currentUserId);
  const otherUser = otherParticipant?.user;
  const isGroup = chat?.type === 'group';
  const isOnline = otherParticipant?.status === 'online';
  const lastSeen = otherParticipant?.lastSeen;
  
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all messages in this chat? This action cannot be undone.')) {
      onClearChat?.();
    }
    setShowMenu(false);
  };

  const handleDeleteChat = (deleteForEveryone = false) => {
    const message = deleteForEveryone
      ? 'Delete this chat for all participants? This action cannot be undone.'
      : 'Delete this chat for yourself?';
    
    if (window.confirm(message)) {
      onDeleteChat?.(deleteForEveryone);
    }
    setShowMenu(false);
  };

  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={isGroup ? chat.avatar?.url : (otherUser?.profileImage || `https://ui-avatars.com/api/?name=${otherUser?.name || 'User'}`)}
            alt={isGroup ? chat.name : otherUser?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {!isGroup && isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div>
          <h3 className="font-semibold">
            {isGroup ? chat.name : otherUser?.name || 'Unknown'}
          </h3>
          <p className="text-sm text-gray-500">
            {isGroup 
              ? `${chat.participants?.length || 0} members`
              : isOnline 
                ? 'Online' 
                : `Last seen ${formatLastSeen(lastSeen)}`
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onAudioCall} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Voice call"
        >
          <Phone className="h-5 w-5 text-gray-600" />
        </button>
        
        <button 
          onClick={onVideoCall} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Video call"
        >
          <Video className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
              {isGroup && (
                <>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                    <UserPlus className="h-4 w-4" />
                    <span>Add participant</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Info className="h-4 w-4" />
                    <span>Group info</span>
                  </button>
                  <hr className="my-2" />
                </>
              )}
              
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
              
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                <VolumeX className="h-4 w-4" />
                <span>Mute notifications</span>
              </button>
              
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                <Archive className="h-4 w-4" />
                <span>Archive chat</span>
              </button>
              
              <button 
                onClick={handleClearChat}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear chat</span>
              </button>
              
              <hr className="my-2" />
              
              <button 
                onClick={() => handleDeleteChat(false)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-3"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete chat</span>
              </button>
              
              {isGroup && (
                <button 
                  onClick={() => handleDeleteChat(true)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-3"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete for everyone</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}