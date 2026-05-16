import { activeProject, projects } from '../data/dashboardMockData.js'

export async function getActiveProject() {
  return activeProject
}

export async function getProjects() {
  return projects
}
