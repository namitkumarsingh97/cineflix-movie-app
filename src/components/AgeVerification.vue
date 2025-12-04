<template>
  <div v-if="!isVerified" class="age-verification-overlay">
    <div class="age-verification-modal">
      <div class="verification-header">
        <div class="warning-icon">
          <AlertTriangle :size="48" />
        </div>
        <h1 class="verification-title">Age Verification Required</h1>
        <p class="verification-subtitle">
          This website contains adult content. You must be 18 years or older to access.
        </p>
      </div>

      <div class="verification-content">
        <div class="verification-question">
          <p class="question-text">
            To verify your age, please solve this simple math problem:
          </p>
          <div class="math-problem">
            <span class="math-expression">
              {{ mathProblem.num1 }} {{ mathProblem.operator }} {{ mathProblem.num2 }} = ?
            </span>
          </div>
        </div>

        <div class="verification-input">
          <input
            v-model="userAnswer"
            type="number"
            placeholder="Enter your answer"
            class="answer-input"
            @keyup.enter="verifyAge"
            autofocus
          />
          <p v-if="showError" class="error-message">
            {{ errorMessage }}
          </p>
        </div>

        <div class="verification-actions">
          <button
            class="verify-btn"
            @click="verifyAge"
            :disabled="!userAnswer || verifying"
          >
            {{ verifying ? 'Verifying...' : 'Verify Age' }}
          </button>
        </div>

        <div class="verification-footer">
          <p class="footer-text">
            By entering this site, you confirm that you are at least 18 years of age
            and agree to view adult content.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { AlertTriangle } from 'lucide-vue-next';

const isVerified = ref(false);
const userAnswer = ref('');
const verifying = ref(false);
const showError = ref(false);
const errorMessage = ref('');

// Generate random math problem that results in 18
const mathProblem = ref(generateMathProblem());

function generateMathProblem() {
  // Generate problems that equal 18 (age requirement)
  const problems = [
    { num1: 20, operator: '-', num2: 2, answer: 18 },
    { num1: 10, operator: '+', num2: 8, answer: 18 },
    { num1: 36, operator: '/', num2: 2, answer: 18 },
    { num1: 9, operator: '*', num2: 2, answer: 18 },
    { num1: 25, operator: '-', num2: 7, answer: 18 },
    { num1: 15, operator: '+', num2: 3, answer: 18 },
    { num1: 54, operator: '/', num2: 3, answer: 18 },
    { num1: 6, operator: '*', num2: 3, answer: 18 },
    { num1: 30, operator: '-', num2: 12, answer: 18 },
    { num1: 12, operator: '+', num2: 6, answer: 18 },
  ];
  
  return problems[Math.floor(Math.random() * problems.length)];
}

function verifyAge() {
  if (!userAnswer.value) {
    showError.value = true;
    errorMessage.value = 'Please enter an answer';
    return;
  }

  verifying.value = true;
  showError.value = false;

  // Simulate verification delay (makes it feel more secure)
  setTimeout(() => {
    const answer = parseInt(userAnswer.value);
    
    if (answer === mathProblem.value.answer) {
      // Correct answer - verify age
      localStorage.setItem('ageVerified', 'true');
      localStorage.setItem('ageVerifiedTimestamp', Date.now().toString());
      isVerified.value = true;
      // Remove event listeners when verified
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('keydown', preventShortcuts);
    } else {
      // Wrong answer - show error and generate new problem
      showError.value = true;
      errorMessage.value = 'Incorrect answer. Please try again.';
      mathProblem.value = generateMathProblem();
      userAnswer.value = '';
      verifying.value = false;
    }
  }, 500);
}

function checkVerification() {
  const verified = localStorage.getItem('ageVerified');
  const timestamp = localStorage.getItem('ageVerifiedTimestamp');
  
  if (verified === 'true' && timestamp) {
    // Check if verification is still valid (optional: expire after 30 days)
    const verificationDate = parseInt(timestamp);
    const daysSinceVerification = (Date.now() - verificationDate) / (1000 * 60 * 60 * 24);
    
    // Verification expires after 30 days (optional - remove if you want permanent)
    if (daysSinceVerification < 30) {
      isVerified.value = true;
      // Remove event listeners when verified
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('keydown', preventShortcuts);
    } else {
      // Expired - require re-verification
      localStorage.removeItem('ageVerified');
      localStorage.removeItem('ageVerifiedTimestamp');
    }
  }
}

onMounted(() => {
  checkVerification();
  
  // Prevent right-click and other shortcuts when not verified
  if (!isVerified.value) {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
  } else {
    // Unlock body scroll when verified
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
});

// Watch for verification changes
watch(isVerified, (verified) => {
  if (verified) {
    // Unlock body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    // Remove event listeners
    document.removeEventListener('contextmenu', preventDefault);
    document.removeEventListener('keydown', preventShortcuts);
    document.removeEventListener('selectstart', preventDefault);
    document.removeEventListener('dragstart', preventDefault);
  } else {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Add event listeners
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
  }
});

function preventDefault(e) {
  e.preventDefault();
  return false;
}

function preventShortcuts(e) {
  // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
    (e.ctrlKey && e.shiftKey && e.key === 'C') ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
    return false;
  }
}
</script>

<style scoped>
.age-verification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(10px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.age-verification-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 0, 110, 0.3);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.verification-header {
  text-align: center;
  margin-bottom: 30px;
}

.warning-icon {
  color: #ff006e;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.verification-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.verification-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.verification-content {
  margin-top: 30px;
}

.verification-question {
  margin-bottom: 24px;
}

.question-text {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-align: center;
}

.math-problem {
  background: var(--dark-lighter);
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid rgba(255, 0, 110, 0.2);
}

.math-expression {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
  font-family: 'Courier New', monospace;
}

.verification-input {
  margin-bottom: 20px;
}

.answer-input {
  width: 100%;
  padding: 14px 18px;
  background: var(--dark);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.answer-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 0, 110, 0.1);
}

.answer-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.verification-actions {
  margin-bottom: 24px;
}

.verify-btn {
  width: 100%;
  padding: 16px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 0, 110, 0.4);
}

.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verification-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .age-verification-modal {
    padding: 30px 20px;
    margin: 20px;
  }

  .verification-title {
    font-size: 24px;
  }

  .math-expression {
    font-size: 28px;
  }

  .answer-input {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .age-verification-modal {
    padding: 24px 16px;
  }

  .verification-title {
    font-size: 20px;
  }

  .verification-subtitle {
    font-size: 14px;
  }

  .math-expression {
    font-size: 24px;
  }
}
</style>

