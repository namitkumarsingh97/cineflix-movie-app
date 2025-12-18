<template>
  <div class="add-movie-form">
    <form @submit.prevent="handleSave" class="movie-form">
      <div class="form-group">
        <label for="movieTitle">
          <Film :size="16" />
          <span>Movie Title *</span>
        </label>
        <input
          type="text"
          id="movieTitle"
          v-model="movieData.title"
          placeholder="Enter movie title"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="category">
          <FolderOpen :size="16" />
          <span>Category *</span>
        </label>
        <select
          id="category"
          v-model="movieData.category"
          class="form-input"
          required
        >
          <option value="">Select a category</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="stars">
          <Star :size="16" />
          <span>Stars/Actors (comma-separated)</span>
        </label>
        <input
          type="text"
          id="stars"
          v-model="movieData.stars"
          placeholder="e.g., Actor Name 1, Actor Name 2"
          class="form-input"
        />
        <small class="form-hint">Enter star names separated by commas</small>
      </div>

      <div class="form-group">
        <label for="iframeCode">
          <Video :size="16" />
          <span>Iframe Code *</span>
        </label>
        <textarea
          id="iframeCode"
          v-model="movieData.iframeCode"
          placeholder='Paste your iframe code here, e.g., &lt;iframe width="720" height="1280" src="https://www.******.com/embed/nEoN849L394/" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;'
          class="form-textarea"
          rows="6"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="thumbnail">
          <Image :size="16" />
          <span>Thumbnail *</span>
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

      <div v-if="error" class="error-message">
        <AlertCircle :size="16" />
        <span>{{ error }}</span>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="resetForm">
          Reset
        </button>
        <button type="submit" class="btn-primary" :disabled="saving">
          <Loader2 v-if="saving" :size="16" class="spinning" />
          <Sparkles v-else :size="16" />
          <span>{{ saving ? "Saving..." : "Add Movie" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import {
	AlertCircle,
	Film,
	FolderOpen,
	Image,
	Link,
	Loader2,
	Sparkles,
	Star,
	Upload,
	Video,
	X,
} from "lucide-vue-next";
import { ref } from "vue";
import apiClient from "../plugins/axios";

const emit = defineEmits(["saved"]);

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
	stars: "",
	iframeCode: "",
	thumbnailFile: null,
	thumbnailUrl: "",
});

const thumbnailType = ref("upload"); // 'upload' or 'url'
const thumbnailPreview = ref(null);
const urlPreview = ref(true);
const saving = ref(false);
const error = ref("");

function handleThumbnailChange(event) {
	const file = event.target.files[0];
	if (file) {
		if (file.size > 5 * 1024 * 1024) {
			error.value = "Thumbnail size should be less than 5MB";
			return;
		}
		movieData.value.thumbnailFile = file;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			thumbnailPreview.value = e.target.result;
		};
		reader.readAsDataURL(file);
		error.value = "";
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

function resetForm() {
	movieData.value = {
		title: "",
		category: "",
		stars: "",
		iframeCode: "",
		thumbnailFile: null,
		thumbnailUrl: "",
	};
	thumbnailType.value = "upload";
	thumbnailPreview.value = null;
	urlPreview.value = true;
	error.value = "";
	const fileInput = document.getElementById("thumbnail");
	if (fileInput) fileInput.value = "";
}

async function handleSave() {
	error.value = "";

	if (!movieData.value.title.trim()) {
		error.value = "Please enter a movie title";
		return;
	}

	if (!movieData.value.category) {
		error.value = "Please select a category";
		return;
	}

	if (!movieData.value.iframeCode.trim()) {
		error.value = "Please enter iframe code";
		return;
	}

	if (thumbnailType.value === "upload" && !movieData.value.thumbnailFile) {
		error.value = "Please upload a thumbnail image";
		return;
	}

	if (thumbnailType.value === "url" && !movieData.value.thumbnailUrl.trim()) {
		error.value = "Please enter a thumbnail URL";
		return;
	}

	if (thumbnailType.value === "url") {
		// Validate URL
		try {
			new URL(movieData.value.thumbnailUrl.trim());
		} catch (e) {
			error.value = "Please enter a valid URL";
			return;
		}
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

		// Prepare stars array
		let starsArray = [];
		if (movieData.value.stars && movieData.value.stars.trim()) {
			starsArray = movieData.value.stars
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s);
		}

		// Create FormData for file upload or JSON for URL
		if (thumbnailType.value === "upload" && movieData.value.thumbnailFile) {
			const formData = new FormData();
			formData.append("title", movieData.value.title.trim());
			formData.append("category", movieData.value.category);
			if (starsArray.length > 0) {
				formData.append("stars", JSON.stringify(starsArray));
			}
			formData.append("iframe", iframeHtml);
			formData.append("iframeSrc", iframeSrc);
			formData.append("thumbnail", movieData.value.thumbnailFile);

			const response = await apiClient.post("/movies", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data.success) {
				emit("saved");
				resetForm();
			}
		} else {
			// Use JSON for URL thumbnail
			const requestData = {
				title: movieData.value.title.trim(),
				category: movieData.value.category,
				iframe: iframeHtml,
				iframeSrc: iframeSrc,
				thumbnail: movieData.value.thumbnailUrl.trim(),
			};
			if (starsArray.length > 0) {
				requestData.stars = starsArray;
			}

			const response = await apiClient.post("/movies", requestData);

			if (response.data.success) {
				emit("saved");
				resetForm();
			}
		}
	} catch (err) {
		error.value =
			err.response?.data?.error ||
			err.response?.data?.message ||
			"Failed to save movie. Please try again.";
	} finally {
		saving.value = false;
	}
}
</script>

<style scoped>
.add-movie-form {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 69, 0, 0.1);
}

.movie-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: var(--primary);
}

.form-input,
.form-textarea {
  background: var(--dark);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
  width: 100%;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-secondary);
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

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

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-size: 14px;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--dark);
  color: var(--text-primary);
  border: 2px solid rgba(255, 69, 0, 0.2);
}

.btn-secondary:hover {
  border-color: var(--primary);
  background: rgba(255, 69, 0, 0.05);
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
