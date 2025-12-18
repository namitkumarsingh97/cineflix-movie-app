import apiClient from "../plugins/axios";

export const paymentVerificationApi = {
	// Upload payment screenshot
	uploadScreenshot: async (formData) => {
		try {
			const response = await apiClient.post(
				"/payment-verification/upload",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);
			return response.data;
		} catch (error) {
			console.error("Error uploading payment screenshot:", error);
			throw error;
		}
	},

	// Get user's payment verifications
	getMyVerifications: async () => {
		try {
			const response = await apiClient.get(
				"/payment-verification/my-verifications",
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching payment verifications:", error);
			throw error;
		}
	},

	// Admin: Get pending verifications
	getPendingVerifications: async () => {
		try {
			const response = await apiClient.get("/payment-verification/pending");
			return response.data;
		} catch (error) {
			console.error("Error fetching pending verifications:", error);
			throw error;
		}
	},

	// Admin: Approve verification
	approveVerification: async (verificationId, notes) => {
		try {
			const response = await apiClient.post(
				`/payment-verification/${verificationId}/approve`,
				{ notes },
			);
			return response.data;
		} catch (error) {
			console.error("Error approving verification:", error);
			throw error;
		}
	},

	// Admin: Reject verification
	rejectVerification: async (verificationId, rejectionReason, notes) => {
		try {
			const response = await apiClient.post(
				`/payment-verification/${verificationId}/reject`,
				{
					rejectionReason,
					notes,
				},
			);
			return response.data;
		} catch (error) {
			console.error("Error rejecting verification:", error);
			throw error;
		}
	},
};
