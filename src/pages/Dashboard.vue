<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="user-greeting">
            <h1 class="greeting-title">
              Welcome back, {{ user?.name || "User" }}!
            </h1>
            <p class="greeting-subtitle">
              Manage your account and subscription
            </p>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="dashboard-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" :size="18" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Dashboard Content -->
      <div class="dashboard-content">
        <!-- Overview Tab -->
        <div v-show="activeTab === 'overview'" class="tab-content">
          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon premium">
                <Crown :size="24" />
              </div>
              <div class="stat-info">
                <span class="stat-label">Subscription</span>
                <span class="stat-value">{{
                  isPremium ? "Premium" : "Free"
                }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon account">
                <User :size="24" />
              </div>
              <div class="stat-info">
                <span class="stat-label">Account</span>
                <span class="stat-value">{{
                  user?.googleId ? "Google" : "Email"
                }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon date">
                <Calendar :size="24" />
              </div>
              <div class="stat-info">
                <span class="stat-label">Member Since</span>
                <span class="stat-value">{{
                  formatDateShort(user?.createdAt)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Subscription Status Card -->
          <div class="dashboard-card subscription-card">
            <div class="card-header">
              <div class="card-title-wrapper">
                <Crown :size="24" />
                <h2 class="card-title">Subscription Status</h2>
              </div>
              <!-- Premium route removed - using Eporner API directly, no premium required -->
              <!-- <router-link to="/premium" class="upgrade-link" v-if="!isPremium">
                Upgrade Now
              </router-link> -->
            </div>
            <div class="card-content">
              <div v-if="subscriptionLoading" class="loading-state">
                <Loader2 :size="24" class="spinner" />
                <span>Loading subscription...</span>
              </div>
              <div v-else-if="subscription" class="subscription-details">
                <div class="subscription-status">
                  <div
                    class="status-badge"
                    :class="{ active: subscription.status === 'active' }"
                  >
                    <span class="status-dot"></span>
                    <span>{{
                      subscription.status === "active" ? "Active" : "Inactive"
                    }}</span>
                  </div>
                </div>
                <div class="subscription-info-grid">
                  <div class="info-item">
                    <span class="info-label">Plan</span>
                    <span class="info-value">{{
                      formatPlanType(subscription.type)
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Started</span>
                    <span class="info-value">{{
                      formatDate(subscription.startDate)
                    }}</span>
                  </div>
                  <div class="info-item" v-if="subscription.expiresAt">
                    <span class="info-label">Expires</span>
                    <span class="info-value">{{
                      formatDate(subscription.expiresAt)
                    }}</span>
                  </div>
                  <div class="info-item" v-else>
                    <span class="info-label">Expires</span>
                    <span class="info-value">Never (Lifetime)</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Amount Paid</span>
                    <span class="info-value">₹{{ subscription.amount }}</span>
                  </div>
                </div>
                <div
                  class="subscription-actions"
                  v-if="
                    subscription.status === 'active' &&
                    subscription.type !== 'lifetime'
                  "
                >
                  <button
                    class="action-btn cancel-btn"
                    @click="handleCancelSubscription"
                  >
                    Cancel Subscription
                  </button>
                  <!-- Premium route removed - using Eporner API directly, no premium required -->
                  <!-- <router-link to="/premium" class="action-btn extend-btn">
                    Extend Subscription
                  </router-link> -->
                </div>
              </div>
              <div v-else class="no-subscription">
                <Crown :size="48" />
                <h3>No Active Subscription</h3>
                <p>Upgrade to premium to unlock exclusive content</p>
                <!-- Premium route removed - using Eporner API directly, no premium required -->
                <!-- <router-link to="/premium" class="upgrade-cta-btn">
                  <Crown :size="18" />
                  <span>Upgrade to Premium</span>
                </router-link> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Tab -->
        <div v-show="activeTab === 'profile'" class="tab-content">
          <div class="dashboard-card">
            <div class="card-header">
              <div class="card-title-wrapper">
                <User :size="24" />
                <h2 class="card-title">Profile Information</h2>
              </div>
            </div>
            <div class="card-content">
              <div class="profile-section">
                <div class="profile-avatar-section">
                  <div class="profile-avatar">
                    <img
                      v-if="user?.avatar"
                      :src="user.avatar"
                      :alt="user?.name || 'User'"
                      class="avatar-img"
                    />
                    <div v-else class="avatar-placeholder">
                      <User :size="48" />
                    </div>
                  </div>
                  <div class="profile-name-section">
                    <h3 class="profile-name">{{ user?.name || "User" }}</h3>
                    <p class="profile-email">{{ user?.email }}</p>
                  </div>
                </div>
                <div class="account-info-grid">
                  <div class="info-item">
                    <span class="info-label">Full Name</span>
                    <span class="info-value">{{ user?.name || "N/A" }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email Address</span>
                    <span class="info-value">{{ user?.email || "N/A" }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Account Created</span>
                    <span class="info-value">{{
                      formatDate(user?.createdAt)
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Login Method</span>
                    <span class="info-value">{{
                      user?.googleId ? "Google" : "Email"
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-show="activeTab === 'analytics'" class="tab-content">
          <WatchAnalytics @close="activeTab = 'overview'" />
        </div>

        <!-- Settings Tab -->
        <div v-show="activeTab === 'settings'" class="tab-content">
          <div class="dashboard-card">
            <div class="card-header">
              <div class="card-title-wrapper">
                <Settings :size="24" />
                <h2 class="card-title">Account Settings</h2>
              </div>
            </div>
            <div class="card-content">
              <AccountSettings :user="user" @updated="handleProfileUpdate" />
            </div>
          </div>
        </div>

        <!-- Subscription Tab -->
        <div v-show="activeTab === 'subscription'" class="tab-content">
          <!-- Payment Screenshot Upload Section -->
          <div v-if="!isPremium" class="dashboard-card">
            <PaymentScreenshotUpload @uploaded="refreshSubscription" />
          </div>

          <div class="dashboard-card subscription-card">
            <div class="card-header">
              <div class="card-title-wrapper">
                <Crown :size="24" />
                <h2 class="card-title">Subscription Management</h2>
              </div>
              <div class="header-actions">
                <button
                  class="refresh-btn"
                  @click="refreshSubscription"
                  :disabled="subscriptionLoading"
                  title="Refresh subscription status"
                >
                  <Loader2
                    :size="18"
                    :class="{ spinner: subscriptionLoading }"
                  />
                  <span>Refresh</span>
                </button>
                <!-- Premium route removed - using Eporner API directly, no premium required -->
                <!-- <router-link
                  to="/premium"
                  class="upgrade-link"
                  v-if="!isPremium"
                > -->
                  Upgrade Now
                </router-link>
              </div>
            </div>
            <div class="card-content">
              <div v-if="subscriptionLoading" class="loading-state">
                <Loader2 :size="24" class="spinner" />
                <span>Loading subscription...</span>
              </div>
              <div v-else-if="subscription" class="subscription-details">
                <div class="subscription-status">
                  <div
                    class="status-badge"
                    :class="{ active: subscription.status === 'active' }"
                  >
                    <span class="status-dot"></span>
                    <span>{{
                      subscription.status === "active" ? "Active" : "Inactive"
                    }}</span>
                  </div>
                </div>
                <div class="subscription-info-grid">
                  <div class="info-item">
                    <span class="info-label">Plan</span>
                    <span class="info-value">{{
                      formatPlanType(subscription.type)
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Started</span>
                    <span class="info-value">{{
                      formatDate(subscription.startDate)
                    }}</span>
                  </div>
                  <div class="info-item" v-if="subscription.expiresAt">
                    <span class="info-label">Expires</span>
                    <span class="info-value">{{
                      formatDate(subscription.expiresAt)
                    }}</span>
                  </div>
                  <div class="info-item" v-else>
                    <span class="info-label">Expires</span>
                    <span class="info-value">Never (Lifetime)</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Amount Paid</span>
                    <span class="info-value">₹{{ subscription.amount }}</span>
                  </div>
                </div>
                <div
                  class="subscription-actions"
                  v-if="
                    subscription.status === 'active' &&
                    subscription.type !== 'lifetime'
                  "
                >
                  <button
                    class="action-btn cancel-btn"
                    @click="handleCancelSubscription"
                  >
                    Cancel Subscription
                  </button>
                  <!-- Premium route removed - using Eporner API directly, no premium required -->
                  <!-- <router-link to="/premium" class="action-btn extend-btn">
                    Extend Subscription
                  </router-link> -->
                </div>
              </div>
              <div v-else class="no-subscription">
                <Crown :size="48" />
                <h3>No Active Subscription</h3>
                <p>Upgrade to premium to unlock exclusive content</p>
                <!-- Premium route removed - using Eporner API directly, no premium required -->
                <!-- <router-link to="/premium" class="upgrade-cta-btn">
                  <Crown :size="18" />
                  <span>Upgrade to Premium</span>
                </router-link> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Crown,
  Settings,
  User,
  LogOut,
  Loader2,
  Layout,
  Calendar,
  BarChart3,
} from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";
import { useSubscription } from "../composables/useSubscription";
import AccountSettings from "../components/AccountSettings.vue";
import PaymentScreenshotUpload from "../components/PaymentScreenshotUpload.vue";
import WatchAnalytics from "../components/WatchAnalytics.vue";
import { formatDate } from "../utils/date";

const router = useRouter();
const route = useRoute();
const { user, logout, checkAuth } = useAuth();
const {
  subscription,
  loading: subscriptionLoading,
  cancelSubscription,
  checkPremiumStatus,
} = useSubscription();

// Tab management
const activeTab = ref("overview");

const tabs = [
  { id: "overview", label: "Overview", icon: Layout },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "subscription", label: "Subscription", icon: Crown },
];

// Check for tab query parameter
onMounted(async () => {
  await checkAuth();
  await checkPremiumStatus();

  // Set active tab from query parameter
  if (route.query.tab && tabs.find((t) => t.id === route.query.tab)) {
    activeTab.value = route.query.tab;
  }

  // Refresh subscription when page becomes visible (e.g., after payment)
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Also refresh when window gains focus (user comes back from payment page)
  window.addEventListener("focus", refreshSubscription);

  // Listen for subscription update events (from payment success)
  window.addEventListener("subscription-updated", handleSubscriptionUpdate);
});

// Cleanup listeners
onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("focus", refreshSubscription);
  window.removeEventListener("subscription-updated", handleSubscriptionUpdate);
});

// Handle page visibility change
function handleVisibilityChange() {
  if (!document.hidden) {
    // Page became visible, refresh subscription
    refreshSubscription();
  }
}

// Refresh subscription status
async function refreshSubscription() {
  console.log("Refreshing subscription status...");
  await checkPremiumStatus();
}

// Handle subscription update event
function handleSubscriptionUpdate(event) {
  console.log("Subscription update event received:", event.detail);
  refreshSubscription();
}

// Watch for route query changes to update active tab when navigating from profile menu
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && tabs.find((t) => t.id === newTab)) {
      activeTab.value = newTab;
      // Refresh subscription when switching to subscription tab
      if (newTab === "subscription") {
        refreshSubscription();
      }
    } else if (!newTab) {
      // If no tab in query, default to overview
      activeTab.value = "overview";
    }
  },
  { immediate: true }
);

// Watch route path to refresh when navigating to dashboard
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/dashboard") {
      refreshSubscription();
    }
  }
);

// Watch activeTab to refresh when subscription tab is selected
watch(activeTab, (newTab) => {
  if (newTab === "subscription") {
    console.log("Subscription tab selected, refreshing status...");
    refreshSubscription();
  }
});

const isPremium = computed(() => {
  return subscription.value && subscription.value.status === "active";
});

function formatDateShort(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatPlanType(type) {
  const types = {
    monthly: "Monthly",
    yearly: "Yearly",
    lifetime: "Lifetime",
  };
  return types[type] || type;
}

async function handleCancelSubscription() {
  if (
    confirm(
      "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."
    )
  ) {
    try {
      await cancelSubscription();
      await checkPremiumStatus();
      alert("Subscription cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  }
}

function handleProfileUpdate() {
  // Refresh user data
  checkAuth();
}

async function handleLogout() {
  if (confirm("Are you sure you want to sign out?")) {
    await logout();
    router.push("/");
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--dark);
  padding: 40px 20px;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.user-greeting {
  flex: 1;
}

.greeting-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.greeting-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.dashboard-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 2px solid var(--border-color);
  overflow-x: auto;
  scrollbar-width: none;
}

.dashboard-tabs::-webkit-scrollbar {
  display: none;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--text-primary);
  background: var(--dark-lighter);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.premium {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  color: #000;
}

.stat-icon.account {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.date {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 700;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 4px solid var(--dark-lighter);
  box-shadow: 0 4px 20px rgba(255, 69, 0, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.profile-name-section {
  flex: 1;
}

.profile-name {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.profile-email {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.dashboard-content {
  display: grid;
  gap: 24px;
}

.dashboard-card {
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--dark-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--dark-lighter);
  border-color: var(--primary);
  color: var(--primary);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn .spinner {
  animation: spin 1s linear infinite;
}

.upgrade-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.3s ease;
}

.upgrade-link:hover {
  color: var(--secondary);
}

.card-content {
  padding: 24px;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
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

.subscription-status {
  margin-bottom: 24px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 20px;
  color: #f44336;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4caf50;
  color: #4caf50;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
}

.subscription-info-grid,
.account-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;
}

.subscription-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid #f44336;
}

.cancel-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.extend-btn {
  background: var(--gradient-primary);
  color: white;
}

.extend-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.no-subscription {
  text-align: center;
  padding: 40px 20px;
}

.no-subscription svg {
  margin-bottom: 20px;
  color: var(--primary);
  opacity: 0.8;
}

.no-subscription h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.no-subscription p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
}

.upgrade-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--gradient-primary);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 69, 0, 0.4);
}

.upgrade-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 69, 0, 0.6);
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 20px 16px;
  }

  .greeting-title {
    font-size: 28px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .subscription-info-grid,
  .account-info-grid {
    grid-template-columns: 1fr;
  }

  .subscription-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
