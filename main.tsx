import { Hono } from 'hono';
import { logger } from 'hono/logger';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY environment variable is not set');

async function generateRandomQuote(model: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: 'Generate a meaningful and thought-provoking quote. Output only the quote text without quotes.',
        },
      ],
      temperature: 2,
      reasoning_effort: 'high',
    }),
  });
  if (!res.ok) throw new Error('Failed to fetch quote from Groq API');
  try {
    const data = await res.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response structure from Groq API');
    }
    const quote = data.choices[0].message.content;
    if (typeof quote !== 'string') {
      throw new Error('Quote content is not a string');
    }
    return quote;
  } catch (e) {
    throw new Error('Failed to parse response from Groq API', { cause: e });
  }
}

const app = new Hono();

app.use(logger());

app.get('/:color-scheme', async (c) => {
  const colorScheme = c.req.param('color-scheme');
  if (colorScheme !== 'dark' && colorScheme !== 'light') return c.notFound();

  try {
    const model = Math.random() >= 0.5 ? 'openai/gpt-oss-20b' : 'openai/gpt-oss-120b';
    const quote = await generateRandomQuote(model);

    c.header('Content-Type', 'image/svg+xml');
    c.header('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate');
    return c.body((
      <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' preserveAspectRatio='none'>
        <style>
          {`:root{color-scheme:${colorScheme};color:${
            colorScheme === 'dark' ? '#fff' : '#000'
          };}q::before{margin-inline-end:.1rem;}q::after{margin-inline-start:.1rem;}`}
        </style>
        <foreignObject x='0' y='0' width='100%' height='100%'>
          <div
            style='block-size:100%;display:flex;align-items:center;justify-content:center;font-size:1rem;line-height:1.5;'
            xmlns='http://www.w3.org/1999/xhtml'
          >
            <figure>
              <blockquote style='font-family:"Times New Roman",Times,serif;font-size:1.5rem;font-style:italic;'>
                <q>
                  {quote}
                </q>
              </blockquote>
              <figcaption style='float:right;'>
                <code>
                  — {model === 'openai/gpt-oss-20b' ? 'GPT OSS 20B' : 'GPT OSS 120B'}
                </code>
              </figcaption>
            </figure>
          </div>
        </foreignObject>
      </svg>
    ).toString());
  } catch (e) {
    console.error('Error generating quote:', e);
    return c.text('Failed to generate quote', 500);
  }
});

Deno.serve(app.fetch);
