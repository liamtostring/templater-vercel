# CLAUDE.md - Vercel Edition

This file provides guidance to Claude Code when working with the **Vercel-optimized version** of Templater.

## Project Overview

**Templater Vercel Edition** is a serverless version of the Templater app, built with Next.js 14 + TypeScript and optimized for Vercel deployment. It uses **Vercel Blob** for file storage and **Vercel KV** for session/config management.

### Key Differences from Original Version

1. **Storage Backend:**
   - Original: Local filesystem (`uploads/`, `data/config.json`)
   - Vercel: Vercel Blob (files) + Vercel KV (config/sessions)

2. **Deployment:**
   - Original: VPS with PM2/Docker
   - Vercel: Serverless functions with auto-scaling

3. **Session Management:**
   - Original: In-memory Map with filesystem persistence
   - Vercel: Vercel KV (Redis-based)

4. **File Operations:**
   - Original: Node.js `fs` module
   - Vercel: `@vercel/blob` SDK

## Architecture

```
src/
├── lib/
│   ├── storage.ts            # Vercel KV adapter (API keys, prompts, sessions)
│   ├── blob-storage.ts       # Vercel Blob adapter (file operations)
│   ├── file-storage.ts       # Unified interface (wraps blob-storage)
│   ├── auth.ts               # Authentication (unchanged)
│   ├── auth-middleware.ts    # Session validation (uses storage.ts)
│   ├── docx-converter.ts     # DOCX → Markdown (unchanged)
│   ├── ai-service.ts         # Gemini/OpenAI integration (unchanged)
│   ├── template-processor.ts # Variable parsing (unchanged)
│   └── prompt-library.ts     # Prompt CRUD (uses storage.ts with indexing)
├── app/
│   ├── api/                  # API routes (serverless functions)
│   │   ├── auth/route.ts     # Login/logout/check
│   │   ├── settings/route.ts # API keys & prompts
│   │   ├── process/route.ts  # File processing
│   │   ├── upload/route.ts   # File uploads
│   │   └── files/route.ts    # File management
│   ├── page.tsx              # Main dashboard
│   ├── login/page.tsx        # Login page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
└── components/               # React components (unchanged)
    ├── SingleProcess.tsx
    ├── BatchProcess.tsx
    ├── PromptLibrary.tsx
    ├── Settings.tsx
    └── FileManager.tsx
```

## Storage Layer

### Vercel KV Storage (`src/lib/storage.ts`)

**Purpose:** Store persistent configuration and session data

**Implementation:**
- Uses `@vercel/kv` SDK
- All keys prefixed with `templater:`
- Index-based pattern matching (KV doesn't support Redis KEYS)

**Key Methods:**
- `Storage.getAsync<T>(key, defaultValue)` - Retrieve value
- `Storage.setAsync<T>(key, value)` - Save value
- `Storage.deleteAsync(key)` - Delete value
- `Storage.getAllAsync<T>(pattern)` - Get all matching pattern (uses index)
- `Storage.addToIndex(pattern, key)` - Add key to index
- `Storage.removeFromIndex(pattern, key)` - Remove key from index

**Data Stored:**
- `gemini_api_key` - Gemini API key
- `openai_api_key` - OpenAI API key
- `prompt_default` - Default prompt
- `prompt_*` - Custom prompts
- `session_*` - User sessions
- `index:prompt_` - Index of all prompt keys

### Vercel Blob Storage (`src/lib/blob-storage.ts`)

**Purpose:** Store uploaded files and generated output

**Implementation:**
- Uses `@vercel/blob` SDK
- Files organized by folder prefix (docx/, templates/, generated/, enhanced/)

**Key Methods:**
- `BlobStorage.upload(filename, content, folder)` - Upload file
- `BlobStorage.download(filename, folder)` - Download file as Buffer
- `BlobStorage.downloadText(filename, folder)` - Download file as string
- `BlobStorage.delete(filename, folder)` - Delete file
- `BlobStorage.listFiles(folder)` - List all files in folder
- `BlobStorage.deleteAllInFolder(folder)` - Delete all files
- `BlobStorage.exists(filename, folder)` - Check if file exists
- `BlobStorage.getUrl(filename, folder)` - Get public URL

**Folders:**
- `docx/` - Uploaded DOCX files
- `templates/` - JSON templates with {{ placeholders }}
- `generated/` - AI-processed JSON output
- `enhanced/` - Optional markdown output

### Unified File Storage (`src/lib/file-storage.ts`)

**Purpose:** Provide consistent interface matching original version

**Implementation:**
- Wraps `BlobStorage` methods
- Matches original `FileStorage` API for drop-in replacement

This allows API routes to remain mostly unchanged from the original version.

## Important Implementation Details

### Pattern Matching with Vercel KV

Vercel KV uses Upstash (Redis-compatible), which doesn't support `KEYS` command efficiently. We use an **index-based approach**:

1. When saving a prompt, call `Storage.addToIndex('prompt_', promptId)`
2. Index stored at `templater:index:prompt_` as array of keys
3. `getAllAsync('prompt_')` reads index and fetches each key

**Example:**
```typescript
// Save prompt
await Storage.setAsync('prompt_seo', promptData);
await Storage.addToIndex('prompt_', 'prompt_seo'); // Add to index

// Get all prompts
const prompts = await Storage.getAllAsync('prompt_'); // Uses index

// Delete prompt
await Storage.deleteAsync('prompt_seo');
await Storage.removeFromIndex('prompt_', 'prompt_seo'); // Remove from index
```

### Serverless Constraints

1. **No filesystem access** - All files go to Vercel Blob
2. **Stateless functions** - No in-memory session storage
3. **Timeout limits:**
   - Hobby plan: 10 seconds
   - Pro plan: 60 seconds
4. **Cold starts:** ~1-2s on first request

### Batch Processing

Client-side chunking is critical to avoid timeouts:

1. Files split into chunks (1-5 per chunk)
2. Each chunk processed sequentially
3. 1-second delay between chunks
4. Progress tracked in UI

## Environment Variables

### Required (Production)

- `APP_USERNAME` - Login username
- `APP_PASSWORD` - Login password
- `BLOB_READ_WRITE_TOKEN` - Auto-injected by Vercel
- `KV_REST_API_URL` - Auto-injected by Vercel
- `KV_REST_API_TOKEN` - Auto-injected by Vercel

### Optional

- `GEMINI_API_KEY` - Pre-configure Gemini key
- `OPENAI_API_KEY` - Pre-configure OpenAI key

### Local Development

Create `.env.local`:

```env
APP_USERNAME=admin
APP_PASSWORD=test123

# Pull from Vercel:
# vercel env pull
```

## Deployment

### Vercel Dashboard

1. Link Vercel Blob storage (auto-injects `BLOB_READ_WRITE_TOKEN`)
2. Link Vercel KV storage (auto-injects KV credentials)
3. Add environment variables: `APP_USERNAME`, `APP_PASSWORD`
4. Deploy

### Vercel CLI

```bash
vercel login
vercel
vercel --prod
```

## Key Files Modified from Original

| File | Changes |
|------|---------|
| `src/lib/storage.ts` | Complete rewrite for Vercel KV |
| `src/lib/blob-storage.ts` | New file for Vercel Blob |
| `src/lib/file-storage.ts` | Rewritten to wrap blob-storage |
| `src/lib/prompt-library.ts` | Added index management |
| `package.json` | Added @vercel/blob, @vercel/kv |
| `vercel.json` | New configuration file |
| `.env.example` | Updated for Vercel variables |

## Files Unchanged from Original

- `src/lib/auth.ts` - Authentication logic
- `src/lib/docx-converter.ts` - DOCX processing
- `src/lib/ai-service.ts` - Gemini/OpenAI integration
- `src/lib/template-processor.ts` - Variable parsing
- `src/app/api/**/*.ts` - API routes (use abstracted storage)
- `src/components/**/*.tsx` - React components
- `src/app/**/*.tsx` - Pages and layouts

## Testing Locally

```bash
# Install dependencies
npm install

# Pull environment from Vercel (if deployed)
vercel env pull

# Or create .env.local manually
cp .env.example .env.local

# Run development server
npm run dev
```

**Note:** Local development requires Vercel storage credentials. Either:
1. Deploy first, then `vercel env pull`
2. Create local Vercel Blob/KV stores for testing

## Common Development Tasks

### Add a New Prompt

1. User creates via UI (Prompt Library tab)
2. `PromptLibrary.saveAsync()` called
3. Saves to KV: `templater:prompt_{id}`
4. Adds to index: `templater:index:prompt_`

### Upload a File

1. User uploads via UI (Single/Batch Processing)
2. `FileStorage.writeFile()` called
3. Wraps `BlobStorage.upload()`
4. Uploads to Vercel Blob with path `docx/filename.docx`

### Process a File

1. User clicks "Process"
2. API route `/api/process` called
3. Downloads DOCX from Blob
4. Converts to Markdown
5. Sends to AI service
6. Parses variables
7. Processes template
8. Uploads JSON to Blob (`generated/`)

### Session Management

1. User logs in → `/api/auth` (action: login)
2. Creates session in KV: `templater:session_{uuid}`
3. Sets httpOnly cookie: `session_id={uuid}`
4. Subsequent requests: `checkAuth()` validates session from KV
5. Logout: Deletes session from KV

## Performance Considerations

1. **Minimize KV reads** - Cache in API route scope (not across invocations)
2. **Batch Blob operations** - List once, not per file
3. **Chunk large files** - Stay under 60s timeout
4. **Use streaming** - For large AI responses (future enhancement)

## Security Notes

- All file paths sanitized (`path.basename()`)
- Session cookies are httpOnly
- API keys encrypted in KV (future enhancement)
- HTTPS enforced by Vercel

## Monitoring

- View logs: `vercel logs`
- Dashboard: Vercel deployment page → Functions tab
- KV metrics: Vercel dashboard → Storage → KV
- Blob metrics: Vercel dashboard → Storage → Blob

## Future Enhancements

- [ ] Streaming AI responses
- [ ] Webhook-based batch processing
- [ ] Encrypt API keys in KV
- [ ] Background cleanup jobs (Vercel Cron)
- [ ] Real-time progress (WebSocket/SSE)
- [ ] Multi-user support with per-user storage

## License

MIT
