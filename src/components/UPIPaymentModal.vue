<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="payment-modal upi-modal">
        <button class="close-button" @click="$emit('close')">
          <X :size="24" />
        </button>

        <div class="modal-header">
          <div class="payment-icon">
            <CreditCard :size="32" />
          </div>
          <h2 class="modal-title">Pay with UPI</h2>
          <p class="modal-subtitle">Scan QR code or use UPI ID to complete payment</p>
        </div>

        <div class="plan-summary">
          <div class="plan-summary-item">
            <span class="label">Plan:</span>
            <span class="value">{{ plan?.name }} ({{ plan?.period }})</span>
          </div>
          <div class="plan-summary-item">
            <span class="label">Amount:</span>
            <span class="value price">₹{{ plan?.price }}</span>
          </div>
        </div>

        <!-- UPI Payment Options -->
        <div class="upi-payment-section">
          <!-- QR Code -->
          <div class="upi-qr-section">
            <h3 class="section-title">Scan QR Code</h3>
            <div class="qr-code-container">
              <div v-if="loadingQR" class="qr-loading">
                <Loader2 :size="32" class="animate-spin" />
                <p>Generating QR code...</p>
              </div>
              <div v-else-if="qrCodeUrl" class="qr-code">
                <img :src="qrCodeUrl" alt="UPI QR Code" />
              </div>
              <div v-else class="qr-placeholder">
                <QrCode :size="64" />
                <p>Click "Generate QR Code" to proceed</p>
              </div>
            </div>
            <button 
              class="generate-qr-btn"
              @click="generateQRCode"
              :disabled="loadingQR"
            >
              <QrCode :size="18" />
              <span>{{ qrCodeUrl ? 'Regenerate QR Code' : 'Generate QR Code' }}</span>
            </button>
          </div>

          <!-- UPI ID -->
          <div class="upi-id-section">
            <h3 class="section-title">Or Pay via UPI ID</h3>
            <div class="upi-id-container">
              <div class="upi-id-display">
                <span class="upi-id-label">UPI ID:</span>
                <div class="upi-id-value">
                  <code>{{ upiId }}</code>
                  <button class="copy-btn" @click="copyUPIId" title="Copy UPI ID">
                    <Copy :size="16" />
                  </button>
                </div>
              </div>
              <p class="upi-instructions">
                Send ₹{{ plan?.price }} to this UPI ID from any UPI app (PhonePe, Google Pay, Paytm, etc.)
              </p>
            </div>
          </div>

          <!-- Payment Status -->
          <div v-if="paymentStatus" class="payment-status" :class="paymentStatus">
            <div v-if="paymentStatus === 'pending'" class="status-message">
              <Clock :size="20" />
              <span>Waiting for payment confirmation...</span>
            </div>
            <div v-else-if="paymentStatus === 'success'" class="status-message">
              <CheckCircle :size="20" />
              <span>Payment successful! Activating subscription...</span>
            </div>
            <div v-else-if="paymentStatus === 'failed'" class="status-message">
              <XCircle :size="20" />
              <span>Payment failed. Please try again.</span>
            </div>
          </div>

          <!-- Manual Verification (if needed) -->
          <div class="manual-verification">
            <p class="verification-note">
              After making the payment, click "I've Paid" to verify and activate your subscription.
            </p>
            <button 
              class="verify-payment-btn"
              @click="verifyPayment"
              :disabled="processing"
            >
              <CheckCircle :size="18" />
              <span>{{ processing ? 'Verifying...' : "I've Paid" }}</span>
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="$emit('close')">
            Cancel
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { X, CreditCard, QrCode, Copy, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next';
import { useSubscription } from '../composables/useSubscription';
import { subscriptionApi } from '../api/subscription';

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'success']);

const { checkPremiumStatus } = useSubscription();

const loadingQR = ref(false);
const qrCodeUrl = ref('');
const upiId = ref('your-upi-id@paytm'); // Will be updated from API response
const orderId = ref(null);
const paymentStatus = ref(null);
const processing = ref(false);
const error = ref('');

// Generate UPI QR Code
async function generateQRCode() {
  loadingQR.value = true;
  error.value = '';

  try {
    // Create payment order
    const orderResponse = await subscriptionApi.createUPIOrder({
      planId: props.plan.id,
      amount: props.plan.price,
      type: props.plan.id === 'lifetime' ? 'lifetime' : props.plan.id === 'yearly' ? 'yearly' : 'monthly',
    });

    if (orderResponse.qrCodeUrl) {
      qrCodeUrl.value = orderResponse.qrCodeUrl;
      orderId.value = orderResponse.orderId;
      paymentStatus.value = 'pending';
    } else if (orderResponse.upiLink) {
      // If Razorpay returns UPI link, convert to QR code
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderResponse.upiLink)}`;
      orderId.value = orderResponse.orderId;
      paymentStatus.value = 'pending';
    }
    
    if (orderResponse.upiId) {
      upiId.value = orderResponse.upiId;
    }
  } catch (err) {
    error.value = err.message || 'Failed to generate QR code. Please try again.';
    console.error('Error generating QR code:', err);
  } finally {
    loadingQR.value = false;
  }
}

// Copy UPI ID to clipboard
async function copyUPIId() {
  try {
    await navigator.clipboard.writeText(upiId.value);
    // Show toast notification (you can add a toast library)
    alert('UPI ID copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy UPI ID:', err);
  }
}

// Verify payment manually
async function verifyPayment() {
  processing.value = true;
  error.value = '';
  paymentStatus.value = 'pending';

  try {
    // Verify payment with backend
    const verifyResponse = await subscriptionApi.verifyUPIPayment({
      planId: props.plan.id,
      type: props.plan.id === 'lifetime' ? 'lifetime' : props.plan.id === 'yearly' ? 'yearly' : 'monthly',
      amount: props.plan.price,
      orderId: orderId.value,
    });

    if (verifyResponse.success) {
      paymentStatus.value = 'success';
      // Refresh premium status
      await checkPremiumStatus();
      setTimeout(() => {
        emit('success');
      }, 1500);
    } else {
      paymentStatus.value = 'failed';
      error.value = verifyResponse.error || 'Payment verification failed. Please contact support.';
    }
  } catch (err) {
    paymentStatus.value = 'failed';
    error.value = err.message || 'Payment verification failed. Please try again.';
  } finally {
    processing.value = false;
  }
}

onMounted(async () => {
  // Auto-generate QR code on mount
  await generateQRCode();
});
</script>

<style scoped>
.upi-modal {
  max-width: 600px;
}

.upi-payment-section {
  padding: 20px 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.upi-qr-section,
.upi-id-section {
  margin-bottom: 30px;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: var(--dark);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.qr-code img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.generate-qr-btn {
  width: 100%;
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.generate-qr-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.generate-qr-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upi-id-container {
  background: var(--dark);
  border-radius: 12px;
  padding: 20px;
}

.upi-id-display {
  margin-bottom: 12px;
}

.upi-id-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.upi-id-value {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--dark-lighter);
  border-radius: 8px;
}

.upi-id-value code {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  font-family: 'Courier New', monospace;
}

.copy-btn {
  padding: 6px 12px;
  background: var(--dark-light);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--gradient-primary);
  color: white;
  border-color: var(--primary);
}

.upi-instructions {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.payment-status {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.payment-status.pending {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.payment-status.success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.payment-status.failed {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-message {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.manual-verification {
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.verification-note {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  text-align: center;
}

.verify-payment-btn {
  width: 100%;
  padding: 14px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.verify-payment-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.verify-payment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

