# Templater - Vercel Deployment Guide

This is the **Vercel-compatible version** of Templater, optimized for serverless deployment with **Vercel Blob** storage and **Vercel KV** for session management.

## Key Differences from Original Version

| Feature | Original Version | Vercel Version |
|---------|-----------------|----------------|
| **File Storage** | Local filesystem (`uploads/`) | Vercel Blob Storage |
| **Config/Session Storage** | Local JSON file (`data/config.json`) | Vercel KV (Redis) |
| **Deployment** | VPS with PM2/Docker | Vercel serverless |
| **Scalability** | Single instance | Auto-scaling serverless |
| **Cold Starts** | None (persistent process) | ~1-2s (serverless) |

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Node.js 18+** installed locally
3. **Vercel CLI** (optional, for local testing)

```bash
npm install -g vercel
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd templater-vercel
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file (for local development):

```env
# Authentication
APP_USERNAME=admin
APP_PASSWORD=your_secure_password

# Optional: Pre-configure API keys
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

**Note:** Don't add `BLOB_READ_WRITE_TOKEN` or Vercel KV variables locally. Vercel automatically injects these in production.

### 3. Create Vercel Blob Storage

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **Create Database** → **Blob**
3. Name it `templater-blob`
4. Copy the connection token (auto-linked to your project)

### 4. Create Vercel KV Store

1. Go to **Storage** → **Create Database** → **KV**
2. Name it `templater-kv`
3. Copy the connection credentials (auto-linked to your project)

### 5. Deploy to Vercel

#### Option A: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts to link storage
# Add environment variables:
# - APP_USERNAME
# - APP_PASSWORD
# - GEMINI_API_KEY (optional)
# - OPENAI_API_KEY (optional)

# Deploy to production
vercel --prod
```

#### Option B: Deploy via GitHub

1. Push this folder to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect Next.js
5. Add environment variables in the Vercel dashboard:
   - `APP_USERNAME`
   - `APP_PASSWORD`
   - `GEMINI_API_KEY` (optional)
   - `OPENAI_API_KEY` (optional)
6. Link Blob and KV storage in **Storage** tab
7. Click **Deploy**

### 6. Link Storage to Project

After deploying, ensure storage is linked:

1. Go to your project in Vercel dashboard
2. Navigate to **Storage** tab
3. Click **Connect Store** for both:
   - Vercel Blob (for files)
   - Vercel KV (for sessions/config)

Vercel will automatically inject the required environment variables:
- `BLOB_READ_WRITE_TOKEN`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Local Development

To test locally with Vercel storage:

```bash
# Pull environment variables from Vercel
vercel env pull

# Run development server
npm run dev
```

This creates a `.env.local` file with production storage credentials. **Do NOT commit this file.**

## Usage

Once deployed, access your app at:

```
https://your-project-name.vercel.app
```

### First-Time Setup

1. Navigate to your app URL
2. Log in with `APP_USERNAME` and `APP_PASSWORD`
3. Go to **Settings** tab
4. Add your Gemini or OpenAI API key
5. Upload templates and DOCX files

### Workflow

1. **Upload Template** (JSON with `{{ placeholders }}`)
2. **Upload DOCX** files
3. **Process** files (single or batch)
4. **Download** generated JSON files

## Storage Management

### Vercel Blob

- **Purpose:** Store uploaded DOCX files, templates, and generated JSON
- **Folders:**
  - `docx/` - Input DOCX files
  - `templates/` - JSON templates
  - `generated/` - AI-processed JSON output
  - `enhanced/` - Optional markdown output
- **Limits:**
  - Hobby plan: 1GB storage, 100GB bandwidth/month
  - Pro plan: 100GB storage, 1TB bandwidth/month
- **Pricing:** [vercel.com/docs/storage/vercel-blob/usage-and-pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)

### Vercel KV

- **Purpose:** Store API keys, prompts, and session data
- **Data Stored:**
  - User sessions (expires after 24h)
  - API keys (Gemini, OpenAI)
  - Custom prompts
  - User settings
- **Limits:**
  - Hobby plan: 256MB, 30 requests/day
  - Pro plan: 256MB, unlimited requests
- **Pricing:** [vercel.com/docs/storage/vercel-kv/usage-and-pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)

## Serverless Function Limits

- **Max execution time:** 60 seconds (Pro plan) / 10 seconds (Hobby)
- **Max request body:** 4.5MB
- **Recommended batch size:** 1-3 files per chunk (to avoid timeouts)

**Note:** Batch processing uses client-side chunking to process files sequentially within timeout limits.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_USERNAME` | ✅ Yes | Login username |
| `APP_PASSWORD` | ✅ Yes | Login password |
| `BLOB_READ_WRITE_TOKEN` | ✅ Auto | Vercel Blob token (auto-injected) |
| `KV_REST_API_URL` | ✅ Auto | Vercel KV URL (auto-injected) |
| `KV_REST_API_TOKEN` | ✅ Auto | Vercel KV token (auto-injected) |
| `GEMINI_API_KEY` | ❌ Optional | Pre-configure Gemini API key |
| `OPENAI_API_KEY` | ❌ Optional | Pre-configure OpenAI API key |

## Monitoring & Debugging

### View Logs

```bash
# Real-time logs
vercel logs

# Filter by function
vercel logs --follow
```

### Debugging API Routes

1. Go to Vercel dashboard → **Deployments** → Select deployment
2. Click **Functions** tab
3. View execution logs for each API route

### Common Issues

#### 1. "Session not found" errors

**Cause:** Vercel KV not linked or credentials missing

**Solution:**
- Check **Storage** tab in Vercel dashboard
- Ensure KV store is linked
- Verify environment variables are set

#### 2. "Failed to upload file" errors

**Cause:** Vercel Blob not linked or token missing

**Solution:**
- Check **Storage** tab in Vercel dashboard
- Ensure Blob storage is linked
- Verify `BLOB_READ_WRITE_TOKEN` is set

#### 3. Timeout errors during batch processing

**Cause:** Serverless function timeout (10s on Hobby, 60s on Pro)

**Solution:**
- Reduce batch chunk size (Settings → Batch Size)
- Upgrade to Vercel Pro for 60s timeout
- Process files individually instead of batch

#### 4. "Module not found: fs" errors

**Cause:** Node.js `fs` module not available in serverless

**Solution:**
- This version uses Vercel Blob instead of `fs`
- Ensure you're using `templater-vercel` (not original version)
- Check `next.config.js` has `fs: false` in webpack config

## Migration from Original Version

If you're migrating from the VPS/local version:

### Data Migration

1. **API Keys & Prompts:**
   - Export from original: Check `data/config.json`
   - Re-enter in Vercel version via Settings UI

2. **Files:**
   - Download from `uploads/` folders
   - Re-upload via Vercel version UI

3. **Templates:**
   - Copy JSON templates from `uploads/templates/`
   - Upload via File Manager

### No Automatic Migration

There's no automated migration tool. Manual re-upload is required since storage backends are fundamentally different (filesystem vs. cloud blob storage).

## Security Best Practices

1. **Use Strong Passwords**
   - Set complex `APP_PASSWORD` in environment variables
   - Don't use default credentials

2. **Protect API Keys**
   - Never commit `.env` or `.env.local` to Git
   - Store API keys in Vercel environment variables
   - Rotate keys periodically

3. **Enable HTTPS**
   - Vercel provides free SSL certificates
   - Always access via `https://`

4. **Limit Access**
   - Consider IP whitelisting (Vercel Pro feature)
   - Use strong session cookies (already enabled)

## Performance Optimization

### Cold Starts

- **First request:** ~1-2s (serverless cold start)
- **Subsequent requests:** <100ms
- **Mitigation:** Keep app active with uptime monitoring (e.g., UptimeRobot)

### File Processing

- **Small files (<1MB):** ~2-5s per file
- **Large files (1-5MB):** ~5-15s per file
- **AI processing:** Depends on Gemini/OpenAI response time (~2-10s)

### Batch Processing

- Process files in chunks of 1-3 to avoid timeouts
- Client-side chunking ensures no single request exceeds 60s

## Cost Estimation

### Hobby Plan (Free)

- **Vercel Hosting:** Free
- **Blob Storage:** 1GB free
- **KV Storage:** 256MB free
- **Function Executions:** Unlimited (10s timeout)
- **Bandwidth:** 100GB/month

**Best for:** Personal use, <100 files/month

### Pro Plan ($20/month)

- **Vercel Hosting:** $20/month
- **Blob Storage:** 100GB included
- **KV Storage:** 256MB included
- **Function Executions:** Unlimited (60s timeout)
- **Bandwidth:** 1TB/month

**Best for:** Team use, production workloads

## Support & Troubleshooting

1. **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Blob Docs:** [vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob)
3. **Vercel KV Docs:** [vercel.com/docs/storage/vercel-kv](https://vercel.com/docs/storage/vercel-kv)
4. **GitHub Issues:** Report bugs in the repository

## Updating the App

### Automatic Updates (GitHub)

If deployed via GitHub integration:

1. Push changes to your repository
2. Vercel auto-deploys on every push to `main`
3. Check deployment status in Vercel dashboard

### Manual Updates (CLI)

```bash
# Pull latest changes
git pull

# Deploy
vercel --prod
```

## Backup & Recovery

### Backup Data

**API Keys & Prompts (Vercel KV):**
- Export via Settings UI (copy/paste)
- Or use Vercel CLI: `vercel env pull`

**Files (Vercel Blob):**
- Download via File Manager UI
- Or use Vercel Blob API to list and download

### Disaster Recovery

1. Re-create Vercel Blob and KV stores
2. Re-link to project
3. Re-upload files and re-enter settings

**Recommendation:** Regularly backup generated files and API keys locally.

## Limitations

1. **No local file access:** All files stored in Vercel Blob (cloud)
2. **Session persistence:** Sessions expire after 24h
3. **No cron jobs:** No automatic cleanup (manual deletion required)
4. **Function timeout:** Max 60s per request (Pro) / 10s (Hobby)
5. **Cold starts:** First request ~1-2s slower

## Advanced Configuration

### Custom Domain

1. Go to project in Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Add your domain (e.g., `templater.yourdomain.com`)
4. Configure DNS records as instructed

### Environment-Specific Variables

```bash
# Add variable for production only
vercel env add APP_USERNAME production

# Add variable for preview/development
vercel env add APP_USERNAME preview
```

### Increase Function Timeout

1. Upgrade to Vercel Pro
2. Go to **Settings** → **Functions**
3. Set max duration to 60s

## Conclusion

This Vercel version provides a fully serverless, auto-scaling deployment of Templater with minimal maintenance. Perfect for teams that want zero-config infrastructure.

For VPS deployments with full control, use the [original version](../README.md).

---

**Questions?** Open an issue on GitHub or consult Vercel docs.
