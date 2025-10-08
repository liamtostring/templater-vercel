# Templater - Vercel Edition

> AI-powered DOCX to JSON template processor, optimized for **Vercel** serverless deployment with **Vercel Blob** and **Vercel KV** storage.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/templater-vercel)

## 🚀 Quick Start

1. **Fork & Deploy to Vercel**
   - Click the "Deploy with Vercel" button above
   - Link Vercel Blob and Vercel KV storage
   - Set environment variables: `APP_USERNAME`, `APP_PASSWORD`

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
- ✅ **Vercel KV** for session & config management
- ✅ **Auto-scaling Serverless** deployment
- ✅ **TypeScript + Next.js 14** (App Router)
- ✅ **Bootstrap 5 UI** with tabbed interface

## 🆚 Vercel vs. Original Version

| Feature | Original (VPS) | Vercel Edition |
|---------|---------------|----------------|
| **Storage** | Local filesystem | Vercel Blob |
| **Config** | JSON file | Vercel KV (Redis) |
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
│  └── Vercel KV        - Sessions, API keys, prompts             │
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
- **Storage:** Vercel Blob, Vercel KV
- **Document Processing:** Mammoth.js, Turndown
- **Deployment:** Vercel (serverless)

## 🔧 Installation

### Prerequisites

- Node.js 18+
- Vercel account
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
vercel env pull

# Run development server
npm run dev
```

Access at http://localhost:3000

### Deploy to Vercel

**Option 1: GitHub Integration (Recommended)**

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import repository
4. Link Blob + KV storage
5. Add environment variables
6. Deploy

**Option 2: Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

See **[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)** for detailed instructions.

## 🌐 Environment Variables

```env
# Required
APP_USERNAME=admin
APP_PASSWORD=your_secure_password

# Auto-injected by Vercel (don't set manually)
BLOB_READ_WRITE_TOKEN=auto_generated
KV_REST_API_URL=auto_generated
KV_REST_API_TOKEN=auto_generated

# Optional
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

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

Persistent data (API keys, prompts, sessions) stored in Vercel KV:

```
vercel-kv://
├── templater:gemini_api_key
├── templater:openai_api_key
├── templater:prompt_default
├── templater:prompt_seo_optimizer
└── templater:session_abc123...
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
- **KV Storage:** 256MB
- **Function Timeout:** 10 seconds
- **Bandwidth:** 100GB/month

### Vercel Pro Plan ($20/month)

- **Blob Storage:** 100GB
- **KV Storage:** 256MB
- **Function Timeout:** 60 seconds
- **Bandwidth:** 1TB/month

See [pricing details](https://vercel.com/pricing).

## 🐛 Troubleshooting

### Common Issues

**"Session not found"**
- Ensure Vercel KV is linked in dashboard
- Check environment variables are set

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

## 📚 Documentation

- **[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)** - Detailed deployment guide
- **[Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)** - Blob storage API
- **[Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)** - KV storage API
- **[Next.js 14 Docs](https://nextjs.org/docs)** - Framework documentation

## 🤝 Contributing

This is a personal project. Feel free to fork and modify.

## 📄 License

MIT

## 🔗 Links

- **Original Version:** [VPS/Docker deployment](https://github.com/yourusername/templater)
- **Demo:** [templater-demo.vercel.app](https://templater-demo.vercel.app)
- **Support:** Open an issue on GitHub

---

**Built with ❤️ using Next.js, Vercel, and AI**
