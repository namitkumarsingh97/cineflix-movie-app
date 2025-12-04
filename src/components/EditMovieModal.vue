<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <Edit :size="20" />
          <span>Edit Movie</span>
        </h3>
        <button class="modal-close" @click="$emit('close')">
          <X :size="24" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSave" class="movie-form">
          <div class="form-group">
            <label for="editTitle">
              <Film :size="16" />
              <span>Movie Title *</span>
            </label>
            <input
              type="text"
              id="editTitle"
              v-model="movieData.title"
              placeholder="Enter movie title"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="editCategory">
              <FolderOpen :size="16" />
              <span>Category</span>
            </label>
            <select
              id="editCategory"
              v-model="movieData.category"
              class="form-input"
            >
              <option value="">Select a category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="editIframeCode">
              <Video :size="16" />
              <span>Iframe Code *</span>
            </label>
            <textarea
              id="editIframeCode"
              v-model="movieData.iframeCode"
              placeholder="Paste your iframe code here"
              class="form-textarea"
              rows="6"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="editThumbnail">
              <Image :size="16" />
              <span>Thumbnail</span>
            </label>
            <div class="thumbnail-options">
              <div class="option-toggle">
                <button
                  type="button"
                  :class="[
                    'toggle-btn',
                    { active: thumbnailType === 'upload' },
                  ]"
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

              <div v-if="thumbnailType === 'upload'" class="thumbnail-upload">
                <input
                  type="file"
                  id="editThumbnail"
                  accept="image/*"
                  @change="handleThumbnailChange"
                  class="file-input"
                />
                <label for="editThumbnail" class="file-label">
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

              <div v-else class="thumbnail-url">
                <input
                  type="url"
                  id="editThumbnailUrl"
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
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <Loader2 v-if="saving" :size="16" class="spinning" />
              <Save v-else :size="16" />
              <span>{{ saving ? "Saving..." : "Save Changes" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  Film,
  Video,
  Image,
  Upload,
  Save,
  Loader2,
  X,
  FolderOpen,
  AlertCircle,
  Edit,
  Link,
} from "lucide-vue-next";
import apiClient from "../plugins/axios";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  movie: {
    type: Object,
    default: null,
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

const thumbnailType = ref("url");
const thumbnailPreview = ref(null);
const urlPreview = ref(true);
const saving = ref(false);
const error = ref("");

watch(
  () => props.movie,
  (newMovie) => {
    if (newMovie) {
      movieData.value = {
        title: newMovie.title || "",
        category: newMovie.category || "",
        iframeCode: newMovie.iframe || "",
        thumbnailFile: null,
        thumbnailUrl: newMovie.thumbnail || "",
      };
      thumbnailType.value = newMovie.thumbnail ? "url" : "upload";
      thumbnailPreview.value = null;
      urlPreview.value = true;
    }
  }
);

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);

function handleThumbnailChange(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = "Thumbnail size should be less than 5MB";
      return;
    }
    movieData.value.thumbnailFile = file;
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
  const fileInput = document.getElementById("editThumbnail");
  if (fileInput) fileInput.value = "";
}

function handleUrlChange() {
  urlPreview.value = true;
}

function resetForm() {
  movieData.value = {
    title: "",
    category: "",
    iframeCode: "",
    thumbnailFile: null,
    thumbnailUrl: "",
  };
  thumbnailType.value = "url";
  thumbnailPreview.value = null;
  urlPreview.value = true;
  error.value = "";
}

async function handleSave() {
  error.value = "";

  if (!movieData.value.title.trim()) {
    error.value = "Please enter a movie title";
    return;
  }

  if (!movieData.value.iframeCode.trim()) {
    error.value = "Please enter iframe code";
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
      /width=["']([^"']+)["']/
    );
    const heightMatch = movieData.value.iframeCode.match(
      /height=["']([^"']+)["']/
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

    if (thumbnailType.value === "upload" && movieData.value.thumbnailFile) {
      const formData = new FormData();
      formData.append("title", movieData.value.title.trim());
      formData.append("category", movieData.value.category || "");
      formData.append("iframe", iframeHtml);
      formData.append("iframeSrc", iframeSrc);
      formData.append("thumbnail", movieData.value.thumbnailFile);

      await apiClient.put(`/movies/${props.movie._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      await apiClient.put(`/movies/${props.movie._id}`, {
        title: movieData.value.title.trim(),
        category: movieData.value.category || "",
        iframe: iframeHtml,
        iframeSrc: iframeSrc,
        thumbnail:
          thumbnailType.value === "url" && movieData.value.thumbnailUrl.trim()
            ? movieData.value.thumbnailUrl.trim()
            : undefined,
      });
    }

    emit("saved");
    emit("close");
  } catch (err) {
    error.value =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Failed to update movie. Please try again.";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--dark-lighter);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 0, 110, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 0, 110, 0.1);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-header h3 svg {
  color: var(--primary);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: var(--dark);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.movie-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  box-shadow: 0 0 0 4px rgba(255, 0, 110, 0.1);
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

.toggle-btn.active {
  background: var(--gradient-primary);
  color: white;
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
  border: 2px dashed rgba(255, 0, 110, 0.3);
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.file-label:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.thumbnail-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 0, 110, 0.2);
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
  border: 2px solid rgba(255, 0, 110, 0.2);
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
