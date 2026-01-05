// Eporner API v2 integration
const EPORNER_API_BASE = "https://www.eporner.com/api/v2";

/**
 * Eporner API service
 * Documentation: https://www.eporner.com/api/v2/
 */
export const epornerApi = {
	/**
	 * Search videos
	 * @param {Object} params - Search parameters
	 * @param {string} params.query - Search query (default: 'all')
	 * @param {number} params.per_page - Results per page (1-1000, default: 30)
	 * @param {number} params.page - Page number (default: 1)
	 * @param {string} params.thumbsize - Thumbnail size: 'small', 'medium', 'big' (default: 'medium')
	 * @param {string} params.order - Sort order: 'latest', 'longest', 'shortest', 'top-rated', 'most-popular', 'top-weekly', 'top-monthly' (default: 'latest')
	 * @param {number} params.gay - Include gay content: 0=no, 1=yes, 2=only (default: 0)
	 * @param {number} params.lq - Include low quality: 0=no, 1=yes, 2=only (default: 1)
	 * @param {string} params.format - Response format: 'json', 'xml' (default: 'json')
	 */
	search: async (params = {}) => {
		const {
			query = "all",
			per_page = 30,
			page = 1,
			thumbsize = "big",
			order = "latest",
			gay = 0,
			lq = 1,
			format = "json",
		} = params;

		const queryParams = new URLSearchParams({
			query: query.toString(),
			per_page: per_page.toString(),
			page: page.toString(),
			thumbsize,
			order,
			gay: gay.toString(),
			lq: lq.toString(),
			format,
		});

		const url = `${EPORNER_API_BASE}/video/search/?${queryParams.toString()}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			// Suppress console errors for expected failures (CORS, rate limiting, network issues)
			const isExpectedError =
				error?.message?.includes("Failed to fetch") ||
				error?.message?.includes("CORS") ||
				error?.message?.includes("503") ||
				error?.message?.includes("NetworkError") ||
				error?.message?.includes("Service Unavailable") ||
				error?.name === "TypeError";

			if (!isExpectedError) {
				console.error("Eporner API search error:", error);
			}
			throw error;
		}
	},

	/**
	 * Get video by ID
	 * @param {string} id - Video ID
	 * @param {string} thumbsize - Thumbnail size: 'small', 'medium', 'big' (default: 'medium')
	 * @param {string} format - Response format: 'json', 'xml' (default: 'json')
	 */
	getById: async (id, thumbsize = "big", format = "json") => {
		if (!id) {
			throw new Error("Video ID is required");
		}

		const queryParams = new URLSearchParams({
			id: id.toString(),
			thumbsize,
			format,
		});

		const url = `${EPORNER_API_BASE}/video/id/?${queryParams.toString()}`;

		try {
			console.log("Fetching Eporner video from:", url);
			const response = await fetch(url);

			if (!response.ok) {
				console.error(`Eporner API HTTP error! status: ${response.status}`);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Eporner API raw response:", data);

			// API returns array, get first item or empty object
			// According to docs, empty response is [] for removed videos
			if (Array.isArray(data)) {
				if (data.length > 0) {
					return data[0];
				} else {
					console.warn(
						"Eporner API returned empty array - video may be removed",
					);
					return null;
				}
			} else if (data && typeof data === "object") {
				// Sometimes API might return object directly
				return data;
			}

			return null;
		} catch (error) {
			// Suppress console errors for expected failures (CORS, rate limiting, network issues)
			const isExpectedError =
				error?.message?.includes("Failed to fetch") ||
				error?.message?.includes("CORS") ||
				error?.message?.includes("503") ||
				error?.message?.includes("NetworkError") ||
				error?.message?.includes("Service Unavailable") ||
				error?.name === "TypeError";

			if (!isExpectedError) {
				console.error("Eporner API getById error:", error);
			}
			throw error;
		}
	},

	/**
	 * Get removed video IDs
	 * @param {string} format - Response format: 'json', 'xml', 'txt' (default: 'json')
	 */
	getRemoved: async (format = "json") => {
		const queryParams = new URLSearchParams({ format });
		const url = `${EPORNER_API_BASE}/video/removed/?${queryParams.toString()}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Eporner API getRemoved error:", error);
			throw error;
		}
	},
};
