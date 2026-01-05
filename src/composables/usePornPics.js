import { computed, ref } from "vue";
import { pornpicsApi } from "../api/pornpics";

/**
 * Composable for PornPics API integration
 */
export function usePornPics() {
	const pictures = ref([]);
	const loading = ref(false);
	const error = ref(null);
	const currentPage = ref(1);
	const perPage = ref(99);
	const totalPages = ref(1);
	const totalCount = ref(0);
	const searchQuery = ref("");
	const queryCache = new Map();
	const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

	/**
	 * Transform PornPics image to app format
	 */
	const transformPicture = (pornpicsImage) => {
		if (!pornpicsImage) return null;

		return {
			id: pornpicsImage.id || pornpicsImage._id,
			title: pornpicsImage.title || pornpicsImage.name || "Untitled",
			description: pornpicsImage.description || pornpicsImage.caption || "",
			thumbnail:
				pornpicsImage.thumbnail || pornpicsImage.thumb || pornpicsImage.url,
			imageUrl:
				pornpicsImage.url || pornpicsImage.imageUrl || pornpicsImage.src,
			imageDir: pornpicsImage.imageDir || "dataset/",
			views: pornpicsImage.views || 0,
			likes: pornpicsImage.likes || 0,
			rating: parseFloat(pornpicsImage.rating) || 0,
			tags: pornpicsImage.tags || pornpicsImage.categories || [],
			added:
				pornpicsImage.added || pornpicsImage.createdAt || pornpicsImage.date,
			// Additional metadata
			_source: "pornpics",
			_raw: pornpicsImage,
		};
	};

	const buildQueryCacheKey = (params) => {
		return [params.query || "popular", params.page, params.limit].join("|");
	};

	const cacheResult = (key, payload) => {
		queryCache.set(key, {
			ts: Date.now(),
			payload,
		});
	};

	const getCachedResult = (key) => {
		const cached = queryCache.get(key);
		if (!cached) return null;
		if (Date.now() - cached.ts > CACHE_TTL_MS) {
			queryCache.delete(key);
			return null;
		}
		return cached.payload;
	};

	/**
	 * Get popular pictures
	 */
	const getPopularPictures = async (page = 1, options = {}) => {
		loading.value = true;
		error.value = null;

		try {
			const limit = options.limit || perPage.value;
			const params = {
				page: page || 1,
				limit,
			};

			const cacheKey = buildQueryCacheKey({ query: "popular", ...params });
			const cached = getCachedResult(cacheKey);
			if (cached) {
				pictures.value = cached.pictures;
				currentPage.value = cached.page;
				totalCount.value = cached.totalCount;
				totalPages.value = cached.totalPages;
				loading.value = false;
				return;
			}

			const response = await pornpicsApi.getPopular(params);

			if (
				response &&
				(response.pictures || response.data || Array.isArray(response))
			) {
				const picturesData = response.pictures || response.data || response;
				pictures.value = picturesData
					.map(transformPicture)
					.filter((p) => p !== null);
				currentPage.value = response.page || page;
				totalCount.value =
					response.total_count || response.totalCount || pictures.value.length;
				searchQuery.value = "";

				// Calculate total pages
				const calculatedPages =
					totalCount.value > 0 ? Math.ceil(totalCount.value / limit) : 1;
				totalPages.value = response.total_pages || calculatedPages;

				cacheResult(cacheKey, {
					pictures: [...pictures.value],
					page: currentPage.value,
					totalPages: totalPages.value,
					totalCount: totalCount.value,
				});
			} else {
				pictures.value = [];
				totalPages.value = 1;
				totalCount.value = 0;
			}
		} catch (err) {
			console.error("Error fetching popular pictures:", err);
			error.value = err.message || "Failed to fetch pictures";
			pictures.value = [];
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Search pictures
	 */
	const searchPictures = async (query = "", page = 1, options = {}) => {
		loading.value = true;
		error.value = null;

		try {
			const limit = options.limit || perPage.value;
			const params = {
				query: query || "",
				page: page || 1,
				limit,
			};

			const cacheKey = buildQueryCacheKey(params);
			const cached = getCachedResult(cacheKey);
			if (cached) {
				pictures.value = cached.pictures;
				currentPage.value = cached.page;
				totalCount.value = cached.totalCount;
				totalPages.value = cached.totalPages;
				searchQuery.value = query;
				loading.value = false;
				return;
			}

			const response = await pornpicsApi.search(params);

			if (
				response &&
				(response.pictures || response.data || Array.isArray(response))
			) {
				const picturesData = response.pictures || response.data || response;
				pictures.value = picturesData
					.map(transformPicture)
					.filter((p) => p !== null);
				currentPage.value = response.page || page;
				totalCount.value =
					response.total_count || response.totalCount || pictures.value.length;
				searchQuery.value = query;

				// Calculate total pages
				const calculatedPages =
					totalCount.value > 0 ? Math.ceil(totalCount.value / limit) : 1;
				totalPages.value = response.total_pages || calculatedPages;

				cacheResult(cacheKey, {
					pictures: [...pictures.value],
					page: currentPage.value,
					totalPages: totalPages.value,
					totalCount: totalCount.value,
				});
			} else {
				pictures.value = [];
				totalPages.value = 1;
				totalCount.value = 0;
			}
		} catch (err) {
			console.error("Error searching pictures:", err);
			error.value = err.message || "Failed to search pictures";
			pictures.value = [];
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Load pictures (default: popular)
	 */
	const loadPictures = async (page = 1) => {
		await getPopularPictures(page);
	};

	/**
	 * Set items per page
	 */
	const setPerPage = (count) => {
		perPage.value = Math.max(1, Math.min(100, count));
	};

	return {
		pictures: computed(() => pictures.value),
		loading: computed(() => loading.value),
		error: computed(() => error.value),
		currentPage: computed(() => currentPage.value),
		totalPages: computed(() => totalPages.value),
		totalCount: computed(() => totalCount.value),
		searchQuery: computed(() => searchQuery.value),
		perPage: computed(() => perPage.value),
		getPopularPictures,
		searchPictures,
		loadPictures,
		setPerPage,
	};
}
