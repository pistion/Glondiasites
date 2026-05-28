/**
 * template-ai.controller.js
 * Handles AI-assisted template intake and HTML tailoring.
 */

import { tailorHtmlTemplate, INTAKE_QUESTIONS, REQUIRED_KEYS } from '../services/openaiSiteAssistant.service.js';
import { makeId, nowIso, mutateHostingStore } from '../services/hostingStore.js';
import {
  createTemplateSite,
  getTemplateSite,
  updateTemplateSite,
} from '../services/templateSiteStore.js';

// In-memory session store — lightweight, non-persistent (survives restarts poorly but fine for intake)
const sessions = new Map();

// Cleanup sessions older than 2 hours when the map grows large
function maybeCleanSessions() {
  if (sessions.size < 500) return;
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, s] of sessions) {
    if (new Date(s.createdAt).getTime() < cutoff) sessions.delete(id);
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/** POST /api/template-ai/intake/start */
async function startIntake(req, res, next) {
  try {
    const { templateId } = req.body || {};
    if (!templateId || typeof templateId !== 'string') {
      return res.status(400).json({ error: 'templateId is required.' });
    }
    if (templateId.length > 100) {
      return res.status(400).json({ error: 'templateId is too long.' });
    }

    maybeCleanSessions();
    const sessionId = makeId('intake');
    sessions.set(sessionId, {
      templateId,
      collectedAnswers: {},
      step: 0,
      createdAt: new Date().toISOString(),
    });

    const q = INTAKE_QUESTIONS[0];
    res.json({
      sessionId,
      question:      q.question,
      questionKey:   q.key,
      questionLabel: q.label,
      step:          0,
      totalSteps:    INTAKE_QUESTIONS.length,
      requiredFields: REQUIRED_KEYS,
      collectedAnswers: {},
    });
  } catch (err) { next(err); }
}

/** POST /api/template-ai/intake/message */
async function sendMessage(req, res, next) {
  try {
    const { sessionId, message, collectedAnswers } = req.body || {};

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required.' });
    }
    if (message === undefined || message === null) {
      return res.status(400).json({ error: 'message is required (use empty string to skip).' });
    }
    if (typeof message !== 'string' || message.length > 2000) {
      return res.status(400).json({ error: 'message must be a string under 2000 characters.' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found. Start a new intake.' });
    }

    // Record answer for the current step
    const currentQ = INTAKE_QUESTIONS[session.step];
    if (currentQ) {
      const value = message.trim().toLowerCase() === 'skip' ? '' : message.trim();
      session.collectedAnswers[currentQ.key] = value;
    }

    // Merge any client-side answers (resilience against session loss)
    if (collectedAnswers && typeof collectedAnswers === 'object') {
      for (const [k, v] of Object.entries(collectedAnswers)) {
        if (typeof k === 'string' && k.length < 60 && typeof v === 'string' && v.length < 2000) {
          session.collectedAnswers[k] = session.collectedAnswers[k] ?? v;
        }
      }
    }

    session.step += 1;
    const nextQ   = INTAKE_QUESTIONS[session.step];
    const complete = !nextQ;

    res.json({
      sessionId,
      question:      nextQ?.question || null,
      questionKey:   nextQ?.key      || null,
      questionLabel: nextQ?.label    || null,
      step:          session.step,
      totalSteps:    INTAKE_QUESTIONS.length,
      collectedAnswers: { ...session.collectedAnswers },
      complete,
    });
  } catch (err) { next(err); }
}

/** POST /api/template-ai/generate */
async function generateTailored(req, res, next) {
  try {
    const { templateId, templateHtml, answers } = req.body || {};

    if (!templateId || typeof templateId !== 'string') {
      return res.status(400).json({ error: 'templateId is required.' });
    }
    if (!templateHtml || typeof templateHtml !== 'string') {
      return res.status(400).json({ error: 'templateHtml (string) is required.' });
    }
    if (templateHtml.length > 200_000) {
      return res.status(400).json({ error: 'templateHtml exceeds 200 kB limit.' });
    }
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers (object) is required.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error:   'AI tailoring is not available. OPENAI_API_KEY is not configured on this server.',
        code:    'OPENAI_NOT_CONFIGURED',
      });
    }

    const tailored = await tailorHtmlTemplate(templateHtml, answers);

    res.json({
      templateId,
      summary: `Tailored for ${answers.businessName || 'your business'}`,
      answers,
      pages: [
        { title: 'Home', path: '/', html: tailored },
      ],
    });
  } catch (err) { next(err); }
}

/** POST /api/template-ai/sites — persist a tailored site draft */
async function createSite(req, res, next) {
  try {
    const { templateId, answers, tailoredPages } = req.body || {};

    if (!templateId || typeof templateId !== 'string') {
      return res.status(400).json({ error: 'templateId is required.' });
    }
    if (templateId.length > 100) {
      return res.status(400).json({ error: 'templateId is too long.' });
    }
    if (answers !== undefined && (typeof answers !== 'object' || Array.isArray(answers))) {
      return res.status(400).json({ error: 'answers must be an object.' });
    }
    if (tailoredPages !== undefined && !Array.isArray(tailoredPages)) {
      return res.status(400).json({ error: 'tailoredPages must be an array.' });
    }

    const site = await createTemplateSite({
      templateId,
      answers:      answers       || {},
      tailoredPages: tailoredPages || [],
    });

    res.status(201).json({
      siteId:     site.siteId,
      templateId: site.templateId,
      answers:    site.answers,
      pages:      site.pages,
      status:     site.status,
      createdAt:  site.createdAt,
    });
  } catch (err) { next(err); }
}

/** GET /api/template-ai/sites/:siteId — retrieve a persisted tailored site */
async function getSite(req, res, next) {
  try {
    const { siteId } = req.params;
    if (!siteId) return res.status(400).json({ error: 'siteId is required.' });

    const site = await getTemplateSite(siteId);
    if (!site) return res.status(404).json({ error: `Site "${siteId}" not found.` });

    res.json(site);
  } catch (err) { next(err); }
}

/** POST /api/template-ai/sites/:siteId/deploy */
async function deploySite(req, res, next) {
  try {
    const { siteId } = req.params;
    if (!siteId) return res.status(400).json({ error: 'siteId is required.' });

    // Load the persisted tailored site
    const site = await getTemplateSite(siteId);
    if (!site) {
      return res.status(404).json({ error: `Site "${siteId}" not found. Complete the AI intake to create it.` });
    }

    const {
      siteName    = '',
      serviceType = 'static_site',
      plan        = 'starter',
    } = req.body || {};

    // Create a deployment record in the hosting store
    const deploymentId = makeId('dep');
    const now = nowIso();

    await mutateHostingStore((store) => {
      store.deployments.push({
        id:             deploymentId,
        siteId,
        templateId:     site.templateId,
        siteName:       siteName || site.answers?.businessName || site.templateId,
        serviceType,
        plan,
        status:         'deploying',
        source:         'ai-tailored-template',
        createdAt:      now,
        updatedAt:      now,
      });
    });

    // Mark the tailored site as deploying
    await updateTemplateSite(siteId, { status: 'deploying', deploymentId });

    res.json({
      status:       'deploying',
      siteId,
      deploymentId,
      templateId:   site.templateId,
      message:      'Your site is being deployed. Visit Hosting to monitor progress.',
    });
  } catch (err) { next(err); }
}

/** GET /api/template-ai/templates/:templateId/preview */
async function getTemplatePreview(req, res, next) {
  try {
    const { templateId } = req.params;
    if (!templateId) return res.status(400).json({ error: 'templateId is required.' });

    // Template HTML is bundled in the frontend (GD.templates / data.js).
    // The backend cannot import frontend template data, so we return metadata only.
    // The frontend should use contentJson.pages[0].html directly for iframe preview.
    res.json({
      templateId,
      previewAvailable: false,
      previewType:     'client-side-srcDoc',
      note:            'Template HTML is bundled in the frontend. Use contentJson.pages[0].html from the GD.templates array for iframe preview via srcDoc.',
    });
  } catch (err) { next(err); }
}

export const templateAiController = {
  startIntake,
  sendMessage,
  generateTailored,
  createSite,
  getSite,
  deploySite,
  getTemplatePreview,
};
