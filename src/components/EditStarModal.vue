<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <Star :size="20" />
          <span>Edit Star Profile</span>
        </h3>
        <button class="modal-close" @click="$emit('close')">
          <X :size="24" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSave" class="star-form">
          <div class="form-group">
            <label for="starName">
              <Star :size="16" />
              <span>Star Name</span>
            </label>
            <input
              type="text"
              id="starName"
              :value="starName"
              disabled
              class="form-input"
            />
            <small class="form-hint">Star name cannot be changed</small>
          </div>

          <div class="form-group">
            <label for="starPhoto">
              <Image :size="16" />
              <span>Photo</span>
            </label>
            <div class="photo-options">
              <div class="option-toggle">
                <button
                  type="button"
                  :class="['toggle-btn', { active: photoType === 'upload' }]"
                  @click="photoType = 'upload'"
                >
                  <Upload :size="16" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  :class="['toggle-btn', { active: photoType === 'url' }]"
                  @click="photoType = 'url'"
                >
                  <Link :size="16" />
                  <span>Picture Link</span>
                </button>
              </div>

              <div v-if="photoType === 'upload'" class="photo-upload">
                <input
                  type="file"
                  id="starPhoto"
                  accept="image/*"
                  @change="handlePhotoChange"
                  class="file-input"
                />
                <label for="starPhoto" class="file-label">
                  <Upload :size="20" />
                  <span>{{
                    starData.photoFile
                      ? starData.photoFile.name
                      : "Choose photo"
                  }}</span>
                </label>
                <div v-if="photoPreview" class="photo-preview">
                  <img :src="photoPreview" alt="Photo preview" />
                  <button
                    type="button"
                    class="remove-photo"
                    @click="removePhoto"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </div>

              <div v-else class="photo-url">
                <input
                  type="url"
                  id="starPhotoUrl"
                  v-model="starData.photoUrl"
                  placeholder="https://example.com/photo.jpg"
                  class="form-input"
                />
                <div
                  v-if="starData.photoUrl && urlPreview"
                  class="photo-preview"
                >
                  <img
                    :src="starData.photoUrl"
                    alt="Photo preview"
                    @error="urlPreview = false"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="starBio">
              <FileText :size="16" />
              <span>Biography</span>
            </label>
            <textarea
              id="starBio"
              v-model="starData.bio"
              placeholder="Enter star biography..."
              class="form-textarea"
              rows="8"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="birthDate">
              <Calendar :size="16" />
              <span>Birth Date</span>
            </label>
            <input
              type="date"
              id="birthDate"
              v-model="starData.birthDate"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="nationality">
              <Globe :size="16" />
              <span>Nationality</span>
            </label>
            <input
              type="text"
              id="nationality"
              v-model="starData.nationality"
              placeholder="e.g., American, British"
              class="form-input"
            />
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
  Star,
  Image,
  Upload,
  Link,
  Save,
  Loader2,
  X,
  AlertCircle,
  FileText,
  Calendar,
  Globe,
} from "lucide-vue-next";
import { starsApi } from "../api/stars";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  starName: {
    type: String,
    required: true,
  },
  starProfile: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "saved"]);

const starData = ref({
  photoFile: null,
  photoUrl: "",
  bio: "",
  birthDate: "",
  nationality: "",
});

const photoType = ref("url");
const photoPreview = ref(null);
const urlPreview = ref(true);
const saving = ref(false);
const error = ref("");

watch(
  () => props.starProfile,
  (newProfile) => {
    if (newProfile) {
      starData.value = {
        photoFile: null,
        photoUrl: newProfile.photo || "",
        bio: newProfile.bio || "",
        birthDate: newProfile.birthDate
          ? new Date(newProfile.birthDate).toISOString().split("T")[0]
          : "",
        nationality: newProfile.nationality || "",
      };
      photoType.value = newProfile.photo ? "url" : "upload";
      photoPreview.value = null;
      urlPreview.value = true;
    }
  },
  { immediate: true }
);

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);

function handlePhotoChange(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = "Photo size should be less than 5MB";
      return;
    }
    starData.value.photoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
    error.value = "";
  }
}

function removePhoto() {
  starData.value.photoFile = null;
  photoPreview.value = null;
  const fileInput = document.getElementById("starPhoto");
  if (fileInput) fileInput.value = "";
}

function resetForm() {
  starData.value = {
    photoFile: null,
    photoUrl: "",
    bio: "",
    birthDate: "",
    nationality: "",
  };
  photoType.value = "url";
  photoPreview.value = null;
  urlPreview.value = true;
  error.value = "";
}

async function handleSave() {
  error.value = "";
  saving.value = true;

  try {
    const updateData = {
      bio: starData.value.bio || "",
      nationality: starData.value.nationality || "",
    };

    if (starData.value.birthDate) {
      updateData.birthDate = new Date(starData.value.birthDate).toISOString();
    }

    if (photoType.value === "upload" && starData.value.photoFile) {
      updateData.photoFile = starData.value.photoFile;
    } else if (photoType.value === "url" && starData.value.photoUrl) {
      updateData.photo = starData.value.photoUrl.trim();
    }

    await starsApi.updateProfile(props.starName, updateData);
    emit("saved");
    emit("close");
  } catch (err) {
    error.value =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Failed to update star profile. Please try again.";
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 69, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 69, 0, 0.1);
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

.star-form {
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

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

.photo-options {
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
}

.photo-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 69, 0, 0.2);
}

.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-photo {
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
  border: 2px solid rgba(255, 69, 0, 0.2);
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

