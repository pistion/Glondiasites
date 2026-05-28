/**
 * template-ai.js — Frontend API helpers for AI-assisted template intake.
 * All calls go through the Express backend. The OpenAI key is never exposed here.
 */

import { liveApiRequest } from '../api.js';

/**
 * Start an AI intake session for a template.
 * @param {string} templateId
 * @returns {Promise<{ sessionId, question, questionKey, step, totalSteps, requiredFields, collectedAnswers }>}
 */
export async function startTemplateAiIntake(templateId) {
  return liveApiRequest('/template-ai/intake/start', {
    method: 'POST',
    body: { templateId },
  });
}

/**
 * Send the customer's answer to the current intake question.
 * @param {string} sessionId
 * @param {string} message        — Customer's typed answer (empty string = skip)
 * @param {object} collectedAnswers — Full answers collected client-side so far
 * @returns {Promise<{ sessionId, question, questionKey, step, collectedAnswers, complete }>}
 */
export async function sendTemplateAiMessage(sessionId, message, collectedAnswers = {}) {
  return liveApiRequest('/template-ai/intake/message', {
    method: 'POST',
    body: { sessionId, message, collectedAnswers },
  });
}

/**
 * Ask the backend to tailor an HTML template to the customer's answers.
 * The templateHtml is sent securely to the backend which calls OpenAI server-side.
 * @param {string} templateId
 * @param {string} templateHtml   — The original template HTML (from contentJson.pages[n].html)
 * @param {object} answers        — Collected intake answers
 * @returns {Promise<{ templateId, summary, answers, pages: [{title,path,html}] }>}
 */
export async function generateTailoredTemplate(templateId, templateHtml, answers) {
  return liveApiRequest('/template-ai/generate', {
    method: 'POST',
    body: { templateId, templateHtml, answers },
  });
}

/**
 * Persist a draft site record from the tailored output.
 * @param {string} templateId
 * @param {object} answers
 * @param {Array}  tailoredPages — [{title, path, html}]
 * @returns {Promise<{ siteId, templateId, answers, pages, status }>}
 */
export async function createSiteFromTailoredTemplate(templateId, answers, tailoredPages) {
  return liveApiRequest('/template-ai/sites', {
    method: 'POST',
    body: { templateId, answers, tailoredPages },
  });
}

/**
 * Trigger a Render deployment for a tailored site.
 * @param {string} siteId
 * @returns {Promise<{ status, siteId, message }>}
 */
export async function deployTailoredTemplate(siteId) {
  return liveApiRequest(`/template-ai/sites/${encodeURIComponent(siteId)}/deploy`, {
    method: 'POST',
  });
}
