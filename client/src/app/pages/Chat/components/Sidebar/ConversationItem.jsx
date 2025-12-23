import React, { useState } from 'react';
import { Check, CheckCheck, Clock, MoreVertical, VolumeX } from 'lucide-react';
import { getOtherParticipant } from '../../utils/participantHelpers';
import { formatTime } from '../../utils/timeUtils';

export default function ConversationItem({ 
  conversation, 
  isSelected, 
  onSelect, 
  currentUserId 
}) {
  const [showMenu, setShowMenu] = useState(false);
  
  const otherParticipant = getOtherParticipant(conversation.participants, currentUserId);
  const otherUser = otherParticipant?.user;
  const isGroup = conversation.type === 'group';
  const isOnline = otherParticipant?.status === 'online';
  const isMuted = conversation.mutedBy?.includes(currentUserId);
  const isArchived = conversation.archivedBy?.includes(currentUserId);
  const unreadCount = conversation.unreadCount || 0;
  
  const getLastMessageStatus = () => {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) return null;
    
    const isSender = lastMessage.sender?._id === currentUserId || lastMessage.sender === currentUserId;
    
    if (!isSender) return null;
    
    if (lastMessage.readBy?.length > 0) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    
    if (lastMessage.deliveredAt) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    }
    
    if (lastMessage.sentAt) {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
    
    return <Clock className="h-3 w-3 text-gray-400" />;
  };

  const getLastMessagePreview = () => {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) return 'No messages yet';
    
    if (lastMessage.deletedForMe) {
      return 'This message was deleted';
    }
    
    const senderPrefix = lastMessage.sender?._id === currentUserId ? 'You: ' : '';
    
    switch (lastMessage.type) {
      case 'image':
        return `${senderPrefix}📷 Photo`;
      case 'video':
        return `${senderPrefix}🎥 Video`;
      case 'voice':
      case 'audio':
        return `${senderPrefix}🎤 Voice message`;
      case 'file':
        return `${senderPrefix}📎 File`;
      default:
        return `${senderPrefix}${lastMessage.content || 'Message'}`;
    }
  };

  const handleMute = (e) => {
    e.stopPropagation();
    setShowMenu(false);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      // Implement delete functionality
    }
    setShowMenu(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`relative flex items-start gap-3 p-3 cursor-pointer hover:bg-[#c1fbd9]/20 border-b border-gray-100 transition-colors group ${
        isSelected ? 'bg-[#c1fbd9]/40 border-l-4 border-l-[#5eb883]' : ''
      } ${isArchived ? 'opacity-70' : ''}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={isGroup ? conversation.avatar?.url : (otherUser?.profileImage || `https://ui-avatars.com/api/?name=${otherUser?.name || 'User'}`)}
          alt={isGroup ? conversation.name : otherUser?.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {!isGroup && isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
        {isMuted && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
            <VolumeX className="h-2 w-2 text-white" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold truncate">
            {isGroup ? conversation.name : otherUser?.name || 'Unknown'}
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">
              {formatTime(conversation.updatedAt || conversation.lastMessage?.createdAt)}
            </span>
            {getLastMessageStatus()}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate flex-1 mr-2">
            {getLastMessagePreview()}
          </p>
          
          {(unreadCount > 0 || isMuted || isArchived) && (
            <div className="flex items-center gap-1">
              {isArchived && (
                <span className="text-xs text-gray-400">Archived</span>
              )}
              {isMuted && (
                <VolumeX className="h-3 w-3 text-gray-400" />
              )}
              {unreadCount > 0 && (
                <span className="bg-[#5eb883] text-white text-xs rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 hover:bg-[#c1fbd9]/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute right-2 top-12 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
          <button 
            onClick={handleMute}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <VolumeX className="h-4 w-4" />
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          
          <button 
            onClick={handleArchive}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <VolumeX className="h-4 w-4" />
            <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
          </button>
          
          <hr className="my-2" />
          
          <button 
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-3"
          >
            <span>Delete chat</span>
          </button>
        </div>
      )}
    </div>
  );
}
