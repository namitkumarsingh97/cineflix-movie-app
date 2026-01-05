<template>
  <div class="contact-page">
    <div class="contact-container">
      <div class="contact-hero">
        <h1 class="contact-title">Contact Us</h1>
        <p class="contact-subtitle">We're here to help! Get in touch with our team</p>
      </div>

      <div class="contact-content">
        <div class="contact-info">
          <section class="contact-section">
            <h2>Get in Touch</h2>
            <p>
              Have a question, suggestion, or need support? We'd love to hear from you. Our team is here to help and will respond to your inquiry as soon as possible.
            </p>

            <div class="contact-methods">
              <div class="contact-method">
                <div class="method-icon">📧</div>
                <h3>Customer Support</h3>
                <p>For account issues, billing questions, technical support, and general inquiries</p>
                <a href="mailto:support@moviehub.com" class="contact-link">support@moviehub.com</a>
                <p class="response-time">Response time: 24-48 hours</p>
              </div>

              <div class="contact-method">
                <div class="method-icon">🎬</div>
                <h3>Content & Studio Partnerships</h3>
                <p>For studios, performers, and content creators interested in partnership opportunities</p>
                <a href="mailto:content@moviehub.com" class="contact-link">content@moviehub.com</a>
                <p class="response-time">Response time: 3-5 business days</p>
              </div>

              <div class="contact-method">
                <div class="method-icon">💼</div>
                <h3>Business Development</h3>
                <p>For advertising, affiliate programs, and business partnerships</p>
                <a href="mailto:business@moviehub.com" class="contact-link">business@moviehub.com</a>
                <p class="response-time">Response time: 5-7 business days</p>
              </div>

              <div class="contact-method">
                <div class="method-icon">🔒</div>
                <h3>Privacy & Legal</h3>
                <p>For privacy concerns, DMCA takedown requests, legal matters, and compliance issues</p>
                <a href="mailto:legal@moviehub.com" class="contact-link">legal@moviehub.com</a>
                <p class="response-time">Response time: 48-72 hours</p>
              </div>

              <div class="contact-method">
                <div class="method-icon">🚫</div>
                <h3>Content Removal Requests</h3>
                <p>For performers, studios, or rights holders requesting content removal</p>
                <a href="mailto:removal@moviehub.com" class="contact-link">removal@moviehub.com</a>
                <p class="response-time">Response time: 24-48 hours</p>
              </div>
            </div>
          </section>

          <section class="contact-section">
            <h2>Office Address</h2>
            <div class="address-box">
              <p><strong>MovieHub Headquarters</strong></p>
              <p>123 Entertainment Street</p>
              <p>Digital City, DC 12345</p>
              <p>United States</p>
            </div>
          </section>

          <section class="contact-section">
            <h2>Response Time</h2>
            <p>
              We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters, please mark your email as "Urgent" in the subject line.
            </p>
          </section>
        </div>

        <div class="contact-form-section">
          <section class="contact-section">
            <h2>Send Us a Message</h2>
            <form @submit.prevent="handleSubmit" class="contact-form">
              <div class="form-group">
                <label for="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  required
                  placeholder="Your full name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  required
                  placeholder="your.email@example.com"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="subject">Subject *</label>
                <select
                  id="subject"
                  v-model="form.subject"
                  required
                  class="form-input"
                >
                  <option value="">Select a subject</option>
                  <option value="account">Account Issues</option>
                  <option value="billing">Billing & Payment</option>
                  <option value="technical">Technical Support</option>
                  <option value="content">Content Request/Issue</option>
                  <option value="privacy">Privacy Concern</option>
                  <option value="removal">Content Removal Request</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  required
                  rows="6"
                  placeholder="Please provide details about your inquiry..."
                  class="form-input"
                ></textarea>
              </div>

              <button type="submit" class="submit-button" :disabled="submitting">
                {{ submitting ? 'Sending...' : 'Send Message' }}
              </button>

              <p v-if="submitMessage" class="submit-message" :class="{ success: submitSuccess, error: !submitSuccess }">
                {{ submitMessage }}
              </p>
            </form>
          </section>
        </div>
      </div>

      <section class="contact-section">
        <h2>Frequently Asked Questions</h2>
        <p>
          Before contacting us, you might find the answer to your question in our <router-link to="/help" class="contact-link">Help Center</router-link>. We've compiled answers to the most common questions and issues.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

onMounted(() => {
	document.title = "Contact Us - MovieHub";
	window.scrollTo(0, 0);
});

const form = ref({
	name: "",
	email: "",
	subject: "",
	message: "",
});

const submitting = ref(false);
const submitMessage = ref("");
const submitSuccess = ref(false);

const handleSubmit = async () => {
	submitting.value = true;
	submitMessage.value = "";

	// Simulate form submission (in a real app, this would send to a backend)
	setTimeout(() => {
		submitting.value = false;
		submitSuccess.value = true;
		submitMessage.value =
			"Thank you for your message! We'll get back to you within 24-48 hours.";

		// Reset form
		form.value = {
			name: "",
			email: "",
			subject: "",
			message: "",
		};

		// Clear message after 5 seconds
		setTimeout(() => {
			submitMessage.value = "";
		}, 5000);
	}, 1500);
};
</script>

<style scoped>
.contact-page {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  background: var(--dark);
  color: var(--text-primary);
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
}

.contact-hero {
  text-align: center;
  margin-bottom: 50px;
  padding: 40px 0;
}

.contact-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 15px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.contact-subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  font-weight: 500;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 50px;
}

.contact-section {
  margin-bottom: 40px;
}

.contact-section h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--primary);
}

.contact-section p {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 15px;
}

.contact-methods {
  display: grid;
  gap: 20px;
  margin-top: 25px;
}

.contact-method {
  background: var(--dark-light);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.contact-method:hover {
  border-color: var(--primary);
  transform: translateX(5px);
}

.method-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.contact-method h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.contact-method p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
}

.response-time {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.7;
  font-style: italic;
  margin-top: 5px;
}

.contact-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: var(--secondary);
  text-decoration: underline;
}

.address-box {
  background: var(--dark-light);
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid var(--primary);
}

.address-box p {
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.address-box p strong {
  color: var(--text-primary);
  font-size: 18px;
}

.contact-form {
  background: var(--dark-light);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  /* Focus indicators disabled */
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

textarea.form-input {
  resize: vertical;
  font-family: inherit;
}

select.form-input {
  cursor: pointer;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.submit-message.success {
  background: rgba(50, 205, 50, 0.1);
  color: #32cd32;
  border: 1px solid rgba(50, 205, 50, 0.3);
}

.submit-message.error {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

@media (max-width: 968px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .contact-page {
    padding: 30px 15px;
  }

  .contact-title {
    font-size: 36px;
  }

  .contact-subtitle {
    font-size: 18px;
  }

  .contact-section h2 {
    font-size: 24px;
  }

  .contact-form {
    padding: 20px;
  }
}
</style>

