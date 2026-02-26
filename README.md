# ai-exam-couch
An AI exam couch to practice AI toolings

## Goal
Build a multi-turn tutoring agent with real tool use and streaming.
Practice agentic patterns and tool chaining — not just chat completion.

## Overview
This is a Next.js project featuring a multi-turn tutoring agent built with Anthropic's Claude API. It's designed as a hands-on learning experience for practicing agentic patterns, tool use, and streaming responses. The project is deployed on Vercel for easy access and testing.

## Tasks
- [x] Set up Anthropic TypeScript SDK, basic streaming completion 📅 2026-02-28
- [ ] Define 3 tools: parse_answer / check_calculation / get_hint 📅 2026-03-01
- [ ] Build the tool execution loop — handle tool calls, feed results back 📅 2026-03-07
- [ ] Implement tool chaining logic — check_calculation result gates get_hint 📅 2026-03-07
- [ ] Prompt engineering: make the agent hint not answer (harder than it sounds) 📅 2026-03-21
- [ ] Manual test: play student yourself, break the agent intentionally 📅 2026-03-21
- [ ] Add multi-turn: student responds to hint, agent continues from context 📅 2026-03-28
- [ ] Stream interleaved tool calls + text output to a basic UI 📅 2026-03-28
- [ ] Read Simon Willison's blog — 2 posts/week alongside building 🔁 every week

## Notes
> **check_calculation** should be a real math evaluator (mathjs or similar), not AI.  
> The interesting problem is prompt control — the agent will want to just solve it. Fight that.  
> Don't add a vector store yet, use a hardcoded mock content store for **get_hint**. That comes in April.

## Setup

### Prerequisites
- Node.js (v18 or higher)
- An Anthropic API key (get one from [console.anthropic.com](https://console.anthropic.com/settings/keys))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/enes1004/ai-exam-couch.git
cd ai-exam-couch
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Usage

### Run the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the chat interface.

### Build for production:
```bash
npm run build
npm start
```

### Run standalone CLI examples:
```bash
# Basic streaming example
npm run example:basic

# Advanced streaming with event handling
npm run example:advanced
```

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your `ANTHROPIC_API_KEY` environment variable in Vercel project settings
4. Deploy!

## Examples

### Web UI
The main Next.js application provides an interactive chat interface with:
- Real-time streaming responses
- Multi-turn conversation support
- Clean, responsive UI with Tailwind CSS

### CLI Examples
- **Basic Streaming** (`src/examples/basic-streaming.ts`): Simple streaming setup with Anthropic SDK
- **Advanced Streaming** (`src/examples/advanced-streaming.ts`): Detailed event handling and logging

## Project Structure
```
ai-exam-couch/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # Streaming API endpoint
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Main chat interface
│   │   └── globals.css           # Global styles
│   └── examples/
│       ├── basic-streaming.ts    # CLI: Basic streaming example
│       └── advanced-streaming.ts # CLI: Advanced streaming with events
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── .env.example                  # Example environment variables
└── README.md                     # This file
```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS
- **Runtime**: Edge Runtime (for streaming)
- **Deployment**: Vercel

## Roadmap

### Tasks
- [x] Set up Anthropic TypeScript SDK, basic streaming completion 📅 2026-02-28
- [ ] Define 3 tools: parse_answer / check_calculation / get_hint 📅 2026-03-01
- [ ] Build the tool execution loop — handle tool calls, feed results back 📅 2026-03-07
- [ ] Implement tool chaining logic — check_calculation result gates get_hint 📅 2026-03-07
- [ ] Prompt engineering: make the agent hint not answer (harder than it sounds) 📅 2026-03-21
- [ ] Add multi-turn: student responds to hint, agent continues from context 📅 2026-03-28
- [ ] Stream interleaved tool calls + text output to a basic UI 📅 2026-03-28

## License
ISC

