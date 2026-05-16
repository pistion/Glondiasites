import { accountNotifications, teamMembers } from '../data/dashboardMockData.js'

export async function getTeamMembers() {
  return teamMembers
}

export async function getNotificationSettings() {
  return accountNotifications
}
