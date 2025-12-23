import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

// Import components
import ConversationList from './components/Sidebar/ConversationList';
import ChatHeader from './components/ChatArea/ChatHeader';
import MessagesArea from './components/ChatArea/MessagesArea';
import MessageInput from './components/ChatArea/MessageInput';
import EmptyState from './components/Common/EmptyState';
import CallUI from './components/Calls/CallUI';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Import hooks
import useSocketConnection from './hooks/useSocketConnection';
import useChatMessages from './hooks/useChatMessages';
import useCallManagement from './hooks/useCallManagement';

// Import services
import { chatService } from './services/chatService';
import { messageService } from './services/messageService';
import { apiClient } from '@/shared/lib/apiClient';

// Import utils
import { getOtherParticipantId } from './utils/participantHelpers';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function ChatPage() {
  // State
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  
  // Auth user
  const authUser = useSelector((state) => state.auth.user);
  const currentUserId = authUser?.id;

  // Initialize socket - FIXED: Pass SOCKET_URL
  const { socket, isConnected } = useSocketConnection({
    socketUrl: SOCKET_URL, // Pass the URL here
    userId: currentUserId,
    onMessage: (data) => {
      handleIncomingMessage(data);
    },
    onCall: (data) => {
      handleIncomingCall(data);
    },
    onUserStatusChange: (data) => {
      handleUserStatusChange(data);
    }
  });

  // Chat messages hook
  const {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    loadingMessages,
    setLoadingMessages,
    setMessages
  } = useChatMessages({
    socket,
    currentUserId
  });

  // Call management hook
  const {
    call,
    callAccepted,
    callEnded,
    stream,
    startCall,
    answerCall,
    endCall,
    myVideoRef,
    userVideoRef,
    setCall
  } = useCallManagement({
    socket,
    currentUserId
  });

  // Load conversations
  useEffect(() => {
    if (!currentUserId) return;

    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const response = await chatService.getChats();
        if (response?.success) {
          setConversations(response.data || []);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [currentUserId]);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat || !currentUserId) return;

    let isActive = true;
    const chatId = selectedChat._id;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await messageService.getMessages(chatId, {
          limit: 50,
          skip: 0
        });

        if (!isActive) return;

        if (response?.success) {
          const fetchedMessages = Array.isArray(response.data) ? [...response.data].reverse() : [];
          setMessages(prev => ({
            ...prev,
            [chatId]: fetchedMessages
          }));
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        if (isActive) setLoadingMessages(false);
      }
    };

    loadMessages();

    // Join chat room
    if (socket) {
      socket.emit('join-chat', chatId);
    }

    // Mark chat as read
    messageService.markChatAsRead(chatId);

    return () => {
      isActive = false;
    };
  }, [selectedChat, currentUserId, socket, setLoadingMessages, setMessages]);

  // Handle chat selection
  const handleSelectChat = useCallback(async (chat) => {
    setSelectedChat(chat);
  }, []);

  // Handle incoming message
  const handleIncomingMessage = useCallback((data) => {
    const { chatId, message } = data;
    
    if (chatId === selectedChat?._id) {
      addMessage(chatId, message);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => {
      if (conv._id === chatId) {
        return {
          ...conv,
          lastMessage: message,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    }));
  }, [selectedChat, addMessage]);

  // Handle incoming call
  const handleIncomingCall = useCallback((data) => {
    console.log('Incoming call:', data);
    if (!data) return;

    setCall({
      isReceivingCall: true,
      from: data.from,
      name: data.name || 'User',
      signal: data.signal,
      type: data.type || 'video',
      callId: data.callId || Date.now().toString()
    });
  }, [setCall]);

  // Handle user status change
const updateParticipantStatus = (participants = [], userId, status, lastSeen) => {
    let changed = false;
    const updated = participants.map(participant => {
      const participantId = participant.user?._id || participant.user;
      if (!participantId) return participant;

      if (participantId.toString() === userId) {
        changed = true;
        return {
          ...participant,
          user: participant.user || participantId,
          status,
          lastSeen
        };
      }

      return participant;
    });

    return { updated, changed };
  };

  const handleUserStatusChange = useCallback(({ userId, status, lastSeen }) => {
    setConversations(prev => prev.map(conv => {
      const { updated: updatedParticipants } = updateParticipantStatus(conv.participants, userId, status, lastSeen);
      
      return {
        ...conv,
        participants: updatedParticipants
      };
    }));

    setSelectedChat(prev => {
      if (!prev) return prev;
      const { updated, changed } = updateParticipantStatus(prev.participants, userId, status, lastSeen);
      if (!changed) return prev;
      return { ...prev, participants: updated };
    });
  }, []);

  // Handle send message
  const handleSendMessage = async (content, type = 'text', media = null, replyTo = null) => {
    if (!selectedChat || !socket || !currentUserId) return;

    try {
      // Get receiver ID
      const receiverId = getOtherParticipantId(selectedChat.participants, currentUserId);
      
      // Send via API
    let response;
    if (type === 'text') {
      response = await messageService.sendMessage(
        selectedChat._id, 
        content, 
        type, 
        replyTo
      );
    } else if (type === 'image' && media?.[0]) {
      response = await messageService.sendImageMessage(
        selectedChat._id,
        media[0],
        content
      );
    } else if (type === 'voice' && media?.[0]) {
      const voicePayload = media[0];
      const audioBlob = voicePayload?.blob || voicePayload;
      const duration = voicePayload?.duration;
      response = await messageService.sendVoiceMessage(
        selectedChat._id,
        audioBlob,
        duration
      );
    } else if ((type === 'media' || type === 'file') && media?.[0]) {
      const attachment = media[0];
      const mimeType = attachment.type || '';
      
      if (mimeType.startsWith('image/')) {
        response = await messageService.sendImageMessage(
          selectedChat._id,
          attachment,
          content
        );
      } else if (mimeType.startsWith('video/')) {
        response = await messageService.sendVideoMessage(
          selectedChat._id,
          attachment,
          content,
          0
        );
      } else if (mimeType.startsWith('audio/')) {
        response = await messageService.sendVoiceMessage(
          selectedChat._id,
          attachment
        );
      } else {
        response = await messageService.sendFileMessage(
          selectedChat._id,
          attachment,
          content
        );
      }
    }
      
      if (response?.success) {
        // Update with real message
        addMessage(selectedChat._id, response.data);
        
        // Emit via socket
        socket.emit('send-message', {
          chatId: selectedChat._id,
          message: response.data,
          receiverId
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle search
  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // Reload all chats
      const response = await chatService.getChats();
      if (response?.success) {
        setConversations(response.data || []);
      }
      return;
    }
    
    try {
      const response = await chatService.searchChats(term);
      if (response?.success) {
        setConversations(response.data || []);
      }
    } catch (error) {
      console.error('Error searching chats:', error);
    }
  };

  // Handle clear chat
  const handleClearChat = async () => {
    if (!selectedChat || !window.confirm('Clear all messages in this chat?')) return;
    
    try {
      await chatService.clearChatHistory(selectedChat._id);
      // Clear local messages
      deleteMessage(selectedChat._id, 'all');
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  // Handle delete chat
  const handleDeleteChat = async (deleteForEveryone = false) => {
    if (!selectedChat) return;
    
    const message = deleteForEveryone 
      ? 'Delete this chat for all participants?'
      : 'Delete this chat for yourself?';
    
    if (!window.confirm(message)) return;
    
    try {
      await chatService.deleteChat(selectedChat._id, deleteForEveryone);
      
      if (deleteForEveryone) {
        setConversations(prev => prev.filter(conv => conv._id !== selectedChat._id));
        setSelectedChat(null);
      } else {
        // Just hide from current user
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesEndRef.current && selectedChat && !loadingMessages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages[selectedChat?._id]?.length, loadingMessages]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Call UI */}
      <CallUI
        call={call}
        callAccepted={callAccepted}
        callEnded={callEnded}
        myVideoRef={myVideoRef}
        userVideoRef={userVideoRef}
        stream={stream}
        onAnswer={answerCall}
        onEnd={endCall}
        socket={socket}
      />

      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <ConversationList
          conversations={conversations}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          currentUserId={currentUserId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onAudioCall={() => startCall(selectedChat, 'audio')}
              onVideoCall={() => startCall(selectedChat, 'video')}
              onClearChat={handleClearChat}
              onDeleteChat={handleDeleteChat}
              currentUserId={currentUserId}
            />

            <div ref={chatAreaRef} className="flex-1 overflow-y-auto">
              <MessagesArea
                messages={messages[selectedChat._id] || []}
                loading={loadingMessages}
                currentUserId={currentUserId}
                onReply={(msg) => {
                  // Handle reply - you need to implement this
                }}
                onDelete={deleteMessage}
                onReact={(messageId, emoji) => {
                  // Handle reaction - you need to implement this
                }}
                messagesEndRef={messagesEndRef}
              />
            </div>

            <MessageInput
              onSend={handleSendMessage}
              disabled={!selectedChat || !isConnected}
              socket={socket}
              chatId={selectedChat?._id}
              currentUserId={currentUserId}
            />
          </>
        ) : (
          <EmptyState
            title="Select a conversation"
            description="Choose from your conversations to start messaging"
            icon="message-circle"
          />
        )}
      </div>
    </div>
  );
}
