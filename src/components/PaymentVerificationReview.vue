<template>
  <div class="payment-verification-review">
    <div class="review-header">
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">Pending</span>
          <span class="stat-value pending">{{ pendingCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ verifications.length }}</span>
        </div>
      </div>
      <button class="refresh-btn" @click="loadVerifications" :disabled="loading">
        <RefreshCw :size="18" :class="{ spinner: loading }" />
        <span>Refresh</span>
      </button>
    </div>

    <div v-if="loading && verifications.length === 0" class="loading-state">
      <Loader2 :size="32" class="spinner" />
      <span>Loading pending payments...</span>
    </div>

    <div v-else-if="verifications.length === 0" class="empty-state">
      <CheckCircle :size="48" />
      <h3>No Pending Payments</h3>
      <p>All payment verifications have been reviewed.</p>
    </div>

    <div v-else class="verifications-list">
      <div
        v-for="verification in verifications"
        :key="verification._id"
        class="verification-card"
      >
        <div class="card-header">
          <div class="user-info">
            <div class="user-avatar">
              <User :size="24" />
            </div>
            <div class="user-details">
              <h3 class="user-name">{{ verification.userName || 'Unknown User' }}</h3>
              <p class="user-email">{{ verification.userEmail || 'N/A' }}</p>
              <p class="user-id">User ID: {{ verification.userId }}</p>
            </div>
          </div>
          <div class="verification-meta">
            <span class="verification-date">
              Submitted: {{ formatDate(verification.createdAt) }}
            </span>
            <span class="verification-id">ID: {{ verification._id.slice(-8) }}</span>
          </div>
        </div>

        <div class="card-content">
          <div class="payment-details">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Plan</span>
                <span class="detail-value">{{ formatPlanType(verification.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Amount</span>
                <span class="detail-value">₹{{ verification.amount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Plan ID</span>
                <span class="detail-value">{{ verification.planId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="status-badge pending">{{ verification.status }}</span>
              </div>
            </div>
          </div>

          <div class="screenshot-section">
            <h4 class="section-title">
              <Image :size="18" />
              Payment Screenshot
            </h4>
            <div class="screenshot-container">
              <img
                v-if="isImage(verification.paymentScreenshot)"
                :src="getImageUrl(verification.paymentScreenshot)"
                :alt="'Payment screenshot for ' + verification.userName"
                class="screenshot-image"
                @click="openImageModal(verification.paymentScreenshot)"
              />
              <div v-else class="screenshot-pdf">
                <FileText :size="48" />
                <a
                  :href="getImageUrl(verification.paymentScreenshot)"
                  target="_blank"
                  class="pdf-link"
                >
                  View PDF
                </a>
              </div>
            </div>
          </div>

          <div class="action-section">
          <div class="action-inputs">
            <div class="input-group">
              <label for="notes">Admin Notes (Optional)</label>
              <textarea
                :id="`notes-${verification._id}`"
                v-model="verification.notes"
                placeholder="Add any notes about this verification..."
                rows="2"
              ></textarea>
            </div>
          </div>
            <div class="action-buttons">
              <button
                class="action-btn approve-btn"
                @click="handleApprove(verification)"
                :disabled="processing[verification._id]"
              >
                <CheckCircle :size="18" />
                <span>{{ processing[verification._id] ? 'Approving...' : 'Approve' }}</span>
              </button>
              <button
                class="action-btn reject-btn"
                @click="showRejectModal(verification)"
                :disabled="processing[verification._id]"
              >
                <XCircle :size="18" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectDialog" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Reject Payment Verification</h3>
          <button class="close-btn" @click="closeRejectModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-warning">
            <AlertTriangle :size="20" />
            Please provide a reason for rejection. This will be shown to the user.
          </p>
          <div class="input-group">
            <label for="rejection-reason">Rejection Reason *</label>
            <textarea
              id="rejection-reason"
              v-model="rejectionForm.reason"
              placeholder="e.g., Payment screenshot is unclear, Amount mismatch, etc."
              rows="4"
              required
            ></textarea>
          </div>
          <div class="input-group">
            <label for="rejection-notes">Admin Notes (Optional)</label>
            <textarea
              id="rejection-notes"
              v-model="rejectionForm.notes"
              placeholder="Internal notes (not shown to user)..."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeRejectModal">Cancel</button>
          <button
            class="btn-reject"
            @click="handleReject"
            :disabled="!rejectionForm.reason || processing[selectedVerification?._id]"
          >
            <XCircle :size="18" />
            <span>Reject Payment</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button class="image-close-btn" @click="closeImageModal">
          <X :size="24" />
        </button>
        <img :src="modalImageUrl" alt="Payment screenshot" class="modal-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
	AlertTriangle,
	CheckCircle,
	FileText,
	Image,
	Loader2,
	RefreshCw,
	User,
	X,
	XCircle,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { paymentVerificationApi } from "../api/paymentVerification";
import apiClient from "../plugins/axios";

const verifications = ref([]);
const loading = ref(false);
const processing = ref({});
const showRejectDialog = ref(false);
const selectedVerification = ref(null);
const rejectionForm = ref({
	reason: "",
	notes: "",
});
const showImageModal = ref(false);
const modalImageUrl = ref("");

const pendingCount = computed(() => {
	return verifications.value.filter((v) => v.status === "pending").length;
});

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
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getImageUrl(path) {
	if (!path) return "";
	// If it's already a data URL (base64), return as is
	if (path.startsWith("data:")) return path;
	// If it's already a full URL, return as is
	if (path.startsWith("http")) return path;
	// If it's an API endpoint URL, return as is
	if (
		path.includes("/api/payment-verification/") &&
		path.includes("/screenshot")
	)
		return path;
	// Otherwise, construct the API endpoint URL
	const baseUrl = import.meta.env.DEV
		? "http://localhost:5000"
		: import.meta.env.VITE_API_URL || "http://localhost:5000";
	// Extract verification ID from path if it's a file path, or use the verification ID
	// For now, if it's a relative path, we'll need the verification ID
	// This will be handled by the parent component passing the full URL
	return `${baseUrl}${path}`;
}

function isImage(path) {
	if (!path) return false;
	// Check if it's a base64 data URL (image)
	if (path.startsWith("data:image/")) return true;
	// Check if it's an API endpoint (assume images unless PDF)
	if (path.includes("/screenshot") && !path.includes(".pdf")) return true;
	// Check file extension
	const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
	return imageExtensions.some((ext) => path.toLowerCase().includes(ext));
}

function openImageModal(imageUrl) {
	modalImageUrl.value = getImageUrl(imageUrl);
	showImageModal.value = true;
}

function closeImageModal() {
	showImageModal.value = false;
	modalImageUrl.value = "";
}

async function loadVerifications() {
	loading.value = true;
	try {
		const response = await paymentVerificationApi.getPendingVerifications();
		if (response.success) {
			verifications.value = response.verifications || [];
			// Initialize notes for each verification
			verifications.value.forEach((v) => {
				if (!v.notes) {
					v.notes = "";
				}
			});
		}
	} catch (error) {
		console.error("Error loading verifications:", error);
		alert("Failed to load pending payments. Please try again.");
	} finally {
		loading.value = false;
	}
}

async function handleApprove(verification) {
	if (!confirm(`Approve payment verification for ${verification.userName}?`)) {
		return;
	}

	processing.value[verification._id] = true;

	try {
		const notes = verification.notes || "";
		const response = await paymentVerificationApi.approveVerification(
			verification._id,
			notes,
		);

		if (response.success) {
			alert(
				`✅ Payment approved! Subscription activated for ${verification.userName}.`,
			);
			await loadVerifications();
		} else {
			alert(response.error || "Failed to approve payment");
		}
	} catch (error) {
		console.error("Error approving verification:", error);
		alert(
			error.response?.data?.error ||
				"Failed to approve payment. Please try again.",
		);
	} finally {
		processing.value[verification._id] = false;
	}
}

function showRejectModal(verification) {
	selectedVerification.value = verification;
	rejectionForm.value = {
		reason: "",
		notes: verification.notes || "",
	};
	showRejectDialog.value = true;
}

function closeRejectModal() {
	showRejectDialog.value = false;
	selectedVerification.value = null;
	rejectionForm.value = {
		reason: "",
		notes: "",
	};
}

async function handleReject() {
	if (!rejectionForm.value.reason.trim()) {
		alert("Please provide a rejection reason");
		return;
	}

	if (!selectedVerification.value) return;

	processing.value[selectedVerification.value._id] = true;

	try {
		const response = await paymentVerificationApi.rejectVerification(
			selectedVerification.value._id,
			rejectionForm.value.reason,
			rejectionForm.value.notes,
		);

		if (response.success) {
			alert(
				`Payment verification rejected for ${selectedVerification.value.userName}.`,
			);
			closeRejectModal();
			await loadVerifications();
		} else {
			alert(response.error || "Failed to reject payment");
		}
	} catch (error) {
		console.error("Error rejecting verification:", error);
		alert(
			error.response?.data?.error ||
				"Failed to reject payment. Please try again.",
		);
	} finally {
		processing.value[selectedVerification.value._id] = false;
	}
}

onMounted(() => {
	loadVerifications();
});
</script>

<style scoped>
.payment-verification-review {
  padding: 24px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.pending {
  color: #ffc107;
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--dark-lighter);
  border-color: var(--primary);
}

.refresh-btn:disabled {
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

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: var(--text-primary);
}

.verifications-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.verification-card {
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.verification-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: var(--dark);
  border-bottom: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.user-id {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: monospace;
  margin: 0;
}

.verification-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  text-align: right;
}

.verification-date {
  font-size: 13px;
  color: var(--text-secondary);
}

.verification-id {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: monospace;
}

.card-content {
  padding: 24px;
}

.payment-details {
  margin-bottom: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.status-badge {
  display: inline-block;
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

.screenshot-section {
  margin-bottom: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.screenshot-container {
  background: var(--dark);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.screenshot-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.screenshot-image:hover {
  transform: scale(1.05);
}

.screenshot-pdf {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.pdf-link {
  padding: 8px 16px;
  background: var(--gradient-primary);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pdf-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.action-section {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.action-inputs {
  margin-bottom: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.input-group textarea {
  padding: 12px;
  background: var(--dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.input-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.approve-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.approve-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.reject-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.reject-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
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

.modal-content {
  background: var(--dark-lighter);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.modal-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  color: #ffc107;
  margin-bottom: 20px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.btn-cancel,
.btn-reject {
  padding: 10px 20px;
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

.btn-cancel {
  background: var(--dark-light);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  background: var(--dark-lighter);
}

.btn-reject {
  background: #ef4444;
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-reject:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Image Modal */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 16px;
  }

  .verification-meta {
    align-items: flex-start;
    text-align: left;
  }

  .action-buttons {
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

