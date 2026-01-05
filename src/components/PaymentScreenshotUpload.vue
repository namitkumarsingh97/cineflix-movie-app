<template>
  <div class="payment-upload-section">
    <div class="section-header">
      <h3 class="section-title">
        <Upload :size="20" />
        Upload Payment Screenshot
      </h3>
      <p class="section-description">
        After making payment via UPI, upload your payment screenshot for verification.
        Admin will review and activate your subscription.
      </p>
    </div>

    <form @submit.prevent="handleUpload" class="upload-form">
      <div class="form-group">
        <label for="plan">Select Plan</label>
        <select id="plan" v-model="formData.planId" required>
          <option value="">Choose a plan</option>
          <option value="monthly">Monthly (₹9.99)</option>
          <option value="yearly">Yearly (₹79.99)</option>
          <option value="lifetime">Lifetime (₹199.99)</option>
        </select>
      </div>

      <div class="form-group">
        <label for="amount">Amount Paid (₹)</label>
        <input
          id="amount"
          v-model.number="formData.amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Enter amount paid"
        />
      </div>

      <div class="form-group">
        <label for="screenshot">Payment Screenshot</label>
        <div class="file-upload-area" :class="{ 'has-file': selectedFile }">
          <input
            id="screenshot"
            type="file"
            accept="image/*,.pdf"
            @change="handleFileSelect"
            required
            class="file-input"
          />
          <div v-if="!selectedFile" class="upload-placeholder">
            <Upload :size="32" />
            <p>Click to select or drag and drop</p>
            <span class="file-hint">Image (JPEG, PNG, GIF) or PDF (Max 10MB)</span>
          </div>
          <div v-else class="file-preview">
            <FileText :size="24" />
            <span>{{ selectedFile.name }}</span>
            <button type="button" @click="clearFile" class="remove-btn">
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn" :disabled="uploading">
        <Loader2 v-if="uploading" :size="18" class="spinner" />
        <Upload v-else :size="18" />
        <span>{{ uploading ? 'Uploading...' : 'Upload Screenshot' }}</span>
      </button>
    </form>

    <div v-if="error" class="error-message">
      <AlertCircle :size="18" />
      <span>{{ error }}</span>
    </div>

    <div v-if="success" class="success-message">
      <CheckCircle :size="18" />
      <span>{{ success }}</span>
    </div>

    <!-- My Verifications List -->
    <div v-if="verifications.length > 0" class="verifications-list">
      <h4 class="list-title">My Payment Verifications</h4>
      <div class="verification-items">
        <div
          v-for="verification in verifications"
          :key="verification._id"
          class="verification-item"
          :class="verification.status"
        >
          <div class="verification-info">
            <div class="verification-header">
              <span class="plan-name">{{ formatPlanType(verification.type) }}</span>
              <span class="status-badge" :class="verification.status">
                {{ verification.status }}
              </span>
            </div>
            <div class="verification-details">
              <span>Amount: ₹{{ verification.amount }}</span>
              <span>Submitted: {{ formatDate(verification.createdAt) }}</span>
            </div>
            <div v-if="verification.rejectionReason" class="rejection-reason">
              <AlertCircle :size="16" />
              <span>Reason: {{ verification.rejectionReason }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
	AlertCircle,
	CheckCircle,
	FileText,
	Loader2,
	Upload,
	X,
} from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { paymentVerificationApi } from "../api/paymentVerification";

const emit = defineEmits(["uploaded"]);

const formData = ref({
	planId: "",
	type: "",
	amount: null,
});

const selectedFile = ref(null);
const uploading = ref(false);
const error = ref("");
const success = ref("");
const verifications = ref([]);

const planTypes = {
	monthly: "Monthly",
	yearly: "Yearly",
	lifetime: "Lifetime",
};

function formatPlanType(type) {
	return planTypes[type] || type;
}

function formatDate(date) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function handleFileSelect(event) {
	const file = event.target.files[0];
	if (file) {
		if (file.size > 10 * 1024 * 1024) {
			error.value = "File size must be less than 10MB";
			return;
		}
		selectedFile.value = file;
		error.value = "";
	}
}

function clearFile() {
	selectedFile.value = null;
	const input = document.getElementById("screenshot");
	if (input) input.value = "";
}

async function handleUpload() {
	if (!selectedFile.value) {
		error.value = "Please select a payment screenshot";
		return;
	}

	uploading.value = true;
	error.value = "";
	success.value = "";

	try {
		// Set type based on planId
		formData.value.type = formData.value.planId;

		const uploadFormData = new FormData();
		uploadFormData.append("paymentScreenshot", selectedFile.value);
		uploadFormData.append("planId", formData.value.planId);
		uploadFormData.append("type", formData.value.type);
		uploadFormData.append("amount", formData.value.amount);

		const response =
			await paymentVerificationApi.uploadScreenshot(uploadFormData);

		if (response.success) {
			success.value =
				response.message ||
				"Payment screenshot uploaded successfully! Admin will review it soon.";
			clearFile();
			formData.value = {
				planId: "",
				type: "",
				amount: null,
			};
			await loadVerifications();
			emit("uploaded");
		} else {
			error.value = response.error || "Failed to upload screenshot";
		}
	} catch (err) {
		error.value =
			err.response?.data?.error || err.message || "Failed to upload screenshot";
	} finally {
		uploading.value = false;
	}
}

async function loadVerifications() {
	try {
		const response = await paymentVerificationApi.getMyVerifications();
		if (response.success) {
			verifications.value = response.verifications || [];
		}
	} catch (err) {
		console.error("Error loading verifications:", err);
	}
}

onMounted(() => {
	loadVerifications();
});
</script>

<style scoped>
.payment-upload-section {
  background: var(--dark-lighter);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.section-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.upload-form {
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
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px;
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 15px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
}

.file-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.file-upload-area:hover {
  border-color: var(--primary);
  background: rgba(255, 69, 0, 0.05);
}

.file-upload-area.has-file {
  border-color: var(--primary);
  background: rgba(255, 69, 0, 0.05);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.file-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  justify-content: center;
}

.remove-btn {
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.success-message {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

.verifications-list {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.list-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.verification-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verification-item {
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.plan-name {
  font-weight: 600;
  color: var(--text-primary);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.approved {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.verification-details {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.rejection-reason {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  font-size: 13px;
  color: #ef4444;
}
</style>

