import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

const key = process.env.GEMINI_API_KEY;
console.log('=== GEMINI REST API TEST (x-goog-api-key) ===');
console.log('Key prefix:', key ? key.substring(0, 15) + '...' : 'MISSING');

if (!key) {
  console.log('ERROR: GEMINI_API_KEY not in .env');
  process.exit(1);
}

// Direct REST API call - works with BOTH AIza... and AQ... key formats
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

console.log('\nCalling Gemini REST API...');

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': key,  // Key goes in header, not URL
  },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Say "AI working" in exactly 2 words.' }] }],
    generationConfig: { maxOutputTokens: 20 },
  }),
});

const data = await response.json();

if (!response.ok) {
  console.error('FAILED! Status:', response.status);
  console.error('Error:', JSON.stringify(data?.error, null, 2));
} else {
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('SUCCESS! Response:', text);
}


import { GoogleGenAI } from '@google/genai';

// Auth keys (AQ...) require httpOptions with apiVersion:'v1'
// Standard keys (AIza...) use v1beta by default
const genAI = new GoogleGenAI({ 
  apiKey: key,
  httpOptions: { apiVersion: 'v1' }
});

// Step 1: List available models
console.log('\n--- Available Models ---');
try {
  const modelList = await genAI.models.list();
  for await (const m of modelList) {
    if (m.supportedActions?.includes('generateContent')) {
      console.log(' >', m.name);
    }
  }
} catch (e) {
  console.log('Could not list models:', e.message.substring(0, 200));
}

// Step 2: Try generate with a simple prompt
console.log('\n--- Testing generateContent ---');
const modelsToTry = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-pro',
  'gemini-1.5-pro-001',
];

for (const modelName of modelsToTry) {
  try {
    process.stdout.write(`Trying ${modelName}... `);
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: 'Say "OK" only.',
    });
    console.log(`SUCCESS! -> "${result.text?.trim()}"`);
    console.log(`\n✅ USE THIS MODEL: ${modelName}`);
    break;
  } catch (e) {
    const msg = e.message || '';
    const code = msg.includes('404') ? '404' : msg.includes('429') ? '429' : msg.includes('403') ? '403' : '???';
    console.log(`FAILED (${code})`);
  }
}
