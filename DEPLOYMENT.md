# Deployment Guide

## Vercel Deployment

This project is optimized for deployment on Vercel.

### Prerequisites
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)

### Steps

1. **Push your code to GitHub** (if not already done)
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In the Vercel project settings, go to "Environment Variables"
   - Add the following variable:
     - Name: `ANTHROPIC_API_KEY`
     - Value: Your Anthropic API key
     - Environment: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to the `main` branch
- **Preview**: Every push to other branches or pull requests

### Local Development

To run locally with the same environment:

1. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check that Node.js version is 18 or higher: `node --version`

### API Errors
- Verify your `ANTHROPIC_API_KEY` is set correctly in Vercel
- Check API key permissions at [console.anthropic.com](https://console.anthropic.com)

### Streaming Issues
- The API route uses Edge Runtime for optimal streaming
- Ensure your Vercel region supports Edge Functions

## Performance Tips

- Edge Runtime provides global low-latency responses
- Streaming is enabled by default for real-time responses
- Consider adding rate limiting for production use
