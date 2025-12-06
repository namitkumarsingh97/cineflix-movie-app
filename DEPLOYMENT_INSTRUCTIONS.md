# Backend Deployment Instructions

## Issue: 404 Error on Auth Routes

The frontend is trying to use the production API (`https://cineflix-api-rho.vercel.app/api/auth/register`), but the backend on Vercel hasn't been deployed with the new authentication routes yet.

## Solution 1: Use Localhost for Development (Recommended)

1. **Start your local backend server:**
   ```bash
   cd ../cineflix-api
   npm start
   ```

2. **Create `.env.local` file in frontend** (already created):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

3. **Restart your frontend dev server:**
   ```bash
   cd ../cineflix-movie-app
   npm run dev
   ```

## Solution 2: Deploy Backend to Vercel

To deploy the updated backend with auth routes to Vercel:

1. **Commit and push your backend changes:**
   ```bash
   cd ../cineflix-api
   git add .
   git commit -m "Add authentication routes and controllers"
   git push
   ```

2. **Deploy to Vercel:**
   - If using Vercel CLI: `vercel --prod`
   - Or push to your connected Git repository (auto-deploy)

3. **Add Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Add these environment variables:
     - `JWT_SECRET` - Your JWT secret key
     - `JWT_REFRESH_SECRET` - Your refresh token secret
     - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
     - `MONGODB_URI` - Your MongoDB connection string

4. **Redeploy** after adding environment variables

## Verify Deployment

After deploying, test the endpoint:
```bash
curl https://cineflix-api-rho.vercel.app/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

If you get a response (even an error about user existing), the route is working!

## Quick Fix for Development

For now, the easiest solution is to use localhost. The `.env.local` file has been created with the localhost API URL. Just restart your dev server and it should work.

