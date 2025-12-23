// src/modules/chat/api/chatApi.js
import { apiClient } from "@/shared/lib/apiClient";

export const chatApi = {
  createPrivateChat(otherUserId) {
    return apiClient.post("/chats/private", { userId: otherUserId });
  },
};
