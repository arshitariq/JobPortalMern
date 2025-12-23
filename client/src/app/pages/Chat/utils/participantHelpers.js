// Normalize ID from various possible formats
export const normalizeId = (value) => {
  if (!value) return null;
  
  if (typeof value === 'string') return value;
  
  if (typeof value === 'object') {
    if (value._id) return value._id.toString();
    if (value.id) return value.id.toString();
  }
  
  return value?.toString() || null;
};

// Get participant ID from participant object
export const getParticipantId = (participant) => {
  if (!participant) return null;
  
  // Check various possible structures
  if (participant._id) return normalizeId(participant._id);
  if (participant.id) return normalizeId(participant.id);
  if (participant.user?._id) return normalizeId(participant.user._id);
  if (participant.user?.id) return normalizeId(participant.user.id);
  if (typeof participant.user === 'string') return normalizeId(participant.user);
  if (typeof participant === 'string') return normalizeId(participant);
  
  return normalizeId(participant);
};

// Check if participant matches user ID
export const isSameParticipant = (participant, userId) => {
  const participantId = getParticipantId(participant);
  const normalizedUserId = normalizeId(userId);
  
  if (!participantId || !normalizedUserId) return false;
  return participantId === normalizedUserId;
};

// Get other participant in a chat (for private chats)
export const getOtherParticipant = (participants = [], userId) => {
  if (!participants || !Array.isArray(participants)) return null;
  
  const normalizedUserId = normalizeId(userId);
  
  // Find participant that's not the current user
  const otherParticipant = participants.find(participant => {
    const participantId = getParticipantId(participant);
    
    if (!participantId) return false;
    if (!normalizedUserId) return true; // If no userId provided, return first non-null participant
    
    return participantId !== normalizedUserId;
  });
  
  return otherParticipant || null;
};

// Get ID of other participant
export const getOtherParticipantId = (participants, userId) => {
  const otherParticipant = getOtherParticipant(participants, userId);
  return getParticipantId(otherParticipant);
};

// Get all participant IDs except current user
export const getOtherParticipantIds = (participants, userId) => {
  if (!participants || !Array.isArray(participants)) return [];
  
  const normalizedUserId = normalizeId(userId);
  
  return participants
    .map(participant => getParticipantId(participant))
    .filter(id => id && id !== normalizedUserId);
};

// Get participant by ID
export const getParticipantById = (participants, targetId) => {
  if (!participants || !Array.isArray(participants)) return null;
  
  const normalizedTargetId = normalizeId(targetId);
  
  return participants.find(participant => {
    const participantId = getParticipantId(participant);
    return participantId === normalizedTargetId;
  }) || null;
};

// Get participant status
export const getParticipantStatus = (participant) => {
  if (!participant) return 'offline';
  
  // Check various possible structures
  return participant.status || 
         participant.user?.status || 
         'offline';
};

// Get participant last seen
export const getParticipantLastSeen = (participant) => {
  if (!participant) return null;
  
  // Check various possible structures
  const lastSeen = participant.lastSeen || 
                   participant.user?.lastSeen ||
                   participant.updatedAt;
  
  return lastSeen ? new Date(lastSeen) : null;
};

// Check if participant is online
export const isParticipantOnline = (participant) => {
  return getParticipantStatus(participant) === 'online';
};

// Format participants for display
export const formatParticipants = (participants, currentUserId) => {
  if (!participants || !Array.isArray(participants)) return [];
  
  return participants.map(participant => {
    const user = participant.user || participant;
    const id = getParticipantId(participant);
    
    return {
      id,
      _id: id,
      user: {
        _id: id,
        id: id,
        name: user.name || 'Unknown',
        profileImage: user.profileImage || user.avatar || null,
        status: getParticipantStatus(participant),
        lastSeen: getParticipantLastSeen(participant)
      },
      role: participant.role || 'member',
      joinedAt: participant.joinedAt,
      isOnline: isParticipantOnline(participant),
      isCurrentUser: id === normalizeId(currentUserId)
    };
  });
};

// Get group name from participants
export const getGroupName = (participants, currentUserId) => {
  const otherParticipants = participants.filter(p => 
    !isSameParticipant(p, currentUserId)
  );
  
  if (otherParticipants.length === 0) return 'You';
  
  if (otherParticipants.length === 1) {
    const participant = otherParticipants[0];
    return participant.user?.name || 'Unknown';
  }
  
  return otherParticipants
    .slice(0, 3)
    .map(p => p.user?.name?.split(' ')[0] || 'User')
    .join(', ') + (otherParticipants.length > 3 ? ` +${otherParticipants.length - 3}` : '');
};

// Get group avatar (first letter of names)
export const getGroupAvatarText = (participants, currentUserId) => {
  const otherParticipants = participants.filter(p => 
    !isSameParticipant(p, currentUserId)
  );
  
  if (otherParticipants.length === 0) return 'Y';
  
  if (otherParticipants.length === 1) {
    return otherParticipants[0].user?.name?.charAt(0) || 'U';
  }
  
  return otherParticipants
    .slice(0, 2)
    .map(p => p.user?.name?.charAt(0) || 'U')
    .join('');
};