<template>
  <div class="premium-page">
    <!-- Hero Section -->
    <section class="premium-hero">
      <div class="premium-hero-content">
        <div class="premium-badge">
          <Crown :size="24" />
          <span>Premium</span>
        </div>
        <h1 class="premium-title">Unlock Premium Content</h1>
        <p class="premium-subtitle">
          Get access to exclusive videos, ad-free experience, and premium features
        </p>
      </div>
    </section>

    <!-- Subscription Plans -->
    <section class="plans-section">
      <h2 class="section-title">Choose Your Plan</h2>
      <div class="plans-grid">
        <div 
          v-for="plan in subscriptionPlans" 
          :key="plan.id"
          class="plan-card"
          :class="{ 
            featured: plan.featured,
            subscribed: isPremium && (subscription?.planId === plan.id || subscription?.type === plan.id)
          }"
        >
          <div v-if="plan.featured" class="plan-badge">Most Popular</div>
          <div v-if="isPremium && (subscription?.planId === plan.id || subscription?.type === plan.id)" class="subscribed-badge">
            <CheckCircle :size="18" />
            <span>Subscribed</span>
          </div>
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="price-amount">₹{{ plan.price }}</span>
            <span class="price-period">/{{ plan.period }}</span>
          </div>
          <ul class="plan-features">
            <li v-for="feature in plan.features" :key="feature">
              <Check :size="18" />
              <span>{{ feature }}</span>
            </li>
          </ul>
          <button 
            class="plan-button"
            :class="{ 
              'featured-button': plan.featured,
              'subscribed-button': isPremium && (subscription?.planId === plan.id || subscription?.type === plan.id)
            }"
            @click="selectPlan(plan)"
            :disabled="isPremium && (subscription?.planId === plan.id || subscription?.type === plan.id)"
          >
            <template v-if="isPremium && (subscription?.planId === plan.id || subscription?.type === plan.id)">
              <CheckCircle :size="18" />
              <span>Subscribed</span>
            </template>
            <template v-else-if="isPremium">
              View Details
            </template>
            <template v-else>
              Subscribe Now
            </template>
          </button>
        </div>
      </div>
    </section>

    <!-- Premium Features Showcase -->
    <section class="features-section">
      <h2 class="section-title">Premium Features</h2>
      <div class="features-grid">
        <div v-for="feature in premiumFeatures" :key="feature.title" class="feature-card">
          <div class="feature-icon">
            <component :is="feature.icon" :size="32" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Premium Content Preview -->
    <section class="premium-content-section">
      <div class="section-header">
        <h2 class="section-title">Premium Content</h2>
        <p class="section-subtitle">Exclusive videos available only to premium members</p>
      </div>
      <div v-if="loading" class="loading-container">
        <Loader message="Loading premium content..." />
      </div>
      <div v-else-if="premiumVideos.length > 0" class="premium-videos-grid">
        <PremiumVideoCard
          v-for="video in premiumVideos"
          :key="video.id"
          :video="video"
          :is-premium="isPremium"
          @click="handleVideoClick(video)"
        />
      </div>
      <div v-else class="empty-state">
        <Film :size="64" />
        <h3>No Premium Content Available</h3>
        <p>Premium content will appear here once available</p>
      </div>
    </section>

    <!-- UPI Payment Modal -->
    <UPIPaymentModal
      v-if="showPaymentModal"
      :plan="selectedPlan"
      :is-premium="isPremium"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />

    <!-- Payment Success Modal -->
    <div v-if="showPaymentSuccess" class="modal-overlay" @click.self="showPaymentSuccess = false">
      <div class="payment-success-modal">
        <div class="success-icon">
          <CheckCircle :size="64" />
        </div>
        <h2 class="success-title">Payment Successful!</h2>
        <p class="success-message">Your premium subscription has been activated.</p>
        <div class="success-actions">
          <button class="success-btn" @click="goToDashboard">
            Go to Dashboard
          </button>
          <button class="success-btn secondary" @click="showPaymentSuccess = false">
            Continue Browsing
          </button>
        </div>
      </div>
    </div>

    <!-- Subscription Details Modal -->
    <div v-if="showSubscriptionDetails" class="modal-overlay" @click.self="showSubscriptionDetails = false">
      <div class="subscription-details-modal">
        <button class="close-button" @click="showSubscriptionDetails = false">
          <X :size="24" />
        </button>
        <div class="modal-header">
          <div class="payment-icon">
            <Crown :size="32" />
          </div>
          <h2 class="modal-title">Your Premium Subscription</h2>
        </div>
        <div v-if="subscription" class="subscription-info">
          <div class="info-item">
            <span class="label">Plan:</span>
            <span class="value">{{ subscription.type === 'monthly' ? 'Monthly' : subscription.type === 'yearly' ? 'Yearly' : 'Lifetime' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value status-active">Active</span>
          </div>
          <div class="info-item">
            <span class="label">Started:</span>
            <span class="value">{{ formatDate(subscription.startDate) }}</span>
          </div>
          <div v-if="subscription.expiresAt" class="info-item">
            <span class="label">Expires:</span>
            <span class="value">{{ formatDate(subscription.expiresAt) }}</span>
          </div>
          <div v-else class="info-item">
            <span class="label">Expires:</span>
            <span class="value">Never (Lifetime)</span>
          </div>
          <div class="info-item">
            <span class="label">Amount Paid:</span>
            <span class="value">₹{{ subscription.amount }}</span>
          </div>
        </div>
        <div v-else class="subscription-info">
          <p class="no-subscription">Loading subscription details...</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showSubscriptionDetails = false">
            Close
          </button>
          <button 
            v-if="subscription && subscription.type !== 'lifetime'"
            class="cancel-subscription-btn"
            @click="handleCancelSubscription"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscription } from '../composables/useSubscription';
import { useEporner } from '../composables/useEporner';
import PremiumVideoCard from '../components/PremiumVideoCard.vue';
import UPIPaymentModal from '../components/UPIPaymentModal.vue';
import Loader from '../components/Loader.vue';
import {
  Crown,
  Check,
  Film,
  Lock,
  Zap,
  Shield,
  Star,
  Play,
  X,
  CheckCircle,
} from 'lucide-vue-next';

const router = useRouter();
const { isPremium, subscription, checkPremiumStatus, cancelSubscription } = useSubscription();
const { videos: epornerVideos, loading, searchVideos } = useEporner();

const premiumVideos = ref([]);
const showPaymentModal = ref(false);
const showSubscriptionDetails = ref(false);
const showPaymentSuccess = ref(false);
const selectedPlan = ref(null);

const subscriptionPlans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    featured: false,
    features: [
      'Access to all premium content',
      'HD & 4K quality streaming',
      'Ad-free experience',
      'Download for offline viewing',
      'Priority customer support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 79.99,
    period: 'year',
    featured: true,
    features: [
      'Access to all premium content',
      'HD & 4K quality streaming',
      'Ad-free experience',
      'Download for offline viewing',
      'Priority customer support',
      'Save 33% compared to monthly',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 199.99,
    period: 'one-time',
    featured: false,
    features: [
      'Lifetime access to all premium content',
      'HD & 4K quality streaming',
      'Ad-free experience',
      'Download for offline viewing',
      'Priority customer support',
      'All future updates included',
    ],
  },
];

const premiumFeatures = [
  {
    title: 'Exclusive Content',
    description: 'Access to premium-only videos and exclusive releases',
    icon: Star,
  },
  {
    title: 'HD & 4K Quality',
    description: 'Stream in the highest quality available',
    icon: Zap,
  },
  {
    title: 'Ad-Free Experience',
    description: 'Enjoy uninterrupted viewing without ads',
    icon: Shield,
  },
  {
    title: 'Offline Downloads',
    description: 'Download videos to watch offline anytime',
    icon: Lock,
  },
];

onMounted(async () => {
  await checkPremiumStatus();
  await loadPremiumContent();
  console.log('Premium page mounted', { 
    isPremium: isPremium.value, 
    subscription: subscription.value 
  });
});

async function loadPremiumContent() {
  try {
    // Load premium-tagged videos
    await searchVideos('premium', 1, { perPage: 20 });
    premiumVideos.value = epornerVideos.value
      .filter(video => video.isPremium || video.tags?.includes('premium'))
      .slice(0, 12);
  } catch (error) {
    console.error('Error loading premium content:', error);
  }
}

function selectPlan(plan) {
  console.log('selectPlan called', { 
    plan, 
    isPremium: isPremium.value, 
    subscription: subscription.value,
    showSubscriptionDetails: showSubscriptionDetails.value
  });
  
  if (isPremium.value) {
    // If already premium, show subscription details
    console.log('User is premium, showing subscription details');
    showSubscriptionDetails.value = true;
    console.log('showSubscriptionDetails set to:', showSubscriptionDetails.value);
    return;
  }
  
  console.log('User is not premium, showing payment modal');
  selectedPlan.value = plan;
  showPaymentModal.value = true;
}

function handleVideoClick(video) {
  if (!isPremium.value) {
    selectedPlan.value = subscriptionPlans[1]; // Default to yearly
    showPaymentModal.value = true;
    return;
  }
  router.push(`/watch/${video.id}`);
}

async function handlePaymentSuccess(subscriptionData) {
  console.log('🎉 Payment success handler called with subscription:', subscriptionData);
  
  // Close payment modal immediately
  showPaymentModal.value = false;
  
  // Refresh premium status from backend (with retry logic)
  let retries = 3;
  let subscriptionFound = false;
  
  while (retries > 0 && !subscriptionFound) {
    await checkPremiumStatus();
    
    if (isPremium.value && subscription.value) {
      subscriptionFound = true;
      console.log('✅ Subscription found in DB:', subscription.value);
      break;
    }
    
    // Wait a bit before retrying
    if (retries > 1) {
      console.log(`⏳ Subscription not found yet, retrying... (${retries - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    retries--;
  }
  
  // Reload premium content
  await loadPremiumContent();
  
  // Dispatch custom event to notify other components (like Dashboard)
  window.dispatchEvent(new CustomEvent('subscription-updated', {
    detail: { 
      subscription: subscription.value || subscriptionData, 
      isPremium: isPremium.value 
    }
  }));
  
  // Check if subscription is now active
  if (isPremium.value && subscription.value) {
    // Success - show success modal
    console.log('✅ Showing success modal');
    showPaymentSuccess.value = true;
  } else {
    // Fallback: Even if status check failed, show success if we have subscription data
    if (subscriptionData) {
      console.log('✅ Using subscription data from payment response');
      showPaymentSuccess.value = true;
    } else {
      // Payment might still be processing
      alert('✅ Payment received! Your subscription is being activated. Redirecting to dashboard to check status...');
      setTimeout(() => {
        router.push('/dashboard?tab=subscription');
      }, 1500);
    }
  }
}

function goToDashboard() {
  showPaymentSuccess.value = false;
  router.push('/dashboard?tab=subscription');
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function handleCancelSubscription() {
  if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
    try {
      await cancelSubscription();
      await checkPremiumStatus();
      showSubscriptionDetails.value = false;
      alert('Subscription cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  }
}
</script>

<style scoped>
.premium-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.premium-hero {
  background: linear-gradient(135deg, var(--gradient-primary), #ff4500);
  padding: 80px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.premium-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.premium-hero-content {
  position: relative;
  z-index: 1;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.premium-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.premium-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.plans-section,
.features-section,
.premium-content-section {
  padding: 60px 40px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 40px 0;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.plan-card {
  background: var(--dark-lighter);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: var(--primary);
}

.plan-card.featured {
  border-color: var(--primary);
  background: linear-gradient(135deg, var(--dark-lighter), var(--dark-light));
  transform: scale(1.05);
}

.plan-card.subscribed {
  border-color: #4caf50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), var(--dark-lighter));
}

.subscribed-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gradient-primary);
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.plan-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.plan-price {
  margin-bottom: 30px;
}

.price-amount {
  font-size: 48px;
  font-weight: 800;
  color: var(--primary);
}

.price-period {
  font-size: 18px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
  text-align: left;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: var(--text-secondary);
  font-size: 15px;
}

.plan-features li svg {
  color: var(--primary);
  flex-shrink: 0;
}

.plan-button {
  width: 100%;
  padding: 14px 24px;
  background: var(--dark-light);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-button:hover {
  background: var(--gradient-primary);
  color: white;
  border-color: var(--primary);
  transform: translateY(-2px);
}

.plan-button.featured-button {
  background: var(--gradient-primary);
  color: white;
  border-color: var(--primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.feature-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.premium-content-section {
  background: var(--dark);
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 12px 0 0 0;
}

.premium-videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-state svg {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

@media (max-width: 768px) {
  .premium-hero {
    padding: 60px 20px;
  }

  .premium-title {
    font-size: 32px;
  }

  .premium-subtitle {
    font-size: 16px;
  }

  .plans-section,
  .features-section,
  .premium-content-section {
    padding: 40px 20px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-card.featured {
    transform: scale(1);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

.subscribed-button {
  background: linear-gradient(135deg, #4caf50, #45a049);
  border-color: #4caf50;
  color: white;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}

.subscribed-button:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.subscribed-button:disabled {
  opacity: 1;
  cursor: default;
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

.subscription-details-modal {
  background: var(--dark-lighter);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 40px 30px;
}

.subscription-details-modal .close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: var(--dark);
  border: none;
  border-radius: 50%;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1;
}

.subscription-details-modal .close-button:hover {
  background: var(--dark-light);
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.payment-icon {
  width: 64px;
  height: 64px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.subscription-info {
  margin: 30px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.info-item .value {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
}

.info-item .value.status-active {
  color: #4caf50;
}

.no-subscription {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
}

.subscription-details-modal .modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.cancel-button {
  flex: 1;
  padding: 14px 24px;
  background: var(--dark-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: var(--dark);
  transform: translateY(-2px);
}

.cancel-subscription-btn {
  flex: 1;
  padding: 14px 24px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-subscription-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

.payment-success-modal {
  background: var(--dark-lighter);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 40px 30px;
  text-align: center;
}

.success-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.success-message {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.success-btn {
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: var(--gradient-primary);
  color: white;
}

.success-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.success-btn.secondary {
  background: var(--dark-light);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.success-btn.secondary:hover {
  background: var(--dark);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .subscription-details-modal {
    max-width: 100%;
    margin: 0;
    padding: 30px 20px;
  }

  .payment-success-modal {
    padding: 30px 20px;
  }

  .success-actions {
    flex-direction: column;
  }

  .success-btn {
    width: 100%;
  }
}
</style>

