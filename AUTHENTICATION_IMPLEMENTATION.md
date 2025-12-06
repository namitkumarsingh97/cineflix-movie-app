# Authentication & User Dashboard Implementation Guide

## ✅ Frontend Implementation (Completed)

### Files Created/Updated:

1. **`src/api/auth.js`** - Authentication API service
2. **`src/api/account.js`** - Account management API service
3. **`src/composables/useAuth.js`** - Authentication composable with JWT handling
4. **`src/pages/Login.vue`** - Login page with Google OAuth
5. **`src/pages/Signup.vue`** - Registration page
6. **`src/pages/Dashboard.vue`** - User dashboard with subscription management
7. **`src/components/AccountSettings.vue`** - Account settings component
8. **`src/router/index.js`** - Updated with auth routes and guards
9. **`src/layouts/PublicLayout.vue`** - Added user menu in navbar
10. **`src/plugins/axios.js`** - Updated to use `cineflix_auth_token`
11. **`index.html`** - Added Google Sign-In script

### Features Implemented:

- ✅ User registration (email/password)
- ✅ User login (email/password)
- ✅ Google OAuth login (frontend ready)
- ✅ Protected routes (dashboard requires auth)
- ✅ Guest routes (login/signup redirect if logged in)
- ✅ User dashboard with subscription status
- ✅ Account settings (update profile, change password)
- ✅ Delete account functionality
- ✅ User menu in navbar
- ✅ JWT token management
- ✅ Auto token refresh on 401

## 📋 Backend Implementation Required

### 1. User Model (`models/User.js`)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    // Required only for email/password accounts
    required: function() {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### 2. Authentication Controller (`controllers/authController.js`)

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Please use Google sign-in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        avatar: picture,
      });
      await user.save();
    }

    // Generate tokens
    const jwtToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      token: jwtToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const token = generateToken(decoded.userId);

    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Logout (client-side token removal, but can add token blacklist here)
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
```

### 3. Account Controller (`controllers/accountController.js`)

```javascript
const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow email change for Google accounts
    if (user.googleId && email !== user.email) {
      return res.status(400).json({ message: 'Email cannot be changed for Google accounts' });
    }

    user.name = name || user.name;
    if (!user.googleId) {
      user.email = email || user.email;
    }
    user.updatedAt = Date.now();

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.googleId) {
      return res.status(400).json({ message: 'Google accounts cannot change password' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Password not set' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password for email accounts
    if (!user.googleId && user.password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Password is incorrect' });
      }
    }

    // Delete user and related data (subscriptions, watch later, etc.)
    await User.findByIdAndDelete(req.userId);
    // TODO: Delete related data (subscriptions, watch later, etc.)

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### 4. Auth Middleware (`middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 5. Auth Routes (`routes/authRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
```

### 6. Account Routes (`routes/accountRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, accountController.getProfile);
router.put('/profile', authenticate, accountController.updateProfile);
router.post('/change-password', authenticate, accountController.changePassword);
router.delete('/', authenticate, accountController.deleteAccount);

module.exports = router;
```

### 7. Update `server.js`

```javascript
// Add these imports
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');

// Add these routes (before other routes)
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
```

### 8. Environment Variables (`.env`)

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 9. Required NPM Packages

```bash
npm install bcryptjs jsonwebtoken google-auth-library
```

## 🔧 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
6. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Copy Client ID to `.env` as `GOOGLE_CLIENT_ID`
8. Add `VITE_GOOGLE_CLIENT_ID` to frontend `.env`

## 📝 Next Steps

1. Implement backend authentication API
2. Test login/signup flow
3. Test Google OAuth integration
4. Update subscription system to link with user accounts
5. Add user data sync (watch later, followed stars) to backend
6. Test account deletion and data cleanup

## 🎨 CSS Styles Needed

Add these styles to `src/style.css` for the user menu:

```css
.user-menu-wrapper {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-menu-btn:hover {
  background: var(--dark-light);
  border-color: var(--primary);
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.user-menu-avatar {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-menu-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.user-menu-email {
  font-size: 13px;
  color: var(--text-secondary);
}

.user-menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  text-decoration: none;
  transition: background 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.user-menu-item:hover {
  background: var(--dark);
}

.logout-item {
  color: #f44336;
}

.logout-item:hover {
  background: rgba(244, 67, 54, 0.1);
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--gradient-primary);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}
```

## ✅ Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth login works
- [ ] Protected routes redirect to login
- [ ] Guest routes redirect to dashboard if logged in
- [ ] JWT token refresh works
- [ ] User dashboard displays subscription info
- [ ] Account settings update works
- [ ] Password change works
- [ ] Account deletion works
- [ ] User menu appears in navbar when logged in
- [ ] Logout works correctly

