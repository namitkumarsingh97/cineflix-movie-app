<template>
  <picture class="optimized-image">
    <source
      v-for="source in pictureSources"
      :key="source.type"
      :type="source.type"
      :srcset="source.srcset"
      :sizes="source.sizes"
    />
    <img
      ref="imgRef"
      :src="fallbackSrc"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :loading="loading"
      :fetchpriority="fetchpriority"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
    />
  </picture>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import {
	generateBlurPlaceholder,
	generatePictureSources,
	generateSrcSet,
	getOptimalImageSize,
	optimizeImageUrl,
	setupLazyImage,
} from "../utils/imageOptimization";

const props = defineProps({
	src: {
		type: String,
		required: true,
	},
	alt: {
		type: String,
		default: "",
	},
	width: {
		type: Number,
		default: null,
	},
	height: {
		type: Number,
		default: null,
	},
	loading: {
		type: String,
		default: "lazy",
		validator: (value) => ["lazy", "eager"].includes(value),
	},
	fetchpriority: {
		type: String,
		default: "auto",
		validator: (value) => ["high", "low", "auto"].includes(value),
	},
	blurhash: {
		type: String,
		default: null,
	},
	sizes: {
		type: String,
		default:
			"(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 960px) 960px, (max-width: 1280px) 1280px, 1920px",
	},
	imageClass: {
		type: String,
		default: "",
	},
});

const imgRef = ref(null);
const isLoaded = ref(false);

// Generate picture sources for modern formats
const pictureSources = computed(() => {
	if (!props.src) return [];
	return generatePictureSources(props.src, [320, 640, 960, 1280, 1920]);
});

// Generate srcset for fallback
const srcset = computed(() => {
	if (!props.src) return "";
	return generateSrcSet(props.src, [320, 640, 960, 1280, 1920]);
});

// Fallback src (optimized)
const fallbackSrc = computed(() => {
	if (!props.src) return "";
	const optimalSize = props.width || getOptimalImageSize(320);
	return optimizeImageUrl(props.src, optimalSize);
});

// Placeholder for blur effect
const placeholder = computed(() => {
	if (props.blurhash) {
		return generateBlurPlaceholder(props.blurhash, 20, 20);
	}
	return generateBlurPlaceholder(null, 20, 20);
});

const handleLoad = () => {
	isLoaded.value = true;
};

const handleError = (event) => {
	// Fallback to default placeholder
	if (event.target.src !== placeholder.value) {
		event.target.src = placeholder.value;
	}
};

onMounted(async () => {
	await nextTick();
	if (!imgRef.value) return;

	if (props.loading === "lazy") {
		// Set placeholder first for lazy loading
		imgRef.value.src = placeholder.value;
		imgRef.value.style.filter = "blur(10px)";
		imgRef.value.style.opacity = "0.7";
		imgRef.value.style.transition = "filter 0.3s, opacity 0.3s";

		// Setup lazy loading with Intersection Observer
		// Use a small delay to ensure DOM is ready
		setTimeout(() => {
			if (imgRef.value) {
				setupLazyImage(
					imgRef.value,
					fallbackSrc.value,
					srcset.value,
					placeholder.value,
				);
			}
		}, 50);
	} else {
		// Eager loading - load immediately
		imgRef.value.src = fallbackSrc.value;
		if (srcset.value) {
			imgRef.value.srcset = srcset.value;
		}
		imgRef.value.style.opacity = "1";
	}
});

watch(
	() => props.src,
	() => {
		isLoaded.value = false;
	},
);
</script>

<style scoped>
.optimized-image {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.optimized-image picture {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.optimized-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
  display: block;
  margin: 0;
  padding: 0;
}
</style>

