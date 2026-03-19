const CHAT_URL = 'http://localhost:11434/api/chat';
const GEN_URL = 'http://localhost:11434/api/generate';
const MODEL = 'marksverdhei/normistral-it:7b';

const SYSTEM = `Du er et tekstverktøy. Du svarer alltid i dette formatet: <svar>TEKSTEN HER</svar>. Ingen tekst utenfor taggene.`;

const CHAT_PROMPTS = {
  grammar: (text) =>
    `Rett grammatikk, tegnsetting og stavefeil. Skriv den rettede teksten mellom <svar> og </svar>. Ingenting utenfor taggene.\n\n<svar>${text}</svar>`,

  bokmalToNynorsk: (text) =>
    `Oversett fra bokmål til nynorsk. Skriv oversettelsen mellom <svar> og </svar>. Ingenting utenfor taggene.\n\n<svar>${text}</svar>`,

  nynorskToBokmal: (text) =>
    `Oversett fra nynorsk til bokmål. Skriv oversettelsen mellom <svar> og </svar>. Ingenting utenfor taggene.\n\n<svar>${text}</svar>`,

  style: (text) =>
    `Forbedre stilen — klarere og mer flytende, behold innholdet. Skriv den forbedrede teksten mellom <svar> og </svar>. Ingenting utenfor taggene.\n\n<svar>${text}</svar>`,
};

export async function callOllama(action, text, extraPrompt) {
  if (action === 'generate') {
    return callGenerate(text, extraPrompt);
  }

  const buildPrompt = CHAT_PROMPTS[action];
  if (!buildPrompt) throw new Error('Unknown action: ' + action);

  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: buildPrompt(text) },
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama feil: ${response.status} — ${err}`);
  }

  return streamChat(response);
}

async function callGenerate(docText, instruction) {
  // Build a raw completion prompt — model just continues the text
  const prompt = docText.trim()
    ? `${docText.trim()}\n\n${instruction}:\n`
    : `${instruction}:\n`;

  const response = await fetch(GEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama feil: ${response.status} — ${err}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split('\n').filter(Boolean)) {
      try {
        const data = JSON.parse(line);
        if (data.response) result += data.response;
        if (data.done) return result.trim();
      } catch { /* skip */ }
    }
  }

  return result.trim();
}

async function streamChat(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split('\n').filter(Boolean)) {
      try {
        const data = JSON.parse(line);
        const token = data?.message?.content ?? '';
        if (token) fullText += token;
        if (data.done) return extractAnswer(fullText);
      } catch { /* skip */ }
    }
  }

  return extractAnswer(fullText);
}

function extractAnswer(raw) {
  const match = raw.match(/<svar>([\s\S]*?)<\/svar>/i);
  if (match) return match[1].trim();

  const openMatch = raw.match(/<svar>([\s\S]*)/i);
  if (openMatch) return openMatch[1].trim();

  return raw
    .replace(/^[\s\S]*?(?:versjonen:|følgende:|teksten:)\s*/i, '')
    .replace(/\n\nMerk at[\s\S]*/i, '')
    .replace(/\n\nJeg håper[\s\S]*/i, '')
    .trim();
}
