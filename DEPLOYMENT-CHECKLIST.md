# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment of Templater to Vercel.

## Pre-Deployment

### 1. Local Setup

- [ ] Node.js 18+ installed
- [ ] Project cloned/forked
- [ ] Dependencies installed: `npm install`
- [ ] Environment variables configured (`.env.local`)
- [ ] Local development tested: `npm run dev`

### 2. Vercel Account

- [ ] Vercel account created ([vercel.com/signup](https://vercel.com/signup))
- [ ] Vercel CLI installed (optional): `npm install -g vercel`
- [ ] Logged in to Vercel: `vercel login`

### 3. Repository (GitHub/GitLab)

- [ ] Code pushed to Git repository
- [ ] Repository is public or connected to Vercel

## Deployment Steps

### 1. Import Project to Vercel

#### Via Vercel Dashboard:
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Click "Import Git Repository"
- [ ] Select your repository
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Root directory: `./` (or `templater-vercel` if in subfolder)
- [ ] Click "Deploy"

#### Via Vercel CLI:
- [ ] Run `vercel` in project directory
- [ ] Follow prompts to link project
- [ ] Run `vercel --prod` to deploy to production

### 2. Configure Storage

#### Vercel Blob:
- [ ] Go to project dashboard → **Storage** tab
- [ ] Click **Create Database** → **Blob**
- [ ] Name: `templater-blob` (or any name)
- [ ] Click **Create**
- [ ] Click **Connect to Project** → Select your project
- [ ] Verify `BLOB_READ_WRITE_TOKEN` appears in Environment Variables

#### Vercel KV:
- [ ] Go to project dashboard → **Storage** tab
- [ ] Click **Create Database** → **KV**
- [ ] Name: `templater-kv` (or any name)
- [ ] Click **Create**
- [ ] Click **Connect to Project** → Select your project
- [ ] Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` appear in Environment Variables

### 3. Set Environment Variables

- [ ] Go to project dashboard → **Settings** → **Environment Variables**
- [ ] Add the following variables:

| Variable | Value | Required |
|----------|-------|----------|
| `APP_USERNAME` | Your login username | ✅ Yes |
| `APP_PASSWORD` | Your secure password | ✅ Yes |
| `GEMINI_API_KEY` | Your Gemini API key | ❌ Optional |
| `OPENAI_API_KEY` | Your OpenAI API key | ❌ Optional |

- [ ] Click **Save** for each variable
- [ ] Verify `BLOB_READ_WRITE_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` are auto-injected

### 4. Redeploy

- [ ] Go to **Deployments** tab
- [ ] Click ⋮ menu on latest deployment → **Redeploy**
- [ ] Check "Use existing Build Cache" is **unchecked**
- [ ] Click **Redeploy**
- [ ] Wait for deployment to complete (~1-2 minutes)

## Post-Deployment

### 1. Verify Deployment

- [ ] Visit your deployment URL (e.g., `https://your-project.vercel.app`)
- [ ] Verify the login page loads
- [ ] Log in with `APP_USERNAME` and `APP_PASSWORD`
- [ ] Verify dashboard loads successfully

### 2. Configure Application

#### Settings Tab:
- [ ] Add Gemini API key (if not set in env variables)
- [ ] Add OpenAI API key (if not set in env variables)
- [ ] Select default AI service (Gemini or OpenAI)
- [ ] Select default model
- [ ] Click **Save API Keys**

#### Prompt Library:
- [ ] Verify default prompt exists
- [ ] Create additional custom prompts (optional)

#### File Manager:
- [ ] Upload a test JSON template
- [ ] Verify template appears in list

### 3. Test Processing

#### Single File Processing:
- [ ] Upload a test DOCX file
- [ ] Select template
- [ ] Select AI service and model
- [ ] Select prompt
- [ ] Click **Process**
- [ ] Verify preview displays
- [ ] Download generated JSON
- [ ] Verify JSON contains replaced variables

#### Batch Processing:
- [ ] Upload 2-3 test DOCX files
- [ ] Select template
- [ ] Configure batch size (1-3)
- [ ] Click **Process Batch**
- [ ] Verify progress bar updates
- [ ] Verify all files process successfully
- [ ] Download all generated files

### 4. Verify Storage

#### Vercel Blob:
- [ ] Go to Vercel dashboard → **Storage** → **Blob**
- [ ] Verify files exist in:
  - [ ] `docx/` folder (uploaded DOCX files)
  - [ ] `templates/` folder (uploaded JSON templates)
  - [ ] `generated/` folder (processed JSON files)

#### Vercel KV:
- [ ] Go to Vercel dashboard → **Storage** → **KV**
- [ ] Click **Data Browser**
- [ ] Verify keys exist:
  - [ ] `templater:gemini_api_key` (if set)
  - [ ] `templater:openai_api_key` (if set)
  - [ ] `templater:prompt_default`
  - [ ] `templater:session_*` (active session)

### 5. Test Session Management

- [ ] Log out
- [ ] Verify redirect to login page
- [ ] Log in again
- [ ] Verify session persists across page refreshes
- [ ] Close browser and reopen
- [ ] Verify session persists (24h expiry)

### 6. Monitor Performance

- [ ] Go to Vercel dashboard → **Deployments** → Select deployment
- [ ] Click **Functions** tab
- [ ] Verify functions executed successfully:
  - [ ] `/api/auth`
  - [ ] `/api/settings`
  - [ ] `/api/upload`
  - [ ] `/api/process`
- [ ] Check execution time (should be <10s Hobby, <60s Pro)
- [ ] Check for errors in logs

## Optional Enhancements

### Custom Domain

- [ ] Go to **Settings** → **Domains**
- [ ] Click **Add Domain**
- [ ] Enter your domain (e.g., `templater.yourdomain.com`)
- [ ] Configure DNS records as instructed
- [ ] Wait for SSL certificate (automatic, ~1-5 minutes)
- [ ] Verify HTTPS access

### Edge Middleware (Advanced)

- [ ] Add rate limiting
- [ ] Add IP whitelisting (Vercel Pro feature)
- [ ] Add custom headers

### Monitoring

- [ ] Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Configure alerts for downtime
- [ ] Enable Vercel Analytics (optional, paid feature)

## Troubleshooting

### Deployment Issues

**Build fails with "Module not found: fs"**
- [ ] Verify `next.config.js` has `fs: false` in webpack config
- [ ] Check you're deploying the Vercel version (not original)

**Environment variables not working**
- [ ] Verify variables are set in Vercel dashboard
- [ ] Check variable names are exact (case-sensitive)
- [ ] Redeploy after setting variables

**Storage connection errors**
- [ ] Verify Blob and KV are connected in Storage tab
- [ ] Check auto-injected tokens are present in env variables
- [ ] Try disconnecting and reconnecting storage

### Runtime Issues

**"Session not found" after login**
- [ ] Check Vercel KV is connected
- [ ] Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- [ ] Check session cookies are enabled in browser

**File upload fails**
- [ ] Check Vercel Blob is connected
- [ ] Verify `BLOB_READ_WRITE_TOKEN` is set
- [ ] Check file size (<4.5MB for serverless)
- [ ] Verify file extension (.docx or .json)

**Timeout errors during processing**
- [ ] Reduce batch chunk size (1-2 files)
- [ ] Check file sizes (large files take longer)
- [ ] Consider upgrading to Vercel Pro (60s vs 10s timeout)
- [ ] Process files individually instead of batch

**AI processing errors**
- [ ] Verify API keys are correct
- [ ] Check API quota/billing
- [ ] Test API keys manually (Gemini Studio, OpenAI Playground)
- [ ] Check API service status

### Logs & Debugging

- [ ] View real-time logs: `vercel logs --follow`
- [ ] View function logs: Dashboard → Deployments → Functions
- [ ] Check KV data: Dashboard → Storage → KV → Data Browser
- [ ] Check Blob files: Dashboard → Storage → Blob

## Maintenance

### Regular Tasks

- [ ] Monitor storage usage (Blob + KV)
- [ ] Rotate API keys periodically
- [ ] Clean up old files in Blob storage
- [ ] Review Vercel usage/billing
- [ ] Update dependencies: `npm update`

### Backup

- [ ] Export API keys (Settings → copy/paste)
- [ ] Download important templates
- [ ] Download generated files
- [ ] Export prompts (Prompt Library → copy content)

### Updates

- [ ] Pull latest code: `git pull`
- [ ] Test locally: `npm run dev`
- [ ] Deploy: `vercel --prod` or push to main branch

## Security Checklist

- [ ] Strong `APP_PASSWORD` set (12+ characters)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] API keys stored in environment variables (not hardcoded)
- [ ] Session cookies are httpOnly
- [ ] No sensitive data in Git repository
- [ ] `.env` and `.env.local` in `.gitignore`

## Performance Checklist

- [ ] First request <3s (cold start)
- [ ] Subsequent requests <200ms
- [ ] File upload <5s for small files (<1MB)
- [ ] AI processing <15s per file
- [ ] Batch processing completes without timeout

## Success Criteria

Your deployment is successful when:

- [ ] ✅ Login works correctly
- [ ] ✅ API keys can be saved and retrieved
- [ ] ✅ Templates can be uploaded
- [ ] ✅ DOCX files can be uploaded
- [ ] ✅ Single file processing works
- [ ] ✅ Batch processing works
- [ ] ✅ Generated files can be downloaded
- [ ] ✅ Sessions persist across browser refresh
- [ ] ✅ Logout works correctly
- [ ] ✅ No errors in Vercel logs

## Final Steps

- [ ] Bookmark your deployment URL
- [ ] Share access with team members
- [ ] Document any custom configuration
- [ ] Create backup of API keys
- [ ] Set up monitoring/alerts
- [ ] Consider custom domain
- [ ] Review usage limits (Hobby vs Pro)

---

## Quick Reference

### Useful Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# Pull environment variables
vercel env pull

# List deployments
vercel list

# Remove deployment
vercel remove [deployment-url]
```

### Useful Links

- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Blob Storage:** [vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob)
- **KV Storage:** [vercel.com/docs/storage/vercel-kv](https://vercel.com/docs/storage/vercel-kv)
- **Support:** [vercel.com/support](https://vercel.com/support)

---

**Congratulations!** 🎉 Your Templater app is now deployed on Vercel!
