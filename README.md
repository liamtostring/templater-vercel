# Templater - Vercel Edition

> AI-powered DOCX to JSON template processor, optimized for **Vercel** serverless deployment with **Vercel Blob** and **Prisma Postgres** storage.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/templater-vercel)

## 🚀 Quick Start

1. **Fork & Deploy to Vercel**
   - Click the "Deploy with Vercel" button above
   - Link Vercel Blob storage
   - Create Prisma Postgres database at [console.prisma.io](https://console.prisma.io)
   - Set environment variables: `APP_USERNAME`, `APP_PASSWORD`, `PRISMA_DATABASE_URL`, `POSTGRES_URL`

2. **Access Your App**
   - Navigate to your Vercel deployment URL
   - Log in with your credentials
   - Add API keys in Settings tab

3. **Start Processing**
   - Upload JSON templates
   - Upload DOCX files
   - Process and download results

## 📋 Features

- ✅ **DOCX → Markdown → AI Enhancement → JSON**
- ✅ **Google Gemini & OpenAI Support** (2.0 Flash, GPT-4o, etc.)
- ✅ **Batch Processing** with timeout-resistant chunking
- ✅ **Custom Prompts Library** for reusable templates
- ✅ **Vercel Blob Storage** for scalable file storage
- ✅ **Prisma Postgres** for session & config management (unlimited storage)
- ✅ **Auto-scaling Serverless** deployment
- ✅ **TypeScript + Next.js 14** (App Router)
- ✅ **Bootstrap 5 UI** with tabbed interface

## 🆚 Vercel vs. Original Version

| Feature | Original (VPS) | Vercel Edition |
|---------|---------------|----------------|
| **File Storage** | Local filesystem | Vercel Blob |
| **Config/Sessions** | JSON file (`data/config.json`) | Prisma Postgres |
| **Deployment** | PM2/Docker on VPS | Serverless (auto-scaling) |
| **Scalability** | Manual scaling | Automatic |
| **Maintenance** | Self-managed | Fully managed |
| **Cold Starts** | None | ~1-2s |
| **Cost** | VPS fees | Free (Hobby) / $20/mo (Pro) |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 14 App Router                    │
├─────────────────────────────────────────────────────────────────┤
│  API Routes (Serverless Functions)                              │
│  ├── /api/auth        - Login/logout/session check              │
│  ├── /api/settings    - API keys & prompts (CRUD)               │
│  ├── /api/process     - Single & batch file processing          │
│  ├── /api/upload      - File uploads (DOCX, JSON)               │
│  └── /api/files       - File management (list, delete)          │
├─────────────────────────────────────────────────────────────────┤
│  Storage Layer                                                   │
│  ├── Vercel Blob      - File storage (DOCX, JSON, templates)    │
│  └── Prisma Postgres  - Sessions, API keys, prompts (via Prisma)│
├─────────────────────────────────────────────────────────────────┤
│  Business Logic                                                  │
│  ├── docx-converter   - DOCX → Markdown (Mammoth + Turndown)    │
│  ├── ai-service       - Gemini/OpenAI integration               │
│  ├── template-processor - Variable parsing & JSON templating    │
│  └── prompt-library   - Custom prompt management                │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Bootstrap 5
- **AI Services:** Google Gemini, OpenAI
- **File Storage:** Vercel Blob
- **Database:** Prisma Postgres (via Prisma ORM + Accelerate)
- **Document Processing:** Mammoth.js, Turndown
- **Deployment:** Vercel (serverless)

## 🔧 Installation

### Prerequisites

- Node.js 18+
- Vercel account
- Prisma account (for Prisma Postgres)
- Gemini or OpenAI API key

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/templater-vercel
cd templater-vercel

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Pull Vercel storage credentials (if already deployed)
vercel link
vercel env pull .env.development.local

# Run database migration
npx prisma migrate dev --name init

# Run development server
npm run dev
```

Access at http://localhost:3000

### Deploy to Vercel

**Option 1: GitHub Integration (Recommended)**

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import repository
4. Link Blob storage
5. Add environment variables (see below)
6. Deploy

**Option 2: Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.development.local
npx prisma migrate dev --name init
vercel deploy
vercel --prod
```

See **[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)** for detailed instructions.

## 🌐 Environment Variables

```env
# Required - Authentication
APP_USERNAME=admin
APP_PASSWORD=your_secure_password

# Required - Prisma Postgres
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...
POSTGRES_URL=postgres://...@db.prisma.io:5432/postgres?sslmode=require

# Auto-injected by Vercel (don't set manually)
BLOB_READ_WRITE_TOKEN=auto_generated

# Optional - Pre-configure API keys
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

### Getting Prisma Postgres Credentials

1. Go to [console.prisma.io](https://console.prisma.io)
2. Create a new project
3. Create a Prisma Postgres database
4. Copy the connection strings:
   - `PRISMA_DATABASE_URL` - Accelerate URL (for app queries)
   - `POSTGRES_URL` - Direct URL (for migrations)

## 📖 Usage Guide

### 1. Upload Templates

Create a JSON template with `{{ placeholders }}`:

```json
{
  "title": "{{ hero_h1 }}",
  "subtitle": "{{ hero_text }}",
  "cta": "{{ hero_cta }}",
  "sections": [
    {
      "heading": "{{ sec1_h2 }}",
      "content": "{{ sec1_text }}",
      "button": "{{ sec1_cta }}"
    }
  ]
}
```

Upload via **File Manager** tab.

### 2. Upload DOCX Files

- Prepare DOCX files with structured content
- Upload via **Single Processing** or **Batch Processing** tab

### 3. Configure Prompts

Go to **Prompt Library** and create custom prompts:

```
Extract the following variables from this content:

hero_h1: Main headline
hero_text: Introductory paragraph
hero_cta: Call to action text

sec1_h2: First section heading
sec1_text: First section content
sec1_cta: First section button text
```

### 4. Process Files

**Single File:**
1. Select DOCX file
2. Select template
3. Choose AI service (Gemini/OpenAI)
4. Select model
5. Choose prompt
6. Click "Process"
7. View preview and download

**Batch Processing:**
1. Select multiple DOCX files
2. Select template
3. Configure batch size (1-5 files)
4. Click "Process Batch"
5. Monitor progress bar
6. Download all generated files

## 🔍 File Organization

Files are stored in Vercel Blob with the following structure:

```
vercel-blob://
├── docx/           # Uploaded DOCX files
├── templates/      # JSON templates
├── generated/      # AI-processed JSON output
└── enhanced/       # Optional markdown output
```

Persistent data (API keys, prompts, sessions) stored in Prisma Postgres:

```
Database Tables:
├── Setting         # Key-value storage (API keys, config)
├── Prompt          # Custom AI prompts
└── Session         # User sessions
```

## ⚙️ Configuration

### Batch Processing Settings

- **Chunk Size:** 1-5 files per request
- **Delay:** 1 second between chunks
- **Timeout:** 60s max (Pro plan) / 10s (Hobby)

### Supported Models

**Gemini:**
- gemini-2.0-flash-exp (fastest, latest)
- gemini-1.5-flash (stable)
- gemini-1.5-pro (most capable)

**OpenAI:**
- gpt-4o (latest)
- gpt-4o-mini (cost-effective)
- gpt-4-turbo

## 🛡️ Security

- ✅ Cookie-based session management
- ✅ Environment variable credentials
- ✅ httpOnly cookies (XSS protection)
- ✅ HTTPS enforced (Vercel default)
- ✅ File extension validation
- ✅ Path traversal protection

## 📊 Limits & Pricing

### Vercel Hobby Plan (Free)

- **Blob Storage:** 1GB
- **Function Timeout:** 10 seconds
- **Bandwidth:** 100GB/month

### Vercel Pro Plan ($20/month)

- **Blob Storage:** 100GB
- **Function Timeout:** 60 seconds
- **Bandwidth:** 1TB/month

### Prisma Postgres (Free Tier)

- **Storage:** 5GB
- **Queries:** Unlimited
- **Accelerate caching:** Included

See [Vercel pricing](https://vercel.com/pricing) and [Prisma pricing](https://www.prisma.io/pricing).

## 🐛 Troubleshooting

### Common Issues

**"Session not found"**
- Ensure Prisma Postgres database is created
- Check `PRISMA_DATABASE_URL` is set correctly
- Run `npx prisma migrate deploy` if tables are missing

**"Failed to upload file"**
- Ensure Vercel Blob is linked
- Check `BLOB_READ_WRITE_TOKEN` is set

**Timeout errors**
- Reduce batch chunk size
- Upgrade to Pro plan (60s timeout)
- Process files individually

**Cold start delays**
- First request ~1-2s slower (normal)
- Use uptime monitoring to keep warm

**Database connection errors**
- Verify `PRISMA_DATABASE_URL` format starts with `prisma+postgres://`
- Verify `POSTGRES_URL` format starts with `postgres://`

## 📚 Documentation

- **[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)** - Detailed deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - Technical architecture details
- **[Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)** - Blob storage API
- **[Prisma Postgres Docs](https://www.prisma.io/docs/orm/overview/databases/prisma-postgres)** - Database docs
- **[Next.js 14 Docs](https://nextjs.org/docs)** - Framework documentation

## 🤝 Contributing

This is a personal project. Feel free to fork and modify.

## 📄 License

MIT

## 🔗 Links

- **Original Version:** [VPS/Docker deployment](https://github.com/yourusername/templater) - Standalone version for VPS
- **Demo:** [templater-demo.vercel.app](https://templater-demo.vercel.app)
- **Support:** Open an issue on GitHub

---

**Built with Next.js, Vercel, Prisma, and AI**
