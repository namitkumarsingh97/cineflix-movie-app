# Admin Account Setup Guide

## 🔐 Understanding Password Storage

**Important:** Passwords are **NOT** stored in tokens. Here's how it works:

1. **Password Storage**: Passwords are **hashed** (encrypted) using bcrypt and stored in the database
2. **JWT Tokens**: Tokens only contain your `adminId` (not your password) and are used for authentication
3. **Security**: You cannot retrieve your original password because it's hashed - this is by design for security

## 📝 Creating Your First Admin Account

You have **3 options** to create an admin account:

### Option 1: Using the Script (Recommended)

1. Navigate to the API directory:
   ```bash
   cd E:\Projects\vue-movie-buzz\cineflix-api
   ```

2. Run the create admin script:
   ```bash
   node scripts/createAdmin.js admin yourpassword123 "Your Name"
   ```

   Replace:
   - `admin` - Your admin ID (username)
   - `yourpassword123` - Your password
   - `"Your Name"` - Your display name (optional)

### Option 2: Using API Endpoint (Postman/curl)

Make a POST request to: `http://localhost:5000/api/admin/create`

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin",
    "password": "yourpassword123",
    "name": "Admin Name"
  }'
```

**Using Postman:**
- Method: POST
- URL: `http://localhost:5000/api/admin/create`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "adminId": "admin",
    "password": "yourpassword123",
    "name": "Admin Name"
  }
  ```

### Option 3: Using MongoDB Directly

If you have MongoDB Compass or mongo shell access:

```javascript
// Connect to your database and run:
db.admins.insertOne({
  adminId: "admin",
  password: "$2a$10$YourHashedPasswordHere", // You'll need to hash it first
  name: "Admin Name",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

⚠️ **Note**: You'll need to hash the password using bcrypt first, which is complex. Use Option 1 or 2 instead.

## 🔑 Logging In

After creating your admin account:

1. Go to your app: `http://localhost:5173/admin/login` (or your frontend URL)
2. Enter:
   - **Admin ID**: The `adminId` you created (e.g., "admin")
   - **Password**: The password you set
3. Click "Login"

## 🔄 Resetting/Changing Password

If you forgot your password, you have these options:

### Option 1: Create a New Admin Account

If you have access to create accounts, create a new one with a different `adminId`:

```bash
node scripts/createAdmin.js newadmin newpassword123 "New Admin"
```

### Option 2: Update Password via MongoDB

If you have database access, you can update the password hash directly (requires bcrypt hashing).

### Option 3: Add Password Reset Feature (Future)

We can add a password reset feature that sends an email or uses a reset token.

## 📋 Quick Reference

**Create Admin Script:**
```bash
cd E:\Projects\vue-movie-buzz\cineflix-api
node scripts/createAdmin.js <adminId> <password> [name]
```

**Login Endpoint:**
```
POST http://localhost:5000/api/admin/login
Body: { "adminId": "admin", "password": "yourpassword" }
```

**Create Admin Endpoint:**
```
POST http://localhost:5000/api/admin/create
Body: { "adminId": "admin", "password": "yourpassword", "name": "Admin Name" }
```

## ⚠️ Security Notes

1. **Change JWT_SECRET**: Update `JWT_SECRET` in your `.env` file to a strong random string
2. **Protect Create Endpoint**: In production, protect the `/api/admin/create` endpoint or remove it
3. **Strong Passwords**: Use strong passwords (at least 8 characters, mix of letters, numbers, symbols)
4. **Never Share**: Never share your admin credentials

## 🆘 Troubleshooting

**"Admin ID already exists"**
- The adminId is already taken. Use a different one or delete the existing admin from the database.

**"Invalid credentials"**
- Double-check your adminId and password (case-sensitive for password)
- Make sure you created the admin account first

**"Database connection failed"**
- Check your MongoDB connection string in `.env`
- Make sure MongoDB is running

