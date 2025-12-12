<template>
  <div v-if="!isVerified" class="age-verification-overlay">
    <div>
      <div class="modal-content">
        <div class="content-wrapper">
          <div class="main-content">
            <h1 class="verification-title">
              YOU MUST BE OVER 18 AND AGREE TO THE TERMS BELOW BEFORE CONTINUING:
            </h1>

            <div class="terms-content">
              <p class="terms-text">
                This website contains information, links, images and videos of sexually explicit material (collectively, the "Sexually Explicit Material"). Do NOT continue if: (i) you are not at least 18 years of age or the age of majority in each and every jurisdiction in which you will or may view the Sexually Explicit Material, whichever is higher (the "Age of Majority"), (ii) such material offends you, or (iii) viewing the Sexually Explicit Material is not legal in each and every community where you choose to view it.
              </p>

              <p class="terms-text">
                By choosing to enter this website you are affirming under oath and penalties of perjury pursuant to Title 28 U.S.C. § 1746 and other applicable statutes and laws that all of the following statements are true and correct:
              </p>

              <ul class="terms-list">
                <li>I have attained the Age of Majority in my jurisdiction;</li>
                <li>The sexually explicit material I am viewing is for my own personal use and I will not expose any minors to the material;</li>
                <li>I desire to receive/view sexually explicit material;</li>
                <li>I believe that as an adult it is my inalienable constitutional right to receive/view sexually explicit material;</li>
              </ul>

              <p class="warning-text">
                THIS SITE ACTIVELY COOPERATES WITH LAW ENFORCEMENT IN ALL INSTANCES OF SUSPECTED ILLEGAL USE OF THE SERVICE, ESPECIALLY IN THE CASE OF UNDERAGE USAGE OF THE SERVICE.
              </p>
            </div>

            <div class="modal-actions">
              <button class="exit-btn" @click="exitSite">
                Exit
              </button>
              <button class="agree-btn" @click="agreeAndEnter">
                I AGREE
              </button>
            </div>

            <div class="compliance-badges">
              <div class="badge-item">
                <div class="badge-checkbox"></div>
                <div class="badge-text">
                  <span class="badge-title">SafeLabeling</span>
                  <span class="badge-subtitle">COMPLIANT</span>
                </div>
              </div>
              <div class="badge-item">
                <div class="badge-logo rta-logo">RTA®</div>
                <div class="badge-text">
                  <span class="badge-subtitle">VERIFIED</span>
                </div>
              </div>
              <div class="badge-item">
                <div class="badge-logo asacp-logo">ASACP</div>
                <div class="badge-checkbox checked"></div>
                <div class="badge-text">
                  <span class="badge-subtitle">APPROVED MEMBER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const isVerified = ref(false);

function agreeAndEnter() {
  // Store verification in localStorage
  localStorage.setItem('ageVerified', 'true');
  localStorage.setItem('ageVerifiedTimestamp', Date.now().toString());
  isVerified.value = true;
  
  // Unlock body scroll
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  
  // Remove event listeners
  document.removeEventListener('contextmenu', preventDefault);
  document.removeEventListener('keydown', preventShortcuts);
  document.removeEventListener('selectstart', preventDefault);
  document.removeEventListener('dragstart', preventDefault);
}

function exitSite() {
  // Redirect to a safe page or close window
  window.location.href = 'https://www.google.com';
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

onMounted(() => {
  checkVerification();
  
  // Prevent right-click and other shortcuts when not verified
  if (!isVerified.value) {
    // Lock body scroll and hide all content
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Hide app content
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.style.display = 'none';
      appContent.style.visibility = 'hidden';
    }
    
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
  } else {
    // Unlock body scroll when verified
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    // Show app content
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.style.display = '';
      appContent.style.visibility = '';
    }
  }
});

// Watch for verification changes
watch(isVerified, (verified) => {
  if (verified) {
    // Unlock body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    // Show app content
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.style.display = '';
      appContent.style.visibility = '';
    }
    
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
    document.body.style.height = '100%';
    
    // Hide app content
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.style.display = 'none';
      appContent.style.visibility = 'hidden';
    }
    
    // Add event listeners
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
  }
});
</script>

<style scoped>
.age-verification-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: #000000 !important;
  z-index: 999999 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  isolation: isolate;
  pointer-events: auto;
  box-sizing: border-box;
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.modal-content {
  padding: 0;
  overflow: hidden;
  flex: 1;
  display: flex;
  position: relative;
}

.content-wrapper {
  display: flex;
  width: 100%;
  position: relative;
}

.main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  padding-right: 60px;
}

.verification-title {
  font-size: 18px;
  font-weight: 700;
  color: #d0d0d0;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  line-height: 1.4;
  letter-spacing: 0.5px;
}

.terms-content {
  margin-bottom: 32px;
}

.terms-text {
  font-size: 13px;
  color: #b0b0b0;
  line-height: 1.7;
  margin-bottom: 16px;
}

.terms-list {
  margin: 16px 0;
  padding-left: 20px;
  list-style-type: disc;
}

.terms-list li {
  font-size: 13px;
  color: #b0b0b0;
  line-height: 1.7;
  margin-bottom: 10px;
}

.warning-text {
  font-size: 13px;
  font-weight: 700;
  color: #ff4444;
  text-transform: uppercase;
  margin-top: 24px;
  padding: 12px;
  background: rgba(255, 68, 68, 0.1);
  border-left: 4px solid #ff4444;
  line-height: 1.6;
  text-decoration: underline;
  text-decoration-color: #ff4444;
  letter-spacing: 0.5px;
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.exit-btn {
  flex: 1;
  padding: 14px 24px;
  background: transparent;
  border: 1px solid #666;
  border-radius: 6px;
  color: #d0d0d0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #888;
}

.agree-btn {
  flex: 1;
  padding: 14px 24px;
  background: #ff4500;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
}

.agree-btn:hover {
  background: #ff6b35;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.compliance-badges {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #d0d0d0;
  border-radius: 2px;
  flex-shrink: 0;
  background: transparent;
}

.badge-checkbox.checked {
  background: #ff4500;
  border-color: #ff4500;
  position: relative;
}

.badge-checkbox.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.badge-logo {
  font-size: 18px;
  font-weight: 700;
  color: #d0d0d0;
  flex-shrink: 0;
}

.rta-logo {
  font-family: 'Arial', sans-serif;
  font-style: italic;
}

.asacp-logo {
  font-size: 16px;
  letter-spacing: 1px;
}

.badge-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge-title {
  font-size: 11px;
  font-weight: 600;
  color: #d0d0d0;
}

.badge-subtitle {
  font-size: 10px;
  font-weight: 600;
  color: #b0b0b0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Vertical bar with orange gradient - 3D spine effect */
.vertical-bar {
  position: absolute;
  left: -8px;
  top: 0;
  bottom: 0;
  width: 12px;
  background: linear-gradient(
    to right,
    rgba(255, 200, 100, 0.9) 0%,
    rgba(255, 150, 50, 0.8) 20%,
    rgba(255, 100, 0, 0.9) 50%,
    rgba(200, 80, 0, 0.8) 80%,
    rgba(150, 60, 0, 0.7) 100%
  );
  border-left: 2px solid #ff4500;
  border-right: 2px solid rgba(255, 69, 0, 0.5);
  box-shadow: 
    inset -2px 0 10px rgba(255, 200, 100, 0.5),
    2px 0 10px rgba(0, 0, 0, 0.5);
  z-index: 2;
  border-radius: 4px 0 0 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 24px 20px;
    padding-right: 20px;
  }

  .vertical-bar {
    display: none;
  }

  .verification-title {
    font-size: 16px;
  }

  .terms-text,
  .terms-list li {
    font-size: 12px;
  }

  .warning-text {
    font-size: 11px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .exit-btn,
  .agree-btn {
    width: 100%;
  }

  .compliance-badges {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 16px;
  }

  .verification-title {
    font-size: 14px;
  }

  .terms-text,
  .terms-list li {
    font-size: 11px;
  }
}
</style>
