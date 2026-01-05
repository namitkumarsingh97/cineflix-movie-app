import { computed, ref } from "vue";
import { epornerApi } from "../api/eporner";
import { moviesApi } from "../api/movies";
import { videosApi } from "../api/videos";

/**
 * Known female adult actresses database
 * This helps filter out male actors and identify actresses correctly
 */
const KNOWN_ACTRESSES = new Set([
	// A
	"Abella Danger",
	"AJ Applegate",
	"Aaliyah Hadid",
	"Aaliyah Love",
	"Abigaile Johnson",
	"Adira Allure",
	"Adria Rae",
	"Adriana Chechik",
	"Aletta Ocean",
	"Alex Blake",
	"Alex Chance",
	"Alex Coal",
	"Alex De La Flor",
	"Alex Gonz",
	"Alex Grey",
	"Alex Harper",
	"Alex Jett",
	"Alex Jones",
	"Alex Legend",
	"Alex Lynn",
	"Alex Mack",
	"Alex Moreno",
	"Alex Tanner",
	"Alex Victor",
	"Alexa Flexy",
	"Alexa Grace",
	"Anna Katz",
	"Angela White",
	"Anissa Kate",
	"Anya Olsen",
	"Ariana Marie",
	"Aria Alexander",
	"Ariella Ferrera",
	"Ashley Adams",
	"Ashley Fires",
	"Ashley Lane",
	"Aubrey Gold",
	"Ava Addams",
	"Ava Taylor",
	// B
	"Bella Rolland",
	"Bella Rose",
	"Brenna Sparks",
	"Brianna Beach",
	"Bridgette B",
	"Britney Amber",
	"Brooklyn Chase",
	"Bunny Colby",
	// C
	"Cadey Mercury",
	"Candice Dare",
	"Capri Cavanni",
	"Casey Calvert",
	"Cassidy Banks",
	"Chanel Preston",
	"Charity Crawford",
	"Chloe Amour",
	"Chloe Cherry",
	"Chloe Foster",
	"Chloe Scott",
	"Chloe Surreal",
	"Christy White",
	"Codi Vore",
	"Cory Chase",
	"Crystal Rush",
	// D
	"Dani Daniels",
	"Dana DeArmond",
	"Dana Vespoli",
	"Dani Jensen",
	"Daniella Schiffer",
	"Darcie Dolce",
	"Dava Foxx",
	"Daya Knight",
	"Dee Williams",
	"Diamond Jackson",
	"Dillion Harper",
	"Dolly Little",
	// E
	"Eden Ivy",
	"Elena Koshka",
	"Eliza Ibarra",
	"Ella Hughes",
	"Ella Knox",
	"Emily Willis",
	"Emma Hix",
	"Eva Lovia",
	"Eva Notty",
	"Evelyn Claire",
	// F
	"Faye Reagan",
	"Felicity Feline",
	"Fiona Cooper",
	// G
	"Gabbie Carter",
	"Gia Derza",
	"Gianna Dior",
	"Gina Valentina",
	"Giselle Palmer",
	"Gracie May Green",
	"Gwen Stark",
	// H
	"Haley Reed",
	"Harmony Wonder",
	"Hazel Moore",
	"Heather Starlet",
	"Hitomi Tanaka",
	"Holly Hendrix",
	"Holly Michaels",
	"Honey Gold",
	// I
	"Ivy Lebelle",
	"Ivy Wolfe",
	// J
	"Jade Kush",
	"Jade Nile",
	"Jasmine Jae",
	"Jenna Sativa",
	"Jenna Starr",
	"Jessa Rhodes",
	"Jillian Janson",
	"Jillian Jacobs",
	"Joanna Angel",
	"Jordi El Nino Polla",
	"Jordyn Woodland",
	"Joseline Kelly",
	"Juelz Ventura",
	"Julia Ann",
	"Julia De Lucia",
	"Jynx Maze",
	// K
	"Kali Roses",
	"Karla Kush",
	"Karlee Grey",
	"Karma Rx",
	"Kasey Warner",
	"Kat Dior",
	"Katalina Kyle",
	"Kate England",
	"Katie Kush",
	"Kendra Lust",
	"Kendra Spade",
	"Kenzie Reeves",
	"Khloe Kapri",
	"Kimmy Granger",
	"Kira Noir",
	"Kissa Sins",
	"Kylie Page",
	"Kylie Quinn",
	// L
	"Lana Rhoades",
	"Lana Roy",
	"Layla London",
	"Leah Gotti",
	"Lena Paul",
	"Lexi Belle",
	"Lexi Luna",
	"Lily Adams",
	"Lily Cade",
	"Lily Larimar",
	"Lily Rader",
	"Lina Luxa",
	"Little Caprice",
	"Liya Silver",
	"Lola Fae",
	"Luna Star",
	// M
	"Maddy O'Reilly",
	"Maddy May",
	"Maddy Rose",
	"Maitland Ward",
	"Mandy Muse",
	"Marley Brinx",
	"Maya Bijou",
	"Maya Kendrick",
	"Megan Rain",
	"Melissa Moore",
	"Mia Khalifa",
	"Mia Malkova",
	"Mia Melano",
	"Mia Monroe",
	"Mia Sol",
	"Mila Azul",
	"Mila Monet",
	"Mischa Brooks",
	"Monique Alexander",
	"Monroe Foxx",
	// N
	"Naomi Swann",
	"Natasha Nice",
	"Natalia Starr",
	"Natalie Mars",
	"Nikki Benz",
	"Nina Elle",
	"Nina North",
	"Nina Skyy",
	// O
	"Olivia Austin",
	"Olivia Nova",
	// P
	"Paige Owens",
	"Paisley Paige",
	"Penny Pax",
	"Phoenix Marie",
	"Piper Perri",
	"Pristine Edge",
	"Puma Swede",
	// R
	"Rachel Starr",
	"Rae Lil Black",
	"Rebecca More",
	"Remy Lacroix",
	"Riley Reid",
	"Riley Star",
	"Romi Rain",
	"Rosalyn Sphinx",
	"Roxy Raye",
	"Ryan Ryans",
	// S
	"Sara Jay",
	"Sara Luvv",
	"Sarah Banks",
	"Sarah Vandella",
	"Scarlet Chase",
	"Scarlet Red",
	"Scarlit Scandal",
	"Sera Ryder",
	"Shae Summers",
	"Sharon Lee",
	"Shyla Jennings",
	"Sierra Skye",
	"Skylar Snow",
	"Sloan Harper",
	"Sophia Leone",
	"Sophia Traxler",
	"Stella Cox",
	"Stella May",
	"Stephanie West",
	"Summer Brielle",
	"Syren De Mer",
	// T
	"Tara Ashley",
	"Tasha Reign",
	"Tegan Presley",
	"Tiffany Tatum",
	"Tori Black",
	"Tru Kait",
	"Tyler Nixon",
	// V
	"Valentina Nappi",
	"Valentina Ricci",
	"Vanessa Cage",
	"Veronica Avluv",
	"Veronica Rodriguez",
	"Vicki Chase",
	"Victoria June",
	"Victoria Voxxx",
	"Vina Sky",
	"Violet Myers",
	"Violet Starr",
	// W
	"Whitney Wright",
	"Willow Hayes",
	// Y
	"Yhivi",
	"Yurizan Beltran",
	// Z
	"Zoe Bloom",
	"Zoe Parker",
	"Zoe Voss",
]);

/**
 * Common male actor names to filter out
 */
const MALE_ACTORS = new Set([
	"Johnny Sins",
	"Manuel Ferrara",
	"Mick Blue",
	"James Deen",
	"Keiran Lee",
	"Danny D",
	"Rocco Siffredi",
	"Evan Stone",
	"Tommy Gunn",
	"Mark Wood",
	"Chris Strokes",
	"Xander Corvus",
	"Bruce Venture",
	"Ramon Nomar",
	"Tony T",
	"Steve Holmes",
	"Erik Everhard",
	"Marcus London",
	"John Strong",
	"Bill Bailey",
]);

/**
 * Common non-name words/phrases to filter out (categories, tags, etc.)
 */
const NON_NAME_WORDS = new Set([
	"an aphrodisiac",
	"aphrodisiac",
	"amateur",
	"anal",
	"asian",
	"ass",
	"big tits",
	"big ass",
	"big white",
	"big cock",
	"blonde",
	"brunette",
	"compilation",
	"creampie",
	"cum",
	"cum load",
	"load",
	"facial",
	"gangbang",
	"hardcore",
	"lesbian",
	"milf",
	"teen",
	"threesome",
	"pov",
	"public",
	"rough",
	"soft",
	"swinger",
	"swingers",
	"group",
	"party",
	"scene",
	"video",
	"videos",
	"movie",
	"movies",
	"film",
	"films",
	"hd",
	"4k",
	"full",
	"part",
	"episode",
	"series",
	"season",
	"collection",
	"best",
	"top",
	"new",
	"latest",
	"popular",
	"trending",
	"hot",
	"sexy",
	"xxx",
	"porn",
	"adult",
	"explicit",
	"nsfw",
	"uncensored",
	"censored",
	"premium",
	"free",
	"download",
	"stream",
	"watch",
	"online",
	"site",
	"channel",
	"studio",
	"production",
	"network",
	"website",
	"platform",
	// Video title words
	"her",
	"my",
	"with",
	"forbidden",
	"awakening",
	"continuous",
	"climax",
	"boss",
	"boyfriend",
	"father",
	"in law",
	"friends",
	"huge",
	"tits",
	"favourite",
	"favorite",
	"lady",
	"sex",
	"sister",
	"care",
	"helper",
	"home",
	"devilish",
	"temptation",
	"mei",
	"washio",
	"asami",
	"ogawa",
	// Indonesian/Asian tags
	"bokep",
	"indo",
	"indonesia",
	"indonesian",
	"tante",
	"hijab",
	"jilbab",
	"montok",
	"diewe",
	"ponakan",
	"janda",
	"mahasiswi",
	"abg",
	"cewek",
	"japan",
	"japanese",
	"china",
	"chinese",
	"korea",
	"korean",
	"thai",
	"thailand",
	"philippines",
	"filipina",
	"vietnam",
	"vietnamese",
]);

/**
 * Common video title patterns that should be rejected
 */
const VIDEO_TITLE_PATTERNS = [
	/^her\s+/i, // "Her Boss", "Her Boyfriend"
	/^my\s+/i, // "My Favourite"
	/\swith\s/i, // "Sex With Sister"
	/^forbidden\s+/i, // "Forbidden Care"
	/^awakening\s+/i, // "Awakening Continuous"
	/^big\s+/i, // "Big White Cock"
	/^cum\s+/i, // "Cum Load"
	/^sex\s+/i, // "Sex With"
	/continuous\s+climax/i, // "Continuous Climax"
	/home\s+helper/i, // "Home Helper"
	/father\s+in\s+law/i, // "Father In Law"
	/huge\s+tits/i, // "Huge Tits"
	/favourite\s+lady/i, // "Favourite Lady"
	/devilish\s+temptation/i, // "Devilish Temptation"
];

/**
 * Check if a string looks like a real person name
 */
function isValidPersonName(name) {
	if (!name || typeof name !== "string") return false;

	const trimmed = name.trim();

	// Must be at least 2 words (first name + last name)
	const words = trimmed.split(/\s+/);
	if (words.length < 2) return false;

	// Should not have too many words (likely a sentence/tag)
	if (words.length > 4) return false;

	// Check against video title patterns first
	for (const pattern of VIDEO_TITLE_PATTERNS) {
		if (pattern.test(trimmed)) return false;
	}

	// Each word should start with capital letter and be reasonable length
	if (!words.every((word) => /^[A-Z][a-z]{1,20}$/.test(word))) return false;

	// Should not contain multiple hyphens (likely a tag like "bokep-indo-tante")
	if ((trimmed.match(/-/g) || []).length > 1) return false;

	// Should not contain common non-name words
	const nameLower = trimmed.toLowerCase();
	for (const nonName of NON_NAME_WORDS) {
		if (nameLower.includes(nonName)) return false;
	}

	// Should not contain special characters (except single hyphen, apostrophes, spaces)
	if (!/^[A-Za-z\s'-]+$/.test(trimmed)) return false;

	// Should not be too short or too long
	if (trimmed.length < 4 || trimmed.length > 50) return false;

	// Should not start with common prefixes that indicate it's not a name
	const lowerName = trimmed.toLowerCase();
	if (
		lowerName.startsWith("/") ||
		lowerName.startsWith("-") ||
		lowerName.startsWith("an ") ||
		lowerName.startsWith("a ") ||
		lowerName.startsWith("the ") ||
		lowerName.startsWith("bokep") ||
		lowerName.startsWith("indonesia") ||
		lowerName.startsWith("indo")
	)
		return false;

	// Should not be all caps (likely a tag/category)
	if (trimmed === trimmed.toUpperCase() && trimmed.length > 5) return false;

	// Should not contain common tag words
	const tagWords = [
		"bokep",
		"indo",
		"indonesia",
		"tante",
		"hijab",
		"montok",
		"diewe",
		"ponakan",
		"jilbab",
		"janda",
		"mahasiswi",
		"abg",
		"japan",
		"japanese",
		"china",
		"chinese",
		"korea",
		"korean",
		"thai",
		"thailand",
		"philippines",
		"filipina",
		"vietnam",
		"compilation",
		"collection",
		"series",
		"episode",
		"part",
		"her",
		"my",
		"with",
		"forbidden",
		"awakening",
		"continuous",
		"climax",
		"boss",
		"boyfriend",
		"father",
		"friends",
		"huge",
		"favourite",
		"favorite",
		"lady",
		"sex",
		"sister",
		"care",
		"helper",
		"home",
		"devilish",
		"temptation",
		"cum",
		"load",
		"big",
		"white",
		"cock",
		"tits",
	];
	const lowerWords = words.map((w) => w.toLowerCase());
	if (tagWords.some((tag) => lowerWords.includes(tag))) return false;

	// Should not be all lowercase (likely a tag)
	if (trimmed === trimmed.toLowerCase() && trimmed.length > 10) return false;

	// Each word should be a reasonable name (2-20 characters, mostly letters)
	if (
		!words.every(
			(word) =>
				word.length >= 2 && word.length <= 20 && /^[A-Za-z]+$/.test(word),
		)
	)
		return false;

	// Reject if it contains common video title words in the middle
	const commonTitleWords = [
		"boss",
		"boyfriend",
		"father",
		"friends",
		"helper",
		"home",
		"lady",
		"sister",
		"care",
		"temptation",
		"climax",
		"awakening",
		"continuous",
		"forbidden",
		"devilish",
		"huge",
		"favourite",
		"favorite",
	];
	const hasTitleWord = lowerWords.some((word) =>
		commonTitleWords.includes(word),
	);
	if (hasTitleWord && words.length > 2) return false; // If it has a title word and more than 2 words, likely a title

	// Reject if it looks like a descriptive phrase (contains "In", "With", "And" as separate words)
	const descriptiveWords = [
		"in",
		"with",
		"and",
		"or",
		"the",
		"a",
		"an",
		"of",
		"for",
	];
	if (lowerWords.some((word) => descriptiveWords.includes(word))) return false;

	return true;
}

/**
 * Extract actress names from video title and keywords
 */
function extractActressNames(video) {
	const names = new Set();

	if (!video) return names;

	// Extract from title
	const title = (video.title || "").toLowerCase();

	// Extract from keywords (can be string or array)
	let keywords = "";
	if (typeof video.keywords === "string") {
		keywords = video.keywords.toLowerCase();
	} else if (Array.isArray(video.keywords)) {
		keywords = video.keywords.join(",").toLowerCase();
	}
	const allKeywords = keywords
		.split(",")
		.map((k) => k.trim())
		.filter((k) => k);

	// Extract from categories (sometimes actresses are listed here)
	const categories = (video.categories || [])
		.map((c) => (typeof c === "string" ? c.toLowerCase() : ""))
		.filter((c) => c);

	// Combine all text sources
	const allText = [title, ...allKeywords, ...categories].join(" ");

	// Check against known actresses
	for (const actress of KNOWN_ACTRESSES) {
		const actressLower = actress.toLowerCase();
		// Check if actress name appears in title or keywords
		// Use word boundaries to avoid partial matches
		const actressWords = actressLower.split(" ");
		const allWordsMatch = actressWords.every(
			(word) =>
				allText.includes(word) ||
				title.includes(word) ||
				keywords.includes(word),
		);

		if (
			allWordsMatch &&
			(title.includes(actressLower) ||
				keywords.includes(actressLower) ||
				allText.includes(actressLower))
		) {
			names.add(actress);
		}
	}

	// Also try to extract names from title patterns
	// Pattern: "Actress Name - Video Title" or "Video Title - Actress Name"
	const titlePatterns = [
		/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*[-–—]\s*/i, // Name at start
		/\s*[-–—]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/i, // Name at end
		/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+in\s+/i, // "Name in..."
		/\s+with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i, // "...with Name"
	];

	for (const pattern of titlePatterns) {
		const match = video.title?.match(pattern);
		if (match && match[1]) {
			const potentialName = match[1].trim();
			// Only add if it's a valid person name and not a male actor
			if (isValidPersonName(potentialName) && !MALE_ACTORS.has(potentialName)) {
				names.add(potentialName);
			}
		}
	}

	// Filter out invalid names from the results
	const validNames = new Set();
	names.forEach((name) => {
		if (isValidPersonName(name) && !MALE_ACTORS.has(name)) {
			validNames.add(name);
		}
	});

	return validNames;
}

/**
 * Composable for managing actresses
 */
export function useActresses() {
	const actresses = ref([]);
	const loading = ref(false);
	const extractedActresses = ref(new Set());

	/**
	 * Extract actresses from Eporner videos
	 */
	async function extractFromEpornerVideos(limit = 500) {
		loading.value = true;
		const actressSet = new Set();

		try {
			// Fetch multiple pages to get more videos
			const pagesToFetch = Math.min(Math.ceil(limit / 30), 20); // Eporner returns ~30 per page, limit to 20 pages

			for (let page = 1; page <= pagesToFetch; page++) {
				try {
					const response = await epornerApi.search({
						query: "all",
						per_page: 30,
						page: page,
						order: "most-popular",
						thumbsize: "big",
						format: "json",
					});

					// Extract actress names from each video
					// Eporner API returns videos array directly or in response.videos
					const videos = response?.videos || response || [];
					if (Array.isArray(videos)) {
						videos.forEach((video) => {
							const names = extractActressNames(video);
							names.forEach((name) => actressSet.add(name));
						});
					}

					// Small delay to avoid rate limiting
					await new Promise((resolve) => setTimeout(resolve, 1000));
				} catch (error) {
					console.warn(`Error fetching page ${page}:`, error);
				}
			}

			extractedActresses.value = actressSet;
			return Array.from(actressSet).sort();
		} catch (error) {
			console.error("Error extracting actresses from Eporner:", error);
			return [];
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Extract actresses from backend videos/movies
	 */
	async function extractFromBackendVideos() {
		const actressSet = new Set();

		try {
			// Fetch movies
			try {
				const response = await moviesApi.getAll();
				const movies = response.data?.data || response.data || [];

				movies.forEach((movie) => {
					// Check stars field
					if (movie.stars && Array.isArray(movie.stars)) {
						movie.stars.forEach((star) => {
							if (star && typeof star === "string") {
								const starName = star.trim();
								if (isValidPersonName(starName) && !MALE_ACTORS.has(starName)) {
									actressSet.add(starName);
								}
							}
						});
					}

					// Also extract from title
					const names = extractActressNames(movie);
					names.forEach((name) => {
						if (isValidPersonName(name)) {
							actressSet.add(name);
						}
					});
				});
			} catch (error) {
				console.warn("Error fetching movies:", error);
			}

			// Fetch videos
			try {
				const response = await videosApi.getAll();
				const videos = response.data?.data || response.data || [];

				videos.forEach((video) => {
					// Check stars field
					if (video.stars && Array.isArray(video.stars)) {
						video.stars.forEach((star) => {
							if (star && typeof star === "string") {
								const starName = star.trim();
								if (isValidPersonName(starName) && !MALE_ACTORS.has(starName)) {
									actressSet.add(starName);
								}
							}
						});
					}

					// Also extract from title
					const names = extractActressNames(video);
					names.forEach((name) => {
						if (isValidPersonName(name)) {
							actressSet.add(name);
						}
					});
				});
			} catch (error) {
				console.warn("Error fetching videos:", error);
			}

			return Array.from(actressSet).sort();
		} catch (error) {
			console.error("Error extracting actresses from backend:", error);
			return [];
		}
	}

	/**
	 * Extract all actresses from all sources
	 */
	async function extractAllActresses() {
		loading.value = true;
		const allActresses = new Set();

		try {
			// Extract from Eporner (limited to avoid too many API calls)
			const epornerActresses = await extractFromEpornerVideos(500);
			epornerActresses.forEach((name) => allActresses.add(name));

			// Extract from backend
			const backendActresses = await extractFromBackendVideos();
			backendActresses.forEach((name) => allActresses.add(name));

			// Convert to sorted array and filter invalid names
			actresses.value = Array.from(allActresses)
				.filter((name) => name && name.trim() && isValidPersonName(name.trim()))
				.map((name) => ({
					name: name.trim(),
					image: null, // Will be set later if available
				}))
				.sort((a, b) => a.name.localeCompare(b.name));

			// Save to localStorage for persistence
			try {
				localStorage.setItem(
					"extracted_actresses",
					JSON.stringify(actresses.value),
				);
			} catch (e) {
				console.warn("Could not save actresses to localStorage:", e);
			}

			return actresses.value;
		} catch (error) {
			console.error("Error extracting all actresses:", error);
			return [];
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Load actresses from localStorage
	 */
	function loadFromStorage() {
		try {
			const stored = localStorage.getItem("extracted_actresses");
			if (stored) {
				actresses.value = JSON.parse(stored);
				return actresses.value;
			}
		} catch (error) {
			console.error("Error loading actresses from storage:", error);
		}
		return [];
	}

	/**
	 * Get actress image URL from pornpics.com
	 * URL pattern: https://cdni.pornpics.com/models/{first_letter}/{name_slug}.jpg
	 * Handles special cases like apostrophes: "Maddy O'Reilly" -> "maddy_oreilly"
	 */
	function getActressImage(actressName) {
		if (!actressName) return null;

		// Convert name to slug format: "Abella Danger" -> "abella_danger"
		// Handle apostrophes: "Maddy O'Reilly" -> "maddy_oreilly"
		const nameSlug = actressName
			.toLowerCase()
			.trim()
			.replace(/'/g, "") // Remove apostrophes
			.replace(/\s+/g, "_") // Replace spaces with underscores
			.replace(/[^a-z0-9_]/g, ""); // Remove other special characters

		if (!nameSlug) return null;

		// Get first letter for directory structure
		const firstLetter = nameSlug.charAt(0);

		// Construct pornpics.com CDN URL
		return `https://cdni.pornpics.com/models/${firstLetter}/${nameSlug}.jpg`;
	}

	/**
	 * Get all known actresses with their images
	 */
	function getAllKnownActresses() {
		return Array.from(KNOWN_ACTRESSES)
			.map((name) => ({
				name: name.trim(),
				image: getActressImage(name),
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	return {
		actresses: computed(() => actresses.value),
		loading: computed(() => loading.value),
		extractAllActresses,
		extractFromEpornerVideos,
		extractFromBackendVideos,
		loadFromStorage,
		getActressImage,
		getAllKnownActresses,
		KNOWN_ACTRESSES,
		isValidActressName: isValidPersonName, // Export validation function
	};
}
