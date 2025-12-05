<template>
  <div class="admin-login-container">
    <div class="admin-login-card">
      <div class="login-header">
        <Shield :size="48" class="admin-icon" />
        <h1>Admin Login</h1>
        <p>Enter your credentials to access the admin panel</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="adminId">
            <User :size="16" />
            <span>Admin ID</span>
          </label>
          <input
            type="text"
            id="adminId"
            v-model="credentials.adminId"
            placeholder="Enter admin ID"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">
            <Lock :size="16" />
            <span>Password</span>
          </label>
          <input
            type="password"
            id="password"
            v-model="credentials.password"
            placeholder="Enter password"
            class="form-input"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          <AlertCircle :size="16" />
          <span>{{ error }}</span>
        </div>

        <button type="submit" class="btn-primary login-btn" :disabled="loading">
          <Loader2 v-if="loading" :size="16" class="spinning" />
          <LogIn v-else :size="16" />
          <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Shield, User, Lock, LogIn, Loader2, AlertCircle } from 'lucide-vue-next';
import apiClient from '../plugins/axios';

const router = useRouter();

const credentials = ref({
  adminId: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

async function handleLogin() {
  error.value = '';
  loading.value = true;

  try {
    const response = await apiClient.post('/admin/login', credentials.value);
    
    if (response.data.success) {
      // Store token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminId', response.data.data.adminId);
      
      // Redirect to admin panel
      router.push('/admin/panel');
    }
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Invalid credentials. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.admin-login-card {
  background: var(--dark-lighter);
  border-radius: 20px;
  padding: 48px;
  max-width: 450px;
  width: 100%;
  box-shadow: var(--shadow-hover);
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.admin-icon {
  color: var(--primary);
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: var(--primary);
}

.form-input {
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-size: 14px;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.login-btn {
  width: 100%;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
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
</style>

