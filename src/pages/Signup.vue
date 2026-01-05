<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <div class="auth-logo">
          <Film :size="48" />
        </div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join Cineflix and unlock premium content</p>
      </div>

      <div class="auth-form-container">
        <!-- Error Message -->
        <div v-if="error" class="auth-error">
          <AlertCircle :size="18" />
          <span>{{ error }}</span>
        </div>

        <!-- Google Sign-In Button -->
        <button 
          class="auth-google-btn"
          @click="handleGoogleLogin"
          :disabled="loading"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" />
          <span>Sign up with Google</span>
        </button>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="handleSignup" class="auth-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Enter your full name"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a password (min. 8 characters)"
                required
                minlength="8"
                :disabled="loading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="loading"
              >
                <Eye v-if="!showPassword" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
            <p class="password-hint">Must be at least 8 characters long</p>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="password-input-wrapper">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm your password"
                required
                :disabled="loading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="loading"
              >
                <Eye v-if="!showConfirmPassword" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="terms-checkbox">
              <input 
                type="checkbox" 
                v-model="acceptTerms" 
                required
                :disabled="loading"
              />
              <span>I agree to the <router-link to="/terms" target="_blank">Terms of Service</router-link> and <router-link to="/privacy" target="_blank">Privacy Policy</router-link></span>
            </label>
          </div>

          <button type="submit" class="auth-submit-btn" :disabled="loading || !acceptTerms">
            <Loader2 v-if="loading" :size="18" class="spinner" />
            <span>{{ loading ? 'Creating account...' : 'Create Account' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Already have an account?
            <router-link to="/login" class="auth-link">Sign in</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertCircle, Eye, EyeOff, Film, Loader2 } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { register, loginWithGoogle, loading, error } = useAuth();

const formData = ref({
	name: "",
	email: "",
	password: "",
	confirmPassword: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const acceptTerms = ref(false);

async function handleSignup() {
	// Validate passwords match
	if (formData.value.password !== formData.value.confirmPassword) {
		error.value = "Passwords do not match";
		return;
	}

	// Validate password length
	if (formData.value.password.length < 8) {
		error.value = "Password must be at least 8 characters long";
		return;
	}

	const result = await register({
		name: formData.value.name,
		email: formData.value.email,
		password: formData.value.password,
	});

	if (result.success) {
		router.push("/dashboard");
	}
}

async function handleGoogleLogin() {
	const result = await loginWithGoogle();
	if (result && result.success) {
		router.push("/dashboard");
	}
}

onMounted(() => {
	// Wait for Google Sign-In library to load
	const checkGoogleLoaded = setInterval(() => {
		if (window.google && window.google.accounts) {
			clearInterval(checkGoogleLoaded);
			// Library is loaded, button will work on click
		}
	}, 100);

	// Clear interval after 10 seconds
	setTimeout(() => {
		clearInterval(checkGoogleLoaded);
	}, 10000);
});
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--dark);
}

.auth-container {
  width: 100%;
  max-width: 450px;
  background: var(--dark-lighter);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-logo {
  width: 80px;
  height: 80px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
}

.auth-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.auth-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.auth-form-container {
  width: 100%;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  font-size: 14px;
  margin-bottom: 24px;
}

.auth-google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 24px;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.auth-google-btn:hover:not(:disabled) {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.auth-google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.auth-divider span {
  padding: 0 16px;
}

.auth-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  /* Focus indicators disabled */
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.password-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}

.terms-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
}

.terms-checkbox a {
  color: var(--primary);
  text-decoration: none;
}

.terms-checkbox a:hover {
  text-decoration: underline;
}

.auth-submit-btn {
  width: 100%;
  padding: 16px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.auth-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 69, 0, 0.4);
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.auth-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: var(--secondary);
}

@media (max-width: 768px) {
  .auth-container {
    padding: 30px 20px;
  }

  .auth-title {
    font-size: 28px;
  }
}
</style>

