<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <Plus :size="20" />
          <span>Add New Movie</span>
        </h3>
        <button class="modal-close" @click="$emit('close')">
          <X :size="24" />
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="movieTitle">
            <Film :size="16" />
            <span>Movie Title</span>
          </label>
          <input
            type="text"
            id="movieTitle"
            v-model="movieData.title"
            placeholder="Enter movie title"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="category">
            <FolderOpen :size="16" />
            <span>Category</span>
          </label>
          <select id="category" v-model="movieData.category" class="form-input">
            <option value="">Select a category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="iframeCode">
            <Video :size="16" />
            <span>Iframe Code</span>
          </label>
          <textarea
            id="iframeCode"
            v-model="movieData.iframeCode"
            placeholder='Paste your iframe code here, e.g., &lt;iframe width="720" height="1280" src="https://www.******.com/embed/nEoN849L394/" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;'
            class="form-textarea"
            rows="6"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="thumbnail">
            <Image :size="16" />
            <span>Thumbnail</span>
          </label>
          <div class="thumbnail-options">
            <div class="option-toggle">
              <button
                type="button"
                :class="['toggle-btn', { active: thumbnailType === 'upload' }]"
                @click="thumbnailType = 'upload'"
              >
                <Upload :size="16" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                :class="['toggle-btn', { active: thumbnailType === 'url' }]"
                @click="thumbnailType = 'url'"
              >
                <Link :size="16" />
                <span>Picture Link</span>
              </button>
            </div>

            <!-- Upload Option -->
            <div v-if="thumbnailType === 'upload'" class="thumbnail-upload">
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                @change="handleThumbnailChange"
                class="file-input"
              />
              <label for="thumbnail" class="file-label">
                <Upload :size="20" />
                <span>{{
                  movieData.thumbnailFile
                    ? movieData.thumbnailFile.name
                    : "Choose thumbnail image"
                }}</span>
              </label>
              <div v-if="thumbnailPreview" class="thumbnail-preview">
                <img :src="thumbnailPreview" alt="Thumbnail preview" />
                <button
                  type="button"
                  class="remove-thumbnail"
                  @click="removeThumbnail"
                >
                  <X :size="16" />
                </button>
              </div>
            </div>

            <!-- URL Option -->
            <div v-else class="thumbnail-url">
              <input
                type="url"
                id="thumbnailUrl"
                v-model="movieData.thumbnailUrl"
                placeholder="https://example.com/image.jpg"
                class="form-input"
                @input="handleUrlChange"
              />
              <div
                v-if="movieData.thumbnailUrl && urlPreview"
                class="thumbnail-preview"
              >
                <img
                  :src="movieData.thumbnailUrl"
                  alt="Thumbnail preview"
                  @error="urlPreview = false"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn-primary" @click="handleSave" :disabled="saving">
            <Loader2 v-if="saving" :size="16" class="spinning" />
            <Sparkles v-else :size="16" />
            <span>{{ saving ? "Saving..." : "Add Movie" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
	Film,
	FolderOpen,
	Image,
	Link,
	Loader2,
	Plus,
	Sparkles,
	Upload,
	Video,
	X,
} from "lucide-vue-next";
import { ref, watch } from "vue";
import apiClient from "../plugins/axios";
import { movieService } from "../services/movieService";

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["close", "saved"]);

const categories = [
	"Adventure",
	"Amateur",
	"Anal",
	"Asian",
	"BDSM",
	"Big Ass",
	"Desi",
	"Blowjob",
	"Compilation",
	"Cartoon",
	"Cosplay",
	"Cuckold",
	"Ebony",
	"Fantasy",
	"Family",
	"Fetish",
	"Foot Fetish",
	"Gangbang",
	"Housewife",
	"Japanese",
	"MILF",
	"Massage",
	"Mature",
	"Romance",
	"Teen",
	"Threesome",
	"Other",
];

const movieData = ref({
	title: "",
	category: "",
	iframeCode: "",
	thumbnailFile: null,
	thumbnailUrl: "",
});

const thumbnailType = ref("upload"); // 'upload' or 'url'
const thumbnailPreview = ref(null);
const urlPreview = ref(true);
const saving = ref(false);

watch(
	() => props.show,
	(newVal) => {
		if (!newVal) {
			// Reset form when modal closes
			movieData.value = {
				title: "",
				category: "",
				iframeCode: "",
				thumbnailFile: null,
				thumbnailUrl: "",
			};
			thumbnailType.value = "upload";
			thumbnailPreview.value = null;
			urlPreview.value = true;
			const fileInput = document.getElementById("thumbnail");
			if (fileInput) fileInput.value = "";
		}
	},
);

function handleThumbnailChange(event) {
	const file = event.target.files[0];
	if (file) {
		if (file.size > 5 * 1024 * 1024) {
			alert("Thumbnail size should be less than 5MB");
			return;
		}
		movieData.value.thumbnailFile = file;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			thumbnailPreview.value = e.target.result;
		};
		reader.readAsDataURL(file);
	}
}

function removeThumbnail() {
	movieData.value.thumbnailFile = null;
	thumbnailPreview.value = null;
	const fileInput = document.getElementById("thumbnail");
	if (fileInput) fileInput.value = "";
}

function handleUrlChange() {
	urlPreview.value = true;
	if (movieData.value.thumbnailUrl) {
		// Validate URL format
		try {
			new URL(movieData.value.thumbnailUrl);
		} catch (e) {
			// Invalid URL, but let user continue typing
		}
	}
}

async function handleSave() {
	if (!movieData.value.title.trim()) {
		alert("Please enter a movie title");
		return;
	}

	if (!movieData.value.iframeCode.trim()) {
		alert("Please enter iframe code");
		return;
	}

	saving.value = true;
	try {
		// Parse iframe code
		let iframeSrc = movieData.value.iframeCode.trim();
		let iframeWidth = "100%";
		let iframeHeight = "100%";

		const iframeMatch = iframeSrc.match(/src=["']([^"']+)["']/);
		if (iframeMatch) {
			iframeSrc = iframeMatch[1];
		}

		const widthMatch = movieData.value.iframeCode.match(
			/width=["']([^"']+)["']/,
		);
		const heightMatch = movieData.value.iframeCode.match(
			/height=["']([^"']+)["']/,
		);
		if (widthMatch) iframeWidth = widthMatch[1];
		if (heightMatch) iframeHeight = heightMatch[1];

		const iframeHtml = `<iframe 
      width="${iframeWidth}" 
      height="${iframeHeight}" 
      src="${iframeSrc}" 
      frameborder="0" 
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture; microphone; camera"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      style="border: none;"
    ></iframe>`;

		// Handle thumbnail - upload or URL
		if (thumbnailType.value === "upload" && movieData.value.thumbnailFile) {
			// Upload file
			const formData = new FormData();
			formData.append("title", movieData.value.title.trim());
			if (movieData.value.category) {
				formData.append("category", movieData.value.category);
			}
			formData.append("iframe", iframeHtml);
			formData.append("iframeSrc", iframeSrc);
			formData.append("thumbnail", movieData.value.thumbnailFile);

			await apiClient.post("/movies", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		} else if (
			thumbnailType.value === "url" &&
			movieData.value.thumbnailUrl.trim()
		) {
			// Use URL
			await apiClient.post("/movies", {
				title: movieData.value.title.trim(),
				category: movieData.value.category || undefined,
				iframe: iframeHtml,
				iframeSrc: iframeSrc,
				thumbnail: movieData.value.thumbnailUrl.trim(),
			});
		} else {
			// Use old method if no thumbnail provided
			await movieService.createMovie(
				movieData.value.title,
				movieData.value.iframeCode,
				movieData.value.category,
			);
		}

		emit("saved");
		emit("close");
		movieData.value = {
			title: "",
			category: "",
			iframeCode: "",
			thumbnailFile: null,
			thumbnailUrl: "",
		};
		thumbnailType.value = "upload";
		thumbnailPreview.value = null;
		urlPreview.value = true;
	} catch (error) {
		alert(error.message || "Failed to save movie. Please try again.");
	} finally {
		saving.value = false;
	}
}
</script>

<style scoped>
.thumbnail-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-toggle {
  display: flex;
  gap: 8px;
  background: var(--dark);
  padding: 4px;
  border-radius: 12px;
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--gradient-primary);
  color: white;
}

.toggle-btn svg {
  width: 16px;
  height: 16px;
}

.thumbnail-upload {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.thumbnail-url {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--dark);
  border: 2px dashed rgba(255, 69, 0, 0.3);
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.file-label:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(255, 69, 0, 0.05);
}

.file-label svg {
  width: 20px;
  height: 20px;
}

.thumbnail-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 69, 0, 0.2);
}

.thumbnail-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-thumbnail {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.remove-thumbnail:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.1);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
