# Quick Start Guide - Templater Vercel Edition

Get started with Templater on Vercel in 5 minutes!

## Prerequisites

- Vercel account ([sign up free](https://vercel.com/signup))
- Gemini or OpenAI API key
- Node.js 18+ (for local development)

## Step 1: Deploy to Vercel

### Option A: GitHub (Recommended)

1. **Fork/Clone this repository**
   ```bash
   git clone https://github.com/yourusername/templater-vercel
   ```

2. **Push to your GitHub**
   ```bash
   cd templater-vercel
   git remote add origin https://github.com/yourusername/your-repo
   git push -u origin main
   ```

3. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Click "Deploy"

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd templater-vercel
vercel

# Follow prompts, then deploy to production
vercel --prod
```

## Step 2: Configure Storage

After deployment:

1. **Go to your Vercel project dashboard**
2. **Navigate to "Storage" tab**
3. **Create Vercel Blob:**
   - Click "Create Database" → "Blob"
   - Name: `templater-blob`
   - Click "Create"
   - Click "Connect to Project" → Select your project
4. **Create Vercel KV:**
   - Click "Create Database" → "KV"
   - Name: `templater-kv`
   - Click "Create"
   - Click "Connect to Project" → Select your project

Vercel will automatically inject these environment variables:
- `BLOB_READ_WRITE_TOKEN`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Step 3: Set Environment Variables

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `APP_USERNAME` | `admin` (or your username) | Production |
   | `APP_PASSWORD` | `your_secure_password` | Production |
   | `GEMINI_API_KEY` | `your_api_key` (optional) | Production |
   | `OPENAI_API_KEY` | `your_api_key` (optional) | Production |

3. Click **Save**
4. **Redeploy** to apply changes (Deployments → ⋮ → Redeploy)

## Step 4: Access Your App

1. Go to your deployment URL (e.g., `https://templater-xxx.vercel.app`)
2. Log in with your `APP_USERNAME` and `APP_PASSWORD`
3. You're in! 🎉

## Step 5: Configure AI Service

1. Click **Settings** tab
2. Add your Gemini or OpenAI API key
3. Select default model
4. Click **Save**

## Step 6: Upload a Template

1. Click **File Manager** tab
2. Click **Upload Template**
3. Upload a JSON file with placeholders:

   ```json
   {
     "title": "{{ hero_h1 }}",
     "description": "{{ hero_text }}",
     "cta": "{{ hero_cta }}"
   }
   ```

## Step 7: Process Your First File

1. Click **Single Processing** tab
2. Upload a DOCX file
3. Select your template
4. Select AI service and model
5. Click **Process**
6. View preview and download result

## 🎯 Next Steps

- **Batch Processing:** Process multiple files at once
- **Custom Prompts:** Create reusable prompts in Prompt Library
- **Custom Domain:** Add a custom domain in Vercel settings
- **Monitor Usage:** Check Vercel Blob/KV usage in dashboard

## 🆘 Troubleshooting

### "Session not found" error
- Check that Vercel KV is connected (Storage tab)
- Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set

### "Failed to upload file" error
- Check that Vercel Blob is connected (Storage tab)
- Ensure `BLOB_READ_WRITE_TOKEN` is set

### Can't log in
- Check `APP_USERNAME` and `APP_PASSWORD` in environment variables
- Redeploy after setting variables

### Timeout errors
- Reduce batch chunk size in Batch Processing settings
- Consider upgrading to Vercel Pro (60s timeout vs. 10s)

## 📚 Further Reading

- **[README.md](./README.md)** - Full documentation
- **[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)** - Detailed deployment guide
- **[Vercel Docs](https://vercel.com/docs)** - Official Vercel documentation

## 🎉 You're Done!

Enjoy using Templater on Vercel! If you have questions or issues, open an issue on GitHub.

---

**Total setup time:** ~5-10 minutes
