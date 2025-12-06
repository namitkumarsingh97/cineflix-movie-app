<template>
  <div class="account-settings">
    <!-- Profile Settings -->
    <div class="settings-section">
      <h3 class="section-title">Profile Information</h3>
      <div v-if="loading" class="loading-state">
        <Loader2 :size="24" class="spinner" />
        <span>Loading profile data...</span>
      </div>
      <form v-else @submit.prevent="handleUpdateProfile" class="settings-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="profileData.name"
            type="text"
            placeholder="Enter your full name"
            required
            :disabled="updating"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="profileData.email"
            type="email"
            placeholder="Enter your email"
            required
            :disabled="updating || user?.googleId"
          />
          <p v-if="user?.googleId" class="field-hint">Email cannot be changed for Google accounts</p>
        </div>
        <button type="submit" class="save-btn" :disabled="updating">
          <Loader2 v-if="updating" :size="18" class="spinner" />
          <span>{{ updating ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </form>
    </div>

    <!-- Change Password (only for email accounts) -->
    <div v-if="!user?.googleId" class="settings-section">
      <h3 class="section-title">Change Password</h3>
      <form @submit.prevent="handleChangePassword" class="settings-form">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <div class="password-input-wrapper">
            <input
              id="currentPassword"
              v-model="passwordData.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="Enter current password"
              required
              :disabled="changingPassword"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <Eye v-if="!showCurrentPassword" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <div class="password-input-wrapper">
            <input
              id="newPassword"
              v-model="passwordData.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Enter new password (min. 8 characters)"
              required
              minlength="8"
              :disabled="changingPassword"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
            >
              <Eye v-if="!showNewPassword" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="confirmNewPassword">Confirm New Password</label>
          <div class="password-input-wrapper">
            <input
              id="confirmNewPassword"
              v-model="passwordData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm new password"
              required
              :disabled="changingPassword"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Eye v-if="!showConfirmPassword" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
        </div>
        <button type="submit" class="save-btn" :disabled="changingPassword">
          <Loader2 v-if="changingPassword" :size="18" class="spinner" />
          <span>{{ changingPassword ? 'Changing...' : 'Change Password' }}</span>
        </button>
      </form>
    </div>

    <!-- Danger Zone -->
    <div class="settings-section danger-zone">
      <h3 class="section-title">Danger Zone</h3>
      <div class="danger-content">
        <div class="danger-info">
          <h4>Delete Account</h4>
          <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
        </div>
        <button class="delete-btn" @click="showDeleteModal = true" :disabled="deleting">
          <Trash2 :size="18" />
          <span>Delete Account</span>
        </button>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="delete-modal">
        <div class="modal-header">
          <AlertTriangle :size="32" class="warning-icon" />
          <h2>Delete Account</h2>
        </div>
        <div class="modal-content">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <p class="warning-text">All your data, including subscriptions, watch history, and preferences will be permanently deleted.</p>
          <div v-if="!user?.googleId" class="form-group">
            <label for="deletePassword">Enter your password to confirm</label>
            <input
              id="deletePassword"
              v-model="deletePassword"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="deleting"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteModal = false" :disabled="deleting">
            Cancel
          </button>
          <button class="confirm-delete-btn" @click="handleDeleteAccount" :disabled="deleting">
            <Loader2 v-if="deleting" :size="18" class="spinner" />
            <span>{{ deleting ? 'Deleting...' : 'Delete Account' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, EyeOff, Loader2, Trash2, AlertTriangle } from 'lucide-vue-next';
import { accountApi } from '../api/account';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['updated']);

const router = useRouter();
const { logout } = useAuth();

const profileData = ref({
  name: '',
  email: '',
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const updating = ref(false);
const changingPassword = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const deletePassword = ref('');
const loading = ref(false);

// Fetch profile data from backend
async function loadProfile() {
  loading.value = true;
  try {
    const response = await accountApi.getProfile();
    if (response.success && response.user) {
      profileData.value = {
        name: response.user.name || '',
        email: response.user.email || '',
      };
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    // Fallback to props if API fails
    if (props.user) {
      profileData.value = {
        name: props.user.name || '',
        email: props.user.email || '',
      };
    }
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // First try to load from backend
  await loadProfile();
  
  // Fallback to props if backend data not available
  if (!profileData.value.name && !profileData.value.email && props.user) {
    profileData.value = {
      name: props.user.name || '',
      email: props.user.email || '',
    };
  }
});

// Watch for user prop changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    profileData.value = {
      name: newUser.name || '',
      email: newUser.email || '',
    };
  }
}, { deep: true });

async function handleUpdateProfile() {
  updating.value = true;
  try {
    const response = await accountApi.updateProfile(profileData.value);
    if (response.success) {
      // Reload profile data from backend to get updated info
      await loadProfile();
      emit('updated');
      alert('Profile updated successfully!');
    } else {
      throw new Error(response.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert(error.response?.data?.message || error.message || 'Failed to update profile. Please try again.');
  } finally {
    updating.value = false;
  }
}

async function handleChangePassword() {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    alert('New passwords do not match');
    return;
  }

  if (passwordData.value.newPassword.length < 8) {
    alert('Password must be at least 8 characters long');
    return;
  }

  changingPassword.value = true;
  try {
    await accountApi.changePassword({
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword,
    });
    alert('Password changed successfully!');
    // Clear form
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error) {
    console.error('Error changing password:', error);
    alert(error.response?.data?.message || 'Failed to change password. Please try again.');
  } finally {
    changingPassword.value = false;
  }
}

async function handleDeleteAccount() {
  if (!confirm('Are you absolutely sure? This action cannot be undone!')) {
    return;
  }

  deleting.value = true;
  try {
    await accountApi.deleteAccount(deletePassword.value);
    alert('Account deleted successfully');
    await logout();
    router.push('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    alert(error.response?.data?.message || 'Failed to delete account. Please try again.');
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
}
</script>

<style scoped>
.account-settings {
  width: 100%;
}

.settings-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input {
  padding: 12px 16px;
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
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

.save-btn {
  align-self: flex-start;
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.save-btn:disabled {
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

.danger-zone {
  border-color: rgba(244, 67, 54, 0.3);
}

.danger-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.danger-info {
  flex: 1;
  min-width: 250px;
}

.danger-info h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.danger-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.delete-modal {
  background: var(--dark-lighter);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.warning-icon {
  color: #f44336;
  margin-bottom: 12px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-content {
  padding: 24px;
}

.modal-content p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.warning-text {
  color: #f44336 !important;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.confirm-delete-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn {
  background: var(--dark-light);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--dark);
}

.confirm-delete-btn {
  background: #f44336;
  color: white;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-2px);
}

.cancel-btn:disabled,
.confirm-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-secondary);
  justify-content: center;
}

@media (max-width: 768px) {
  .danger-content {
    flex-direction: column;
    align-items: stretch;
  }

  .delete-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>

