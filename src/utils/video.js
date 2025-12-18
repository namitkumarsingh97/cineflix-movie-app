export function extractYouTubeId(url) {
	if (!url) return null;
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeThumbnail(url) {
	const videoId = extractYouTubeId(url);
	if (videoId) {
		return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
	}
	return null;
}

export function getThumbnail(movie) {
	// Use stored thumbnail if available
	if (movie.thumbnail) {
		return movie.thumbnail;
	}

	// Try to extract thumbnail from iframe source
	const src = movie.iframeSrc || "";

	// YouTube thumbnail
	if (src.includes("youtube.com") || src.includes("youtu.be")) {
		return getYouTubeThumbnail(src);
	}

	// Vimeo thumbnail (would need API, using placeholder for now)
	if (src.includes("vimeo.com")) {
		return `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop`;
	}

	return null;
}
