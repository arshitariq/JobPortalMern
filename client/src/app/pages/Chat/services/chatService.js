import { apiClient } from '@/shared/lib/apiClient';

export const chatService = {
  async getChats(params = {}) {
    try {
      const response = await apiClient.get('/chats', { params });
      return response;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },
  
  async getChatMessages(chatId, params = {}) {
    try {
      const response = await apiClient.get(`/messages/${chatId}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  
  async markChatAsRead(chatId) {
    try {
      await apiClient.put(`/messages/chat/${chatId}/read-all`, {});
      return true;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  },
  
  async searchChats(searchTerm) {
    try {
      const response = await apiClient.get('/chats/search', { 
        params: { q: searchTerm } 
      });
      return response;
    } catch (error) {
      console.error('Error searching chats:', error);
      throw error;
    }
  },
  
  async clearChatHistory(chatId) {
    try {
      await apiClient.post(`/chats/${chatId}/clear`, {});
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  },
  
  async deleteChat(chatId, deleteForEveryone = false) {
    try {
      await apiClient.delete(`/chats/${chatId}`, {
        data: { deleteForEveryone }
      });
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }
};
