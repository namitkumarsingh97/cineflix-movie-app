/**
 * Dynamic Google Sign-In loader
 * Only loads the script when needed (saves 88.9 KiB on initial load)
 */

let googleSignInLoaded = false;
let loadPromise = null;

export function loadGoogleSignIn() {
	// Return existing promise if already loading
	if (loadPromise) {
		return loadPromise;
	}

	// Return resolved promise if already loaded
	if (googleSignInLoaded && window.google?.accounts) {
		return Promise.resolve();
	}

	// Create new load promise
	loadPromise = new Promise((resolve, reject) => {
		// Check if script already exists
		const existingScript = document.querySelector(
			'script[src*="accounts.google.com/gsi/client"]',
		);
		if (existingScript) {
			// Wait for it to load
			existingScript.onload = () => {
				googleSignInLoaded = true;
				resolve();
			};
			existingScript.onerror = reject;
			return;
		}

		// Create and load script
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = () => {
			googleSignInLoaded = true;
			resolve();
		};
		script.onerror = () => {
			loadPromise = null;
			reject(new Error("Failed to load Google Sign-In script"));
		};
		document.head.appendChild(script);
	});

	return loadPromise;
}
