import React, { useState, useEffect } from 'react';
import ConversationItem from './ConversationItem';
import SearchBar from './SearchBar';

const filterConversations = (conversations, term, currentUserId) => {
  if (!term.trim()) return conversations;

  const lowered = term.toLowerCase();

  return conversations.filter((conv) => {
    const otherParticipant = conv.participants?.find(
      (p) => p.user?._id !== currentUserId && p.user !== currentUserId
    );

    if (!otherParticipant) return false;

    const userName = otherParticipant.user?.name || "";
    const lastMessage = conv.lastMessage?.content || "";

    return (
      userName.toLowerCase().includes(lowered) ||
      lastMessage.toLowerCase().includes(lowered)
    );
  });
};

export default function ConversationList({
  conversations = [],
  selectedChat,
  onSelectChat,
  searchTerm,
  onSearch,
  currentUserId,
  loading = false
}) {
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  useEffect(() => {
    if (!searchTerm?.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    setFilteredConversations(
      filterConversations(conversations, searchTerm, currentUserId)
    );
  }, [conversations, searchTerm, currentUserId]);

  const handleSearch = (term) => {
    onSearch?.(term);
    setFilteredConversations(
      filterConversations(conversations, term, currentUserId)
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search conversations..."
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              isSelected={selectedChat?._id === conv._id}
              onSelect={() => onSelectChat?.(conv)}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}
