import { ticketActivity, tickets } from '../data/dashboardMockData.js'

export async function getTickets() {
  return tickets
}

export async function getTicketActivity() {
  return ticketActivity
}
