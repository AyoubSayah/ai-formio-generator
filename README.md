# AI Form Generator Chat Application

An intelligent form generation platform that converts natural language descriptions into production-ready Form.io schemas. Simply describe your form in plain English, and watch as the AI generates a fully functional form in real-time.

## Workflow

The application uses a conversational AI approach to form generation. Users interact with a chat interface where they describe their desired form structure in natural language (e.g., "create a contact form with name, email, and message fields"). The backend processes this input through a Large Language Model (Groq API) which generates a validated Form.io JSON schema. The schema is then rendered in real-time on the frontend using Form.io's rendering engine. Users can iterate on their forms by providing additional instructions like "add a phone number field" or "make the email required", with the AI maintaining context from previous messages. The system also supports image uploads for form-based designs and can generate custom React components for Form.io.

## Developer Notes

Building this project was an incredible learning experience that pushed me to explore cutting-edge tools in the JavaScript ecosystem:

**LangChain Integration** - This was my first deep dive into LangChain, and I was genuinely impressed by how elegantly it handles LLM orchestration. The prompt engineering patterns and message management made it surprisingly straightforward to build complex conversational flows. What would have taken hundreds of lines of custom code was reduced to clean, maintainable abstractions.

**Rolldown + Vite** - I decided to use Rolldown (the Rust-based bundler) with Vite, and the build performance blew my mind. We're talking **5-6 second production builds** for a fairly substantial Vue 3 application with Form.io and all dependencies.

**Why This Matters** - When you're iterating on AI prompts and testing form generation, those seconds saved on each rebuild add up. The tight feedback loop made development genuinely enjoyable and let me focus on the creative problem-solving rather than waiting for builds.

This project represents not just a functional form generator, but a playground for modern web development patterns - from AI integration to blazingly fast build tools. Every technical choice was made with developer experience in mind.

## Tech Stack

**Backend (chat_backend):**

- NestJS (Node.js TypeScript framework)
- LangChain + Groq API (LLM integration)
- Form.io schema validation
- RESTful API endpoints

**Frontend (chat_front):**

- Vue 3 with Composition API
- Tailwind CSS for styling
- Form.io for dynamic form rendering
- Vite build tool

## Prerequisites

- **Node.js**: ^20.19.0 or >=22.12.0
- **pnpm**: 10.17.0 or higher
- **Groq API Key**: Get yours at [console.groq.com/keys](https://console.groq.com/keys)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd chat_formio
```

### 2. Install dependencies

**Backend:**

```bash
cd chat_backend
pnpm install
```

**Frontend:**

```bash
cd ../chat_front
pnpm install
```

## Configuration

### Backend Environment Setup

Create a `.env` file in the `chat_backend` directory:

```bash
cd chat_backend
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=meta-llama/llama-4-maverick-17b-128e-instruct
GROQ_TEMPERATURE=0.3
GROQ_MAX_TOKENS=4000
GROQ_TIMEOUT=60000
PORT=3000
```

### Frontend Environment (Optional)

The frontend uses default configuration. If needed, create `.env` in `chat_front`:

```env
VITE_API_URL=http://localhost:3000
```

## Running the Project

### Development Mode

You need to run both backend and frontend in separate terminal windows.

**Terminal 1 - Backend:**

```bash
cd chat_backend
pnpm run start:dev
```

The backend API will start on [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Frontend:**

```bash
cd chat_front
pnpm dev
```

The frontend will start on [http://localhost:5173](http://localhost:5173)

### Production Build

**Backend:**

```bash
cd chat_backend
pnpm run build
pnpm run start:prod
```

**Frontend:**

```bash
cd chat_front
pnpm build
pnpm preview
```

## Usage Examples

Once both servers are running, open your browser to [http://localhost:5173](http://localhost:5173) and try these prompts:

- **Simple Form**: "Create a contact form with name, email, and message"
- **Advanced Form**: "Make a registration form with name, email, password, date of birth, and agree to terms checkbox"
- **Form with Options**: "Create a survey with a dropdown to select (Excellent, Good, Fair, Poor)"
- **Form Styling**: "Create a login form with blue theme"
- **Image Upload**: Click the 📷 button to upload a form image and generate from it
- **Custom Component**: Switch to "Custom Component" mode and say "Create a star rating component"

## Testing

**Backend:**

```bash
cd chat_backend
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests
pnpm test:cov          # Coverage report
```

**Frontend:**

```bash
cd chat_front
pnpm test:unit         # Vitest unit tests
pnpm test:e2e          # Playwright E2E tests (requires: npx playwright install)
```

## Linting

**Backend:**

```bash
cd chat_backend
pnpm run lint
pnpm run format
```

**Frontend:**

```bash
cd chat_front
pnpm run lint          # Runs oxlint + eslint
pnpm run format
```

## Project Structure

```
chat_formio/
├── chat_backend/          # NestJS backend API
│   ├── src/
│   │   ├── ai/           # LLM service & prompt engineering
│   │   ├── chat/         # Chat controller & endpoints
│   │   └── forms/        # Form generation & validation
│   └── test/             # E2E tests
│
├── chat_front/           # Vue 3 frontend
│   ├── src/
│   │   ├── components/   # Vue components
│   │   │   ├── chat/     # ChatInterface
│   │   │   ├── forms/    # FormRenderer
│   │   │   └── code/     # CodeViewer
│   │   ├── views/        # Page views
│   │   └── composables/  # Composition API hooks
│   └── public/           # Static assets
│
└── README.md             # This file
```

## API Endpoints

- `POST /chat/generate-form` - Generate Form.io schema from natural language
- `POST /chat/chat` - General chat without form generation
- `POST /chat/generate-component` - Generate custom Form.io React component

## Features

- **Natural Language Processing**: Describe forms in plain English
- **Real-time Preview**: See your form rendered as you describe it
- **Conversation Context**: Iterate on forms with follow-up instructions
- **Image Recognition**: Upload form images for automatic conversion
- **Custom Components**: Generate production-ready React components
- **Schema Validation**: Automatic validation and sanitization of generated schemas
- **Export Options**: Copy JSON schema or download generated code
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Troubleshooting

**"GROQ_API_KEY not configured"**

- Make sure you created `.env` file in `chat_backend`
- Verify your API key is valid at [console.groq.com](https://console.groq.com)

**Port already in use**

- Backend: Change `PORT` in `chat_backend/.env`
- Frontend: Vite will automatically use next available port

**Build errors**

- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check Node.js version: `node --version` (should be ^20.19.0 or >=22.12.0)

## License

MIT
