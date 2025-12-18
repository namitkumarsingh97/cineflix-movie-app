import { computed, ref } from "vue";
import { subscriptionApi } from "../api/subscription";

const PREMIUM_KEY = "cineflix_premium_status";
const SUBSCRIPTION_KEY = "cineflix_subscription";

/**
 * Composable for managing premium subscriptions
 */
export function useSubscription() {
	const isPremium = ref(false);
	const subscription = ref(null);
	const loading = ref(false);

	/**
	 * Check if user has premium access
	 */
	async function checkPremiumStatus() {
		try {
			loading.value = true;

			// Check localStorage first
			const storedStatus = localStorage.getItem(PREMIUM_KEY);
			const storedSubscription = localStorage.getItem(SUBSCRIPTION_KEY);

			if (storedStatus === "true" && storedSubscription) {
				const sub = JSON.parse(storedSubscription);
				// Check if subscription is still valid
				if (sub.expiresAt && new Date(sub.expiresAt) > new Date()) {
					isPremium.value = true;
					subscription.value = sub;
					loading.value = false;
					return;
				} else if (sub.type === "lifetime") {
					isPremium.value = true;
					subscription.value = sub;
					loading.value = false;
					return;
				}
			}

			// Check with backend API
			try {
				const response = await subscriptionApi.getStatus();
				console.log("Subscription status response:", response);

				// Check if subscription exists (even if isPremium is false, subscription might exist)
				if (response && response.success) {
					if (
						response.subscription &&
						response.subscription.status === "active"
					) {
						// Active subscription found
						isPremium.value = true;
						subscription.value = response.subscription;
						localStorage.setItem(PREMIUM_KEY, "true");
						localStorage.setItem(
							SUBSCRIPTION_KEY,
							JSON.stringify(response.subscription),
						);
						console.log("✅ Premium status updated:", {
							isPremium: isPremium.value,
							subscription: subscription.value,
						});
					} else if (response.isPremium && response.subscription) {
						// Fallback: if isPremium is true and subscription exists
						isPremium.value = true;
						subscription.value = response.subscription;
						localStorage.setItem(PREMIUM_KEY, "true");
						localStorage.setItem(
							SUBSCRIPTION_KEY,
							JSON.stringify(response.subscription),
						);
						console.log("✅ Premium status updated (fallback):", {
							isPremium: isPremium.value,
							subscription: subscription.value,
						});
					} else {
						// No active subscription
						isPremium.value = false;
						subscription.value = null;
						localStorage.setItem(PREMIUM_KEY, "false");
						localStorage.removeItem(SUBSCRIPTION_KEY);
						console.log("❌ No active subscription found");
					}
				} else {
					isPremium.value = false;
					subscription.value = null;
					localStorage.setItem(PREMIUM_KEY, "false");
					localStorage.removeItem(SUBSCRIPTION_KEY);
					console.log("❌ Invalid response format");
				}
			} catch (error) {
				// If API fails, use localStorage as fallback
				console.warn("Failed to check premium status from API:", error);
				isPremium.value = storedStatus === "true";
				if (storedSubscription) {
					try {
						subscription.value = JSON.parse(storedSubscription);
					} catch (e) {
						subscription.value = null;
					}
				}
			}
		} catch (error) {
			console.error("Error checking premium status:", error);
			isPremium.value = false;
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Process payment and activate premium
	 */
	async function processPayment(paymentData) {
		try {
			loading.value = true;

			// If using Stripe, handle payment intent flow
			if (
				paymentData.paymentMethod === "stripe" ||
				paymentData.paymentMethod === "card"
			) {
				// First, create payment intent
				const createResponse = await subscriptionApi.createSubscription({
					planId: paymentData.planId,
					type:
						paymentData.planId === "lifetime"
							? "lifetime"
							: paymentData.planId === "yearly"
								? "yearly"
								: "monthly",
					amount: paymentData.amount,
					paymentMethod: "stripe",
				});

				// If payment intent is required, return it for frontend confirmation
				if (createResponse.requiresPayment && createResponse.clientSecret) {
					return {
						requiresPayment: true,
						clientSecret: createResponse.clientSecret,
						paymentIntentId: createResponse.paymentIntentId,
					};
				}
			}

			// For UPI payments, allow manual verification
			if (paymentData.paymentMethod === "upi" && paymentData.verified) {
				// UPI payment manually verified
				const subscriptionData = {
					planId: paymentData.planId,
					type:
						paymentData.planId === "lifetime"
							? "lifetime"
							: paymentData.planId === "yearly"
								? "yearly"
								: "monthly",
					startDate: new Date().toISOString(),
					expiresAt:
						paymentData.planId === "lifetime"
							? null
							: paymentData.planId === "yearly"
								? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
								: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
					amount: paymentData.amount,
					paymentMethod: "upi",
				};

				// Save to backend
				try {
					await subscriptionApi.createSubscription(subscriptionData);
				} catch (error) {
					console.warn("Failed to save subscription to backend:", error);
				}

				// Save to localStorage
				isPremium.value = true;
				subscription.value = subscriptionData;
				localStorage.setItem(PREMIUM_KEY, "true");
				localStorage.setItem(
					SUBSCRIPTION_KEY,
					JSON.stringify(subscriptionData),
				);

				return true;
			}

			// Mock payment processing (fallback if Stripe not configured)
			const mockPaymentSuccess = true; // In production, this would be actual payment processing

			if (mockPaymentSuccess) {
				// Create subscription object
				const subscriptionData = {
					planId: paymentData.planId,
					type:
						paymentData.planId === "lifetime"
							? "lifetime"
							: paymentData.planId === "yearly"
								? "yearly"
								: "monthly",
					startDate: new Date().toISOString(),
					expiresAt:
						paymentData.planId === "lifetime"
							? null
							: paymentData.planId === "yearly"
								? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
								: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
					amount: paymentData.amount,
					paymentMethod: paymentData.paymentMethod,
				};

				// Save to backend
				try {
					await subscriptionApi.createSubscription(subscriptionData);
				} catch (error) {
					console.warn("Failed to save subscription to backend:", error);
					// Continue with local storage as fallback
				}

				// Save to localStorage
				isPremium.value = true;
				subscription.value = subscriptionData;
				localStorage.setItem(PREMIUM_KEY, "true");
				localStorage.setItem(
					SUBSCRIPTION_KEY,
					JSON.stringify(subscriptionData),
				);

				return true;
			}

			return false;
		} catch (error) {
			console.error("Error processing payment:", error);
			throw error;
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Cancel subscription
	 */
	async function cancelSubscription() {
		try {
			loading.value = true;

			// Cancel on backend
			try {
				await subscriptionApi.cancelSubscription();
			} catch (error) {
				console.warn("Failed to cancel subscription on backend:", error);
			}

			// Remove from localStorage
			isPremium.value = false;
			subscription.value = null;
			localStorage.setItem(PREMIUM_KEY, "false");
			localStorage.removeItem(SUBSCRIPTION_KEY);

			return true;
		} catch (error) {
			console.error("Error canceling subscription:", error);
			throw error;
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Initialize premium status on mount
	 */
	function init() {
		checkPremiumStatus();
	}

	return {
		isPremium: computed(() => isPremium.value),
		subscription: computed(() => subscription.value),
		loading: computed(() => loading.value),
		checkPremiumStatus,
		processPayment,
		cancelSubscription,
		init,
	};
}
