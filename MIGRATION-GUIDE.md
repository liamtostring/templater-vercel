# Migration Guide: Original → Vercel Edition

This guide explains the architectural changes between the original (VPS) version and the Vercel edition.

## Overview of Changes

The Vercel edition replaces local filesystem and JSON file storage with cloud-based Vercel Blob and Vercel KV storage, enabling serverless deployment.

## Storage Layer Changes

### 1. Persistent Configuration Storage

**Original Version:**
```typescript
// src/lib/storage.ts (Original)
- Uses local filesystem
- Stores in data/config.json
- Synchronous file operations
- Single JSON file for all config
```

**Vercel Version:**
```typescript
// src/lib/storage.ts (Vercel)
- Uses Vercel KV (Redis)
- Distributed key-value store
- Async operations
- Index-based pattern matching
```

### 2. File Storage

**Original Version:**
```typescript
// src/lib/file-storage.ts (Original)
- Uses Node.js fs module
- Local uploads/ directory
- Synchronous file operations
- Path: uploads/{docx,templates,generated,enhanced}/
```

**Vercel Version:**
```typescript
// src/lib/blob-storage.ts (NEW)
// src/lib/file-storage.ts (Wrapper)
- Uses @vercel/blob SDK
- Cloud blob storage
- Async operations
- Path: {docx,templates,generated,enhanced}/filename
```

## Code Changes by File

### New Files

1. **`src/lib/blob-storage.ts`** (NEW)
   - Vercel Blob SDK wrapper
   - Methods: upload, download, delete, listFiles, etc.
   - Replaces all fs operations

### Modified Files

2. **`src/lib/storage.ts`** (REWRITTEN)
   - **Before:** Local JSON file storage
   - **After:** Vercel KV (Redis) storage
   - **Key Change:** Added index management for pattern matching

   ```typescript
   // Original
   private static loadConfig(): Record<string, any> {
     const data = fs.readFileSync(this.configFile, 'utf8');
     return JSON.parse(data);
   }

   // Vercel
   static async getAsync<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
     const fullKey = this.getKey(key);
     const value = await kv.get<T>(fullKey);
     return value ?? defaultValue;
   }
   ```

3. **`src/lib/file-storage.ts`** (REWRITTEN)
   - **Before:** Direct fs operations
   - **After:** Wrapper around BlobStorage
   - **Key Change:** Matches original API for drop-in replacement

   ```typescript
   // Original
   static async readFile(dirName: string, filename: string): Promise<Buffer | null> {
     const filePath = path.join(process.cwd(), 'uploads', dirName, filename);
     return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
   }

   // Vercel
   static async readFile(dirName: string, filename: string): Promise<Buffer | null> {
     try {
       return await BlobStorage.download(filename, dirName as any);
     } catch (error) {
       return null;
     }
   }
   ```

4. **`src/lib/prompt-library.ts`** (MODIFIED)
   - **Change:** Added index management
   - **Reason:** Vercel KV doesn't support pattern matching without index

   ```typescript
   // Added
   static async saveAsync(id: string, data: Prompt): Promise<boolean> {
     const success = await Storage.setAsync(id, data);
     if (success) {
       await Storage.addToIndex('prompt_', id); // NEW
     }
     return success;
   }

   static async deleteAsync(id: string): Promise<boolean> {
     const success = await Storage.deleteAsync(id);
     if (success) {
       await Storage.removeFromIndex('prompt_', id); // NEW
     }
     return success;
   }
   ```

### Unchanged Files

- `src/lib/auth.ts` - No changes
- `src/lib/auth-middleware.ts` - No changes (uses abstracted Storage)
- `src/lib/docx-converter.ts` - No changes
- `src/lib/ai-service.ts` - No changes
- `src/lib/template-processor.ts` - No changes
- All API routes (`src/app/api/**/*.ts`) - No changes
- All React components (`src/components/**/*.tsx`) - No changes
- All pages (`src/app/**/*.tsx`) - No changes

## Configuration Changes

### Environment Variables

**Original (.env):**
```env
APP_USERNAME=admin
APP_PASSWORD=generator9097
GEMINI_API_KEY=optional
OPENAI_API_KEY=optional
```

**Vercel (.env.local):**
```env
# Required
APP_USERNAME=admin
APP_PASSWORD=generator9097

# Auto-injected by Vercel (don't set manually)
BLOB_READ_WRITE_TOKEN=auto
KV_REST_API_URL=auto
KV_REST_API_TOKEN=auto

# Optional
GEMINI_API_KEY=optional
OPENAI_API_KEY=optional
```

### Dependencies

**New Dependencies:**
```json
{
  "@vercel/blob": "^0.23.4",
  "@vercel/kv": "^1.0.1"
}
```

### Configuration Files

**New Files:**
- `vercel.json` - Vercel deployment config

**Updated Files:**
- `next.config.js` - Removed Docker-specific config
- `.env.example` - Updated for Vercel variables

## Data Migration

### Manual Migration Required

There is **no automatic migration tool**. You must manually re-enter data:

1. **API Keys:**
   - Old: Stored in `data/config.json`
   - New: Re-enter in Settings UI (stored in Vercel KV)

2. **Prompts:**
   - Old: Stored in `data/config.json`
   - New: Re-create in Prompt Library UI (stored in Vercel KV)

3. **Files:**
   - Old: `uploads/{docx,templates,generated,enhanced}/`
   - New: Re-upload via File Manager UI (stored in Vercel Blob)

### Migration Steps

```bash
# 1. Export data from original version
cd original-templater
cat data/config.json > backup-config.json

# 2. List files
ls -R uploads/ > backup-files.txt

# 3. Manually re-enter in Vercel version:
# - Log in to deployed Vercel app
# - Settings → Add API keys
# - Prompt Library → Create prompts
# - File Manager → Upload files
```

## Deployment Differences

### Original (VPS)

```bash
npm run build
pm2 start npm --name templater -- start
```

- Persistent process
- No cold starts
- Manual scaling
- Requires VPS management

### Vercel

```bash
vercel --prod
```

- Serverless functions
- ~1-2s cold starts
- Auto-scaling
- Zero server management

## Performance Differences

| Metric | Original (VPS) | Vercel |
|--------|----------------|--------|
| **First request** | Instant | ~1-2s (cold start) |
| **Subsequent requests** | <50ms | <100ms |
| **File upload** | Direct to disk | Cloud upload |
| **Storage access** | Local fs (fast) | Network (slower) |
| **Scaling** | Manual | Automatic |
| **Concurrency** | Limited by server | Unlimited (serverless) |

## Cost Comparison

### Original (VPS)

- **VPS:** $5-20/month
- **Storage:** Included in VPS
- **Bandwidth:** Usually included
- **Total:** $5-20/month (fixed)

### Vercel

**Hobby Plan (Free):**
- Hosting: Free
- 1GB Blob storage
- 256MB KV storage
- 100GB bandwidth
- **Total:** $0/month

**Pro Plan:**
- Hosting: $20/month
- 100GB Blob storage
- 256MB KV storage
- 1TB bandwidth
- **Total:** $20/month + overages

## Limitations

### Original Version

✅ Full filesystem access
✅ No timeouts
✅ Long-running processes
❌ Manual scaling
❌ Requires server management

### Vercel Version

✅ Auto-scaling
✅ Zero server management
✅ Built-in CDN
❌ 60s max timeout (Pro) / 10s (Hobby)
❌ No filesystem access
❌ Cold starts (~1-2s)

## When to Use Each Version

### Use Original (VPS) When:

- You need long-running processes (>60s)
- You have existing VPS infrastructure
- You want maximum control
- You need local file access
- Cost-sensitive (high volume)

### Use Vercel When:

- You want zero server management
- You need auto-scaling
- You prefer serverless architecture
- You want fast deployment
- Low-to-medium volume usage

## Testing

### Original Version

```bash
npm run dev              # Local development
npm run build && npm start   # Production build
pm2 logs templater       # View logs
```

### Vercel Version

```bash
vercel dev               # Local development (with Vercel env)
vercel --prod            # Deploy to production
vercel logs              # View logs
```

## Troubleshooting

### Common Migration Issues

**Issue:** "Module not found: fs"
- **Cause:** Using original code in Vercel
- **Solution:** Ensure you're using `templater-vercel` version

**Issue:** "BLOB_READ_WRITE_TOKEN not set"
- **Cause:** Vercel Blob not linked
- **Solution:** Link in Vercel dashboard → Storage tab

**Issue:** "Session not found"
- **Cause:** Vercel KV not linked
- **Solution:** Link in Vercel dashboard → Storage tab

**Issue:** Timeout errors
- **Cause:** Function timeout (10s Hobby, 60s Pro)
- **Solution:** Reduce batch size or upgrade to Pro

## Summary

The Vercel edition maintains the same functionality as the original while adapting the storage layer for serverless deployment. API routes and frontend code remain largely unchanged thanks to the abstracted storage interface.

**Key Takeaway:** The Vercel version is a **drop-in cloud replacement** with minimal code changes, achieved through careful abstraction of storage operations.
