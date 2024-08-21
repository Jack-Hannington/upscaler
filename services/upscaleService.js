const Replicate = require('replicate');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const https = require('https');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const upscaledDir = path.join(__dirname, '..', 'upscaled-images');

// Ensure directory exists
fsPromises.mkdir(upscaledDir, { recursive: true });

const upscaleService = {
  async upscale(imageBuffer) {
    try {
      // Step 1: Send to Replicate API
      const output = await replicate.run(
        "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
        {
          input: {
            image: imageBuffer,  // Directly pass the buffer
            scale: 2,
            face_enhance: false
          }
        }
      );
      console.log('Upscaled image URL from Replicate:', output);

      // Step 2: Download and save the upscaled image
      const fileName = `upscaled_${Date.now()}.png`;
      const filePath = path.join(upscaledDir, fileName);
      
      await new Promise((resolve, reject) => {
        https.get(output, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download image: ${response.statusCode}`));
            return;
          }

          const fileStream = fs.createWriteStream(filePath);
          response.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });
        }).on('error', reject);
      });

      return filePath;
    } catch (error) {
      console.error('Error in upscaling service:', error);
      throw error;
    }
  }
};

module.exports = upscaleService;