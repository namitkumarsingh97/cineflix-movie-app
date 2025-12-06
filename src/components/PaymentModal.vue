<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="payment-modal">
        <button class="close-button" @click="$emit('close')">
          <X :size="24" />
        </button>

        <div class="modal-header">
          <div class="payment-icon">
            <CreditCard :size="32" />
          </div>
          <h2 class="modal-title">Subscribe to Premium</h2>
          <p class="modal-subtitle">Complete your payment to unlock premium features</p>
        </div>

        <div class="plan-summary">
          <div class="plan-summary-item">
            <span class="label">Plan:</span>
            <span class="value">{{ plan?.name }} ({{ plan?.period }})</span>
          </div>
          <div class="plan-summary-item">
            <span class="label">Price:</span>
            <span class="value price">${{ plan?.price }}</span>
          </div>
        </div>

        <div class="payment-form">
          <div class="form-group">
            <label>Card Number</label>
            <input
              v-model="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              @input="formatCardNumber"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Expiry Date</label>
              <input
                v-model="expiryDate"
                type="text"
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiry"
              />
            </div>
            <div class="form-group">
              <label>CVV</label>
              <input
                v-model="cvv"
                type="text"
                placeholder="123"
                maxlength="4"
                @input="formatCVV"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Cardholder Name</label>
            <input
              v-model="cardholderName"
              type="text"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div class="payment-options">
          <p class="options-title">Or pay with:</p>
          <div class="payment-buttons">
            <button class="payment-option-btn" @click="handleMockPayment('stripe')">
              <CreditCard :size="20" />
              <span>Stripe</span>
            </button>
            <button class="payment-option-btn" @click="handleMockPayment('paypal')">
              <span>PayPal</span>
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="$emit('close')">
            Cancel
          </button>
          <button 
            class="pay-button"
            :disabled="!isFormValid || processing"
            @click="handlePayment"
          >
            <span v-if="processing">Processing...</span>
            <span v-else>Pay ${{ plan?.price }}</span>
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
import { ref, computed } from 'vue';
import { X, CreditCard } from 'lucide-vue-next';
import { useSubscription } from '../composables/useSubscription';

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

const { processPayment } = useSubscription();

const cardNumber = ref('');
const expiryDate = ref('');
const cvv = ref('');
const cardholderName = ref('');
const processing = ref(false);
const error = ref('');

const isFormValid = computed(() => {
  return (
    cardNumber.value.replace(/\s/g, '').length === 16 &&
    expiryDate.value.length === 5 &&
    cvv.value.length >= 3 &&
    cardholderName.value.trim().length > 0
  );
});

function formatCardNumber(event) {
  let value = event.target.value.replace(/\s/g, '');
  value = value.replace(/\D/g, '');
  value = value.slice(0, 16);
  value = value.match(/.{1,4}/g)?.join(' ') || value;
  cardNumber.value = value;
}

function formatExpiry(event) {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  expiryDate.value = value.slice(0, 5);
}

function formatCVV(event) {
  cvv.value = event.target.value.replace(/\D/g, '').slice(0, 4);
}

async function handlePayment() {
  if (!isFormValid.value) return;

  processing.value = true;
  error.value = '';

  try {
    // Process payment through subscription composable
    const result = await processPayment({
      planId: props.plan.id,
      amount: props.plan.price,
      paymentMethod: 'stripe', // Use Stripe for real payments
      cardDetails: {
        number: cardNumber.value.replace(/\s/g, ''),
        expiry: expiryDate.value,
        cvv: cvv.value,
        name: cardholderName.value,
      },
    });

    // If Stripe payment intent is required, handle it
    if (result && result.requiresPayment && result.clientSecret) {
      // For now, we'll use mock payment confirmation
      // In production, you would use Stripe.js Elements to confirm the payment
      // This requires installing @stripe/stripe-js and using Stripe Elements
      
      // Simulate payment confirmation (replace with actual Stripe confirmation)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Confirm payment on backend
      const confirmResult = await processPayment({
        planId: props.plan.id,
        amount: props.plan.price,
        paymentMethod: 'stripe',
        paymentIntentId: result.paymentIntentId,
      });

      if (confirmResult === true || !confirmResult.requiresPayment) {
        emit('success');
      } else {
        error.value = 'Payment confirmation failed. Please try again.';
      }
    } else if (result === true) {
      // Mock payment succeeded
      emit('success');
    } else {
      error.value = 'Payment failed. Please try again.';
    }
  } catch (err) {
    error.value = err.message || 'Payment processing failed. Please try again.';
  } finally {
    processing.value = false;
  }
}

async function handleMockPayment(method) {
  processing.value = true;
  error.value = '';

  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = await processPayment({
      planId: props.plan.id,
      amount: props.plan.price,
      paymentMethod: method,
    });

    if (success) {
      emit('success');
    } else {
      error.value = 'Payment failed. Please try again.';
    }
  } catch (err) {
    error.value = err.message || 'Payment processing failed. Please try again.';
  } finally {
    processing.value = false;
  }
}
</script>

<style scoped>
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

.payment-modal {
  background: var(--dark-lighter);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.close-button {
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

.close-button:hover {
  background: var(--dark-light);
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  padding: 40px 30px 20px;
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
  margin: 0 0 8px 0;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.plan-summary {
  background: var(--dark);
  padding: 20px 30px;
  margin: 0 30px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.plan-summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.plan-summary-item .label {
  color: var(--text-secondary);
  font-size: 14px;
}

.plan-summary-item .value {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.plan-summary-item .value.price {
  font-size: 20px;
  color: var(--primary);
  font-weight: 700;
}

.payment-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.payment-options {
  padding: 0 30px 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.options-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  text-align: center;
}

.payment-buttons {
  display: flex;
  gap: 12px;
}

.payment-option-btn {
  flex: 1;
  padding: 12px;
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.payment-option-btn:hover {
  background: var(--dark-light);
  border-color: var(--primary);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 30px 30px;
}

.cancel-button,
.pay-button {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-button {
  background: var(--dark);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.cancel-button:hover {
  background: var(--dark-light);
}

.pay-button {
  background: var(--gradient-primary);
  color: white;
}

.pay-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.pay-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  padding: 12px 30px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  color: #ef4444;
  font-size: 14px;
  margin: 0 30px 20px;
  border-radius: 4px;
}

@media (max-width: 480px) {
  .payment-modal {
    max-width: 100%;
    margin: 0;
    border-radius: 16px 16px 0 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

