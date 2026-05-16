import { messageThreads, messages } from '../data/dashboardMockData.js'

export async function getMessages() {
  return messages
}

export async function getMessageThread(messageId) {
  return messageThreads[messageId] || []
}
