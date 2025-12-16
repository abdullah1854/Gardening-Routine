require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, systemPrompt } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Build messages array for OpenAI
        const openaiMessages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history
        messages.forEach(msg => {
            openaiMessages.push({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            });
        });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: openaiMessages,
            temperature: 0.7,
            max_tokens: 1024
        });

        const reply = completion.choices[0]?.message?.content;

        if (!reply) {
            throw new Error('No response from API');
        }

        res.json({ reply });

    } catch (error) {
        console.error('OpenAI API error:', error);

        if (error.code === 'invalid_api_key') {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        if (error.code === 'rate_limit_exceeded') {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
