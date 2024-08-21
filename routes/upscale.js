const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upscaleService = require('../services/upscaleService');
const { v4: uuidv4 } = require('uuid');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

const jobs = new Map();

router.get('/', (req, res) => {
  res.render('upscale/index');
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No image file uploaded');
    }

    const jobId = uuidv4();
    jobs.set(jobId, { status: 'pending' });

    // Start the upscaling process asynchronously
    upscaleService.upscale(req.file.buffer)
      .then((upscaledImagePath) => {
        jobs.set(jobId, { status: 'completed', path: path.basename(upscaledImagePath) });
      })
      .catch((error) => {
        console.error('Error in upscaling job:', error);
        jobs.set(jobId, { status: 'failed', error: error.message });
      });

    res.json({ jobId });
  } catch (error) {
    console.error('Error processing upscale request:', error);
    res.status(500).send('An error occurred while processing the image');
  }
});

router.get('/job/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

router.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendUpdate = (jobId, data) => {
    res.write(`data: ${JSON.stringify({ jobId, ...data })}\n\n`);
  };

  const interval = setInterval(() => {
    jobs.forEach((job, jobId) => {
      sendUpdate(jobId, job);
    });
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Route to serve upscaled images
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '..', 'upscaled-images', filename);
  res.sendFile(imagePath);
});

module.exports = router;