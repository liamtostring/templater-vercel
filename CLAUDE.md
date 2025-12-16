# CLAUDE.md - Vercel Edition

This file provides guidance to Claude Code when working with the **Vercel-optimized version** of Templater.

## Project Overview

**Templater Vercel Edition** is a serverless version of the Templater app, built with Next.js 14 + TypeScript and optimized for Vercel deployment. It uses **Vercel Blob** for file storage and **Prisma Postgres** for session/config management.

### Key Differences from Original Version

1. **Storage Backend:**
   - Original: Local filesystem (`uploads/`, `data/config.json`)
   - Vercel: Vercel Blob (files) + Prisma Postgres (config/sessions)

2. **Deployment:**
   - Original: VPS with PM2/Docker
   - Vercel: Serverless functions with auto-scaling

3. **Session Management:**
   - Original: In-memory Map with filesystem persistence
   - Vercel: Prisma Postgres database

4. **File Operations:**
   - Original: Node.js `fs` module
   - Vercel: `@vercel/blob` SDK

## Architecture

```
src/
├── lib/
│   ├── prisma.ts             # Prisma client instance (with Accelerate)
│   ├── storage.ts            # Prisma-based storage (API keys, prompts, sessions)
│   ├── blob-storage.ts       # Vercel Blob adapter (file operations)
│   ├── file-storage.ts       # Unified interface (wraps blob-storage)
│   ├── auth.ts               # Authentication (unchanged)
│   ├── auth-middleware.ts    # Session validation (uses storage.ts)
│   ├── docx-converter.ts     # DOCX → Markdown (unchanged)
│   ├── ai-service.ts         # Gemini/OpenAI integration (unchanged)
│   ├── template-processor.ts # Variable parsing (unchanged)
│   └── prompt-library.ts     # Prompt CRUD (uses storage.ts)
├── generated/
│   └── prisma/               # Generated Prisma client
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
prisma/
├── schema.prisma             # Database schema
└── migrations/               # Database migrations
```

## Storage Layer

### Prisma Postgres Storage (`src/lib/storage.ts`)

**Purpose:** Store persistent configuration and session data

**Implementation:**
- Uses Prisma ORM with `@prisma/extension-accelerate`
- Connects to Prisma Postgres (serverless PostgreSQL)
- Uses `Setting` model for key-value storage

**Key Methods:**
- `Storage.getAsync<T>(key, defaultValue)` - Retrieve value
- `Storage.setAsync<T>(key, value)` - Save value (upsert)
- `Storage.deleteAsync(key)` - Delete value
- `Storage.getAllAsync<T>(pattern)` - Get all matching pattern (uses `startsWith`)

**Database Schema (`prisma/schema.prisma`):**
```prisma
model Setting {
  key       String   @id
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Prompt {
  id        String   @id
  name      String
  content   String   @db.Text
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Session {
  id        String   @id
  username  String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**Data Stored in Setting table:**
- `gemini_api_key` - Gemini API key
- `openai_api_key` - OpenAI API key
- `prompt_default` - Default prompt
- `prompt_*` - Custom prompts
- `session_*` - User sessions

### Prisma Client (`src/lib/prisma.ts`)

**Purpose:** Create and manage Prisma client instance

**Implementation:**
```typescript
import { PrismaClient } from '@/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

function createPrismaClient() {
  const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
  return new PrismaClient({
    accelerateUrl: url,
  }).$extends(withAccelerate());
}
```

- Uses `PRISMA_DATABASE_URL` for app queries (Accelerate URL)
- Singleton pattern prevents multiple connections in development

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

### Prisma 7 Configuration

Prisma 7 uses a new configuration format:

**`prisma.config.ts`:**
```typescript
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: env("POSTGRES_URL"),  // Direct URL for migrations
  },
});
```

**Environment Variables:**
- `PRISMA_DATABASE_URL` - Accelerate URL (for app queries via Prisma client)
- `POSTGRES_URL` - Direct URL (for migrations via `prisma migrate`)

### Build Script

The build script generates the Prisma client before building:

```json
"scripts": {
  "build": "prisma generate && next build"
}
```

### Serverless Constraints

1. **No filesystem access** - All files go to Vercel Blob
2. **Stateless functions** - Sessions stored in Prisma Postgres
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
- `PRISMA_DATABASE_URL` - Prisma Accelerate URL (for app queries)
- `POSTGRES_URL` - Direct Postgres URL (for migrations)
- `BLOB_READ_WRITE_TOKEN` - Auto-injected by Vercel

### Optional

- `GEMINI_API_KEY` - Pre-configure Gemini key
- `OPENAI_API_KEY` - Pre-configure OpenAI key

### Local Development

Create `.env`:

```env
# Direct URL for migrations
POSTGRES_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"

# Accelerate URL for app queries
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```

Pull from Vercel if already deployed:
```bash
vercel link
vercel env pull .env.development.local
```

## Deployment

### Initial Setup

1. Create Prisma Postgres database at [console.prisma.io](https://console.prisma.io)
2. Get connection strings (`PRISMA_DATABASE_URL`, `POSTGRES_URL`)
3. Add to Vercel environment variables
4. Link Vercel Blob storage
5. Run migration: `npx prisma migrate dev --name init`
6. Deploy

### Vercel CLI

```bash
vercel login
vercel link
vercel env pull .env.development.local
npx prisma migrate dev --name init
vercel deploy
vercel --prod
```

## Key Files Modified from Original

| File | Changes |
|------|---------|
| `src/lib/prisma.ts` | New file - Prisma client with Accelerate |
| `src/lib/storage.ts` | Rewritten for Prisma (was Edge Config) |
| `src/lib/blob-storage.ts` | Vercel Blob adapter (unchanged) |
| `src/lib/file-storage.ts` | Wraps blob-storage (unchanged) |
| `prisma/schema.prisma` | Database schema |
| `prisma.config.ts` | Prisma 7 configuration |
| `package.json` | Added prisma, @prisma/client, @prisma/extension-accelerate |

## Files Unchanged from Original

- `src/lib/auth.ts` - Authentication logic
- `src/lib/docx-converter.ts` - DOCX processing
- `src/lib/ai-service.ts` - Gemini/OpenAI integration
- `src/lib/template-processor.ts` - Variable parsing
- `src/lib/prompt-library.ts` - Uses Storage interface (unchanged API)
- `src/app/api/**/*.ts` - API routes (use abstracted storage)
- `src/components/**/*.tsx` - React components
- `src/app/**/*.tsx` - Pages and layouts

## Testing Locally

```bash
# Install dependencies
npm install

# Pull environment from Vercel (if deployed)
vercel env pull .env.development.local

# Or create .env manually with POSTGRES_URL and PRISMA_DATABASE_URL

# Run migration
npx prisma migrate dev --name init

# Run development server
npm run dev
```

## Common Development Tasks

### Add a New Prompt

1. User creates via UI (Prompt Library tab)
2. `PromptLibrary.saveAsync()` called
3. `Storage.setAsync()` upserts to `Setting` table
4. Value stored as JSON string

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
2. Creates session in database via `Storage.setAsync('session_{uuid}', data)`
3. Sets httpOnly cookie: `session_id={uuid}`
4. Subsequent requests: `checkAuth()` validates session from database
5. Logout: Deletes session via `Storage.deleteAsync('session_{uuid}')`

## Performance Considerations

1. **Connection pooling** - Prisma Accelerate handles this automatically
2. **Batch Blob operations** - List once, not per file
3. **Chunk large files** - Stay under 60s timeout
4. **Use streaming** - For large AI responses (future enhancement)

## Security Notes

- All file paths sanitized (`path.basename()`)
- Session cookies are httpOnly
- HTTPS enforced by Vercel
- Database credentials in environment variables

## Monitoring

- View logs: `vercel logs`
- Dashboard: Vercel deployment page → Functions tab
- Database: [console.prisma.io](https://console.prisma.io) → Your project
- Blob metrics: Vercel dashboard → Storage → Blob

## Future Enhancements

- [ ] Streaming AI responses
- [ ] Webhook-based batch processing
- [ ] Background cleanup jobs (Vercel Cron)
- [ ] Real-time progress (WebSocket/SSE)
- [ ] Multi-user support with per-user storage

## License

MIT
