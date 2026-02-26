# ai-exam-couch
An AI exam couch to practice AI toolings

## Overview
This project is a multi-turn tutoring agent built with Anthropic's Claude API. It's designed as a hands-on learning experience for practicing agentic patterns, tool use, and streaming responses.

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

### Run the basic streaming completion example:
```bash
npm start
```

### Run the advanced streaming example (with detailed event handling):
```bash
npm run start:advanced
```

### Run in development mode (with auto-reload):
```bash
npm run dev
```

### Build the TypeScript code:
```bash
npm run build
```

## Examples

### Basic Streaming
The basic example (`src/index.ts`) demonstrates:
- Simple streaming setup with Anthropic SDK
- Real-time text streaming
- Basic error handling
- Usage statistics

### Advanced Streaming
The advanced example (`src/advanced-streaming.ts`) demonstrates:
- Multiple event types (messageStart, contentBlockStart, text, etc.)
- Detailed event logging
- Token usage tracking
- Comprehensive error handling

## Project Structure
```
ai-exam-couch/
├── src/
│   ├── index.ts                # Basic streaming completion example
│   └── advanced-streaming.ts   # Advanced streaming with event handling
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Example environment variables
└── README.md                   # This file
```

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

