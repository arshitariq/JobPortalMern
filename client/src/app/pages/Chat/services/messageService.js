import { apiClient } from '@/shared/lib/apiClient';

export const messageService = {
  getAudioFilename(audioBlob) {
    const type = audioBlob?.type || '';
    if (type.includes('ogg')) return 'voice-message.ogg';
    if (type.includes('mpeg')) return 'voice-message.mp3';
    if (type.includes('webm')) return 'voice-message.webm';
    return 'voice-message.webm';
  },

  async sendMessage(chatId, content, type = 'text', replyTo = null) {
    try {
      const response = await apiClient.post('/messages', {
        chatId,
        content,
        type,
        replyTo
      });
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async sendImageMessage(chatId, imageFile, caption = '') {
    try {
      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('image', imageFile);
      if (caption) formData.append('caption', caption);

      const response = await apiClient.post('/messages/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error sending image:', error);
      throw error;
    }
  },

  async sendFileMessage(chatId, file, caption = '') {
    try {
      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('file', file);
      if (caption) formData.append('caption', caption);

      const response = await apiClient.post('/messages/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error sending file:', error);
      throw error;
    }
  },

  async sendVoiceMessage(chatId, audioBlob, duration) {
    try {
      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('audio', audioBlob, this.getAudioFilename(audioBlob));
      if (duration) formData.append('duration', duration);

      const response = await apiClient.post('/messages/upload/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  },

  async sendVideoMessage(chatId, videoFile, caption = '', duration) {
    try {
      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('video', videoFile);
      if (caption) formData.append('caption', caption);
      if (duration) formData.append('duration', duration);

      const response = await apiClient.post('/messages/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error sending video:', error);
      throw error;
    }
  },

  async getMessages(chatId, params = {}) {
    try {
      const response = await apiClient.get(`/messages/${chatId}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async markAsRead(messageId) {
    try {
      const response = await apiClient.put(`/messages/${messageId}/read`, {});
      return response;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  async markChatAsRead(chatId) {
    try {
      const response = await apiClient.put(`/messages/chat/${chatId}/read-all`, {});
      return response;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  },

  async deleteMessage(messageId, deleteForEveryone = false) {
    try {
      const response = await apiClient.delete(`/messages/${messageId}`, {
        data: { deleteForEveryone }
      });
      return response;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async editMessage(messageId, content) {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, { content });
      return response;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  async reactToMessage(messageId, emoji) {
    try {
      const response = await apiClient.put(`/messages/${messageId}/react`, { emoji });
      return response;
    } catch (error) {
      console.error('Error reacting to message:', error);
      throw error;
    }
  },

  async removeReaction(messageId) {
    try {
      const response = await apiClient.delete(`/messages/${messageId}/react`);
      return response;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  async forwardMessage(messageId, targetChatId) {
    try {
      const response = await apiClient.post(`/messages/${messageId}/forward`, { targetChatId });
      return response;
    } catch (error) {
      console.error('Error forwarding message:', error);
      throw error;
    }
  },

  async searchMessages(chatId, searchTerm) {
    try {
      const response = await apiClient.get(`/messages/search/${chatId}`, {
        params: { q: searchTerm }
      });
      return response;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  },

  async getUnreadCount() {
    try {
      const response = await apiClient.get('/messages/unread/count');
      return response;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
};
