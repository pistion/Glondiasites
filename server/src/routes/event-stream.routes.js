import express from 'express';

const router = express.Router({ mergeParams: true });

router.get('/stream', (req, res) => {
  const { workspaceId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log(`Client connected to event stream for workspace: ${workspaceId}`);

  // Send initial connected event
  const initialEvent = JSON.stringify({
    event: "stream.connected",
    workspaceId,
    timestamp: new Date().toISOString()
  });
  res.write(`data: ${initialEvent}\n\n`);

  // Example: Send a heartbeat every 30 seconds
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
    console.log(`Client disconnected from stream: ${workspaceId}`);
    res.end();
  });
});

export default router;
