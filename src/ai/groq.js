import 'dotenv/config';

const API_BASE = process.env.GROQ_API_BASE ?? 'https://api.groq.com/openai/v1';
const API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_MODEL = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';

/**
 * Ejecuta una llamada LLM vía Groq (OpenAI-compatible).
 *
 * - Devuelve el texto del modelo si todo OK.
 * - Si hay cualquier problema, devuelve el string **"FALSE"** (en mayúsculas).
 *
 * Docs: `https://console.groq.com/docs/overview` (Responses API)
 *
 * @param {string} prompt
 * @param {object} [opts]
 * @param {string} [opts.model]
 * @param {number} [opts.temperature]
 * @param {number} [opts.max_output_tokens]
 * @returns {Promise<string>}
 */
export async function pront(prompt, opts = {}) {
  try {
    if (!API_KEY) return 'FALSE';
    if (typeof prompt !== 'string' || !prompt.trim()) return 'FALSE';

    // Permite añadir un prefijo al texto generado por IA, configurable por variable de entorno
    const IA_CONTEXT = process.env.GROQ_CONTEXT ?? "";

    const base = API_BASE.replace(/\/$/, '');
    const res = await fetch(`${base}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        input: [
          {
            "role": "system",
            "content": IA_CONTEXT
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        // Estos campos existen en la Responses API OpenAI-compatible.
        temperature: 0.1,
        max_output_tokens: 600,
      })
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) return 'FALSE';

    // En Groq Responses suele venir `output_text` (según su doc).
    const outText = data?.output_text;
    if (typeof outText === 'string' && outText.trim()) return outText.trim();

    // Fallback defensivo por si cambia el shape.
    const content =
      data?.output?.[1]?.content?.map?.((c) => c?.text).filter(Boolean).join('') ??
      data?.choices?.[1]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) return 'FALSE';
    return content.trim();
  } catch {
    return 'FALSE';
  }
}

