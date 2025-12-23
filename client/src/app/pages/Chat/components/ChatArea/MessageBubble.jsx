import React, { useState } from 'react';
import { 
  Check, CheckCheck, Clock, AlertCircle,
  Reply, Trash2, MoreVertical, Smile,
  Download, Play, Image as ImageIcon
} from 'lucide-react';
import { getMessageStatus, formatTime } from '../../utils/messageUtils';

export default function MessageBubble({ 
  message, 
  isMyMessage, 
  onReply, 
  onDelete, 
  onReact,
  onDownload,
  showDateSeparator = false,
  dateSeparatorText = ''
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  const status = getMessageStatus(message);
  const statusIcons = {
    pending: <Clock className="h-3 w-3 text-gray-400" />,
    sent: <Check className="h-3 w-3 text-gray-400" />,
    delivered: <CheckCheck className="h-3 w-3 text-gray-400" />,
    read: <CheckCheck className="h-3 w-3 text-blue-500" />,
    failed: <AlertCircle className="h-3 w-3 text-red-500" />
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const renderContent = () => {
    if (message.deletedForMe) {
      return (
        <div className="italic text-gray-500 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          This message was deleted
        </div>
      );
    }

    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={message.media?.[0]?.url} 
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.media[0].url, '_blank')}
            />
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-2">
            <video 
              src={message.media?.[0]?.url}
              controls
              poster={message.media?.[0]?.thumbnail}
              className="max-w-xs rounded-lg"
            />
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
        
      case 'voice':
      case 'audio':
        return (
          message.media?.[0]?.url ? (
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <audio controls src={message.media[0].url} className="flex-1" />
              <span className="text-sm text-gray-600">
                {message.media?.[0]?.duration || '0:00'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Play className="h-4 w-4" />
              Audio unavailable
            </div>
          )
        );
        
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
            <div className="p-2 bg-blue-100 rounded">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{message.media?.[0]?.fileName}</p>
              <p className="text-xs text-gray-500">
                {(message.media?.[0]?.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              onClick={() => onDownload?.(message)}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        );
        
      default:
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <>
      {showDateSeparator && (
        <div className="flex justify-center my-4">
          <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
            {dateSeparatorText}
          </div>
        </div>
      )}
      
      <div 
        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1 group`}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => {
          setShowMenu(false);
          setShowReactions(false);
        }}
      >
        <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
          {message.replyTo && (
            <div className={`mb-1 px-3 py-1 rounded-t-lg text-xs border-l-2 ${
              isMyMessage ? 'border-blue-400 bg-blue-50' : 'border-gray-400 bg-gray-100'
            }`}>
              <p className="font-semibold truncate">
                {message.replyTo.sender?.name || 'User'}
              </p>
              <p className="truncate">{message.replyTo.content || 'Media'}</p>
            </div>
          )}
          
          <div className={`relative rounded-2xl px-4 py-2 ${
            isMyMessage
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}>
            {renderContent()}
            
            <div className={`flex items-center justify-end gap-1 mt-1 ${
              isMyMessage ? 'text-blue-200' : 'text-gray-500'
            }`}>
              <span className="text-xs">{formatTime(message.createdAt)}</span>
              {isMyMessage && statusIcons[status]}
            </div>
            
            {message.reactions?.length > 0 && (
              <div className={`absolute -bottom-2 ${
                isMyMessage ? 'right-0' : 'left-0'
              } flex gap-1 bg-white rounded-full px-2 py-1 shadow-sm border`}>
                {message.reactions.slice(0, 3).map((reaction, index) => (
                  <span key={index} className="text-xs">{reaction.emoji}</span>
                ))}
                {message.reactions.length > 3 && (
                  <span className="text-xs">+{message.reactions.length - 3}</span>
                )}
              </div>
            )}
            
            {showMenu && !message.deletedForMe && (
              <div className={`absolute top-0 ${
                isMyMessage ? 'right-full mr-2' : 'left-full ml-2'
              } flex gap-1 bg-white rounded-lg shadow-lg p-1 border`}>
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="React"
                >
                  <Smile className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onReply?.(message)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Reply"
                >
                  <Reply className="h-4 w-4" />
                </button>
                {isMyMessage && (
                  <button
                    onClick={() => onDelete?.(message._id, false)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {showReactions && (
              <div className={`absolute top-0 ${
                isMyMessage ? 'right-full mr-28' : 'left-full ml-28'
              } bg-white rounded-full shadow-xl px-3 py-2 flex gap-2 border`}>
                {quickReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact?.(message._id, emoji);
                      setShowReactions(false);
                    }}
                    className="hover:scale-125 transition-transform text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {!isMyMessage && !message.deletedForMe && (
            <p className="text-xs text-gray-500 mt-1 ml-2">
              {message.sender?.name}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
