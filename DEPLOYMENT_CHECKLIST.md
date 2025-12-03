# Deployment Checklist for Admin Features

## ⚠️ Issue: 404 on Admin Routes

If you're getting a 404 error on `/api/admin/login`, it means the admin routes haven't been deployed to Vercel yet.

## ✅ Steps to Fix

### 1. Verify All Files Are Committed

Make sure these files are in your repository:

```
cineflix-api/
├── controllers/
│   └── adminController.js          ✅ NEW
├── middleware/
│   ├── auth.js                      ✅ NEW
│   └── upload.js                    ✅ NEW
├── models/
│   └── Admin.js                    ✅ NEW
├── routes/
│   └── adminRoutes.js               ✅ NEW
├── scripts/
│   └── createAdmin.js              ✅ NEW
└── server.js                        ✅ UPDATED
```

### 2. Commit and Push Changes

```bash
cd E:\Projects\vue-movie-buzz\cineflix-api

# Check what files need to be committed
git status

# Add all new files
git add .

# Commit
git commit -m "Add admin authentication and routes"

# Push to your repository
git push
```

### 3. Redeploy on Vercel

**Option A: Automatic (if connected to Git)**
- Vercel will automatically deploy when you push to your main branch
- Check the Vercel dashboard for deployment status

**Option B: Manual Deploy**
1. Go to Vercel Dashboard
2. Select your project (`cineflix-api`)
3. Click "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Or use Vercel CLI: `vercel --prod`

### 4. Verify Deployment

After deployment, test the endpoint:

```bash
# Test admin login endpoint
curl -X POST https://cineflix-api-rho.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"test","password":"test"}'
```

You should get a response (even if it's "Invalid credentials" - that means the route exists).

### 5. Create Admin Account

After deployment, create your admin account:

**Option A: Using API Endpoint**
```bash
curl -X POST https://cineflix-api-rho.vercel.app/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin",
    "password": "yourpassword123",
    "name": "Admin Name"
  }'
```

**Option B: Using Script (Local)**
```bash
cd E:\Projects\vue-movie-buzz\cineflix-api
node scripts/createAdmin.js admin yourpassword123 "Admin Name"
```

## 🔍 Troubleshooting

### Still Getting 404?

1. **Check Vercel Logs**
   - Go to Vercel Dashboard > Your Project > Logs
   - Look for any errors during deployment

2. **Verify Files Are Deployed**
   - Check Vercel deployment logs to see if all files were uploaded
   - Make sure `routes/adminRoutes.js` exists in the deployment

3. **Check Environment Variables**
   - Make sure `JWT_SECRET` is set in Vercel environment variables
   - Make sure `MONGODB_URI` is set

4. **Test Locally First**
   ```bash
   cd E:\Projects\vue-movie-buzz\cineflix-api
   npm start
   # Then test: http://localhost:5000/api/admin/login
   ```

### Database Connection Issues

If you get database errors instead of 404:
- Check `MONGODB_URI` in Vercel environment variables
- Make sure MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)

## 📝 Quick Test Commands

```bash
# Test API health
curl https://cineflix-api-rho.vercel.app/api/health

# Test admin login (should return 401 if no admin exists, or 400 if route doesn't exist)
curl -X POST https://cineflix-api-rho.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"test","password":"test"}'

# Create admin
curl -X POST https://cineflix-api-rho.vercel.app/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin","password":"password123","name":"Admin"}'
```

## ✅ Success Indicators

- ✅ `/api/admin/login` returns 400/401 (not 404)
- ✅ `/api/admin/create` returns 201 or 400 (not 404)
- ✅ You can create an admin account
- ✅ You can login with the admin credentials

