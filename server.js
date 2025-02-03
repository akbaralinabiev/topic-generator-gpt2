require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

// Initialize Express app
const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let textGenerator;
let isModelLoading = true;

(async () => {
  try {
    console.log('Loading GPT-2 model...');
    textGenerator = await pipeline('text-generation', 'Xenova/gpt2');
    isModelLoading = false;
    console.log('GPT-2 model loaded successfully!');
  } catch (error) {
    console.error('Error loading model:', error);
    isModelLoading = false;
  }
})();

// Generate text based on the topic provided by the frontend
app.post("/chat", async (req, res) => {
  const message = req.body.message;

  if (isModelLoading) {
    return res.status(503).json({ error: "Model is still loading. Please try again shortly." });
  }
  if (!textGenerator) {
    return res.status(500).json({ error: "Model failed to load. Restart the server." });
  }
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: "Invalid input. Please provide a topic." });
  }

  try {
    const prompt = `${message} is an important topic. Here is a well-structured explanation:\n`;

    // Generate text using the local model
    const response = await textGenerator(prompt, {
      max_length: 150,
      num_return_sequences: 1,
      temperature: 3,
      top_k: 50,
      top_p: 0.95,
      repetition_penalty: 1.2,
      stop_sequences: [".", "\n\n"],
    });

    // Extract and clean the generated text
    const generatedText = response[0].generated_text.replace(prompt, "").trim();
    res.json({ response: generatedText });

  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
