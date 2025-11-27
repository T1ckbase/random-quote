# Random Quote Generator

A simple Deno server that generates random quotes using the Groq API and returns them as themed SVG images.

## Setup

1. Obtain a Groq API key from [groq.com](https://groq.com).
2. Create a `.env` file in the project root with:
   ```
   GROQ_API_KEY=your_api_key_here
   ```

## Running

Start the development server:

```bash
deno task dev
```

The server runs on `http://localhost:8000` by default.

## Usage

- `/light` - Returns an SVG image with a random quote in light theme.
- `/dark` - Returns an SVG image with a random quote in dark theme.

Use the SVG URLs as image sources in your applications.
