<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content story-modal">
      <div class="modal-header">
        <h3>
          <FileText :size="20" />
          <span>{{ story ? "Edit Story" : "Create New Story" }}</span>
        </h3>
        <button class="modal-close" @click="close">
          <X :size="24" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSave" class="story-form">
          <div class="form-group">
            <label for="storyTitle">
              <Type :size="16" />
              <span>Story Title *</span>
            </label>
            <input
              type="text"
              id="storyTitle"
              v-model="formData.title"
              placeholder="Enter story title"
              class="form-input"
              required
              maxlength="200"
            />
            <span class="char-count">{{ formData.title.length }}/200</span>
          </div>

          <div class="form-group">
            <label for="storyCategory">
              <Tag :size="16" />
              <span>Category *</span>
            </label>
            <select
              id="storyCategory"
              v-model="formData.category"
              class="form-input"
              required
            >
              <option value="">Select Category</option>
              <option v-for="cat in storyCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
            <input
              v-if="formData.category === 'custom'"
              type="text"
              v-model="customCategory"
              placeholder="Enter custom category"
              class="form-input"
              style="margin-top: 8px"
            />
          </div>

          <div class="form-group">
            <div class="content-header">
              <label for="storyContent">
                <FileText :size="16" />
                <span>Story Content *</span>
              </label>
              <div class="content-toolbar">
                <button
                  type="button"
                  class="toolbar-btn"
                  @click="showImageModal = true"
                  title="Insert Image"
                >
                  <Image :size="16" />
                  <span>Insert Image</span>
                </button>
              </div>
            </div>
            <textarea
              id="storyContent"
              v-model="formData.content"
              placeholder="Write your story here...&#10;&#10;Tip: Use [IMAGE:url] or [IMG:url] to insert images in the middle of your story.&#10;Example: [IMAGE:https://example.com/image.jpg]"
              class="form-textarea"
              rows="15"
              required
              ref="contentTextarea"
            ></textarea>
            <div class="content-help">
              <span class="char-count">
                {{ formData.content.length }} characters
                <span v-if="contentSizeWarning" class="size-warning">(Large content - may cause issues)</span>
              </span>
              <span class="help-text">Use [IMAGE:url] or [IMG:url] to insert images</span>
            </div>
          </div>

          <!-- Image Insertion Modal -->
          <div v-if="showImageModal" class="image-modal-overlay" @click.self="showImageModal = false">
            <div class="image-modal">
              <div class="image-modal-header">
                <h4>Insert Image</h4>
                <button class="close-btn" @click="showImageModal = false">
                  <X :size="20" />
                </button>
              </div>
              <div class="image-modal-body">
                <div class="image-options">
                  <button
                    type="button"
                    :class="['option-btn', { active: imageType === 'url' }]"
                    @click="imageType = 'url'"
                  >
                    <Link :size="16" />
                    <span>Image URL</span>
                  </button>
                  <button
                    type="button"
                    :class="['option-btn', { active: imageType === 'upload' }]"
                    @click="imageType = 'upload'"
                  >
                    <Upload :size="16" />
                    <span>Upload Image</span>
                  </button>
                </div>

                <div v-if="imageType === 'url'" class="image-url-input">
                  <input
                    type="url"
                    v-model="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    class="form-input"
                    @keyup.enter="insertImage"
                  />
                  <div v-if="imageUrl && imagePreview" class="image-preview-small">
                    <img :src="imageUrl" alt="Preview" @error="imagePreview = false" />
                  </div>
                </div>

                <div v-else class="image-upload-input">
                  <input
                    type="file"
                    id="storyImage"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="file-input"
                  />
                  <label for="storyImage" class="file-label">
                    <Upload :size="20" />
                    <span>{{ imageFile ? imageFile.name : 'Choose image file' }}</span>
                  </label>
                  <div v-if="imageFile && imageFilePreview" class="image-preview-small">
                    <img :src="imageFilePreview" alt="Preview" />
                  </div>
                </div>

                <div class="image-modal-actions">
                  <button type="button" class="btn-secondary" @click="showImageModal = false">
                    Cancel
                  </button>
                  <button type="button" class="btn-primary" @click="insertImage" :disabled="!imageUrl && !imageFile">
                    Insert Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="storyAuthor">
              <User :size="16" />
              <span>Author</span>
            </label>
            <input
              type="text"
              id="storyAuthor"
              v-model="formData.author"
              placeholder="Author name"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>
              <Save :size="16" />
              <span>Status</span>
            </label>
            <div class="status-options">
              <button
                type="button"
                :class="['status-btn', { active: formData.status === 'draft' }]"
                @click="formData.status = 'draft'"
              >
                <FileText :size="16" />
                <span>Draft</span>
              </button>
              <button
                type="button"
                :class="[
                  'status-btn',
                  { active: formData.status === 'published' },
                ]"
                @click="formData.status = 'published'"
              >
                <Globe :size="16" />
                <span>Publish</span>
              </button>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="close">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <Loader2 v-if="saving" :size="16" class="spinning" />
              <Save v-else :size="16" />
              <span>{{
                saving ? "Saving..." : story ? "Update Story" : "Create Story"
              }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import {
  FileText,
  X,
  Type,
  Tag,
  User,
  Save,
  Globe,
  AlertCircle,
  Loader2,
  Image,
  Link,
  Upload,
} from "lucide-vue-next";
import apiClient from "../plugins/axios";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  story: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "saved"]);

const formData = ref({
  title: "",
  content: "",
  category: "",
  status: "draft",
  author: "",
});

const customCategory = ref("");
const storyCategories = ref([
  "Custom",
  "Dangerous Attraction",
  "Dark Romance",
  "Dark Temptation",
  "Fantasy Escape",
  "Forbidden Desire",
  "Obsession",
  "Power Dynamics",
  "Secret Affairs",
  "Seduction",
  "Taboo Fiction",
  "Thriller",
]);
const saving = ref(false);
const error = ref("");
const contentTextarea = ref(null);
const showImageModal = ref(false);
const imageType = ref("url");
const imageUrl = ref("");
const imageFile = ref(null);
const imageFilePreview = ref(null);
const imagePreview = ref(true);

// Content size warning (approximately 3.5MB to warn before 4MB limit)
const contentSizeWarning = computed(() => {
  // Rough estimate: 1 character ≈ 1 byte, but with UTF-8 encoding it can be more
  // Warning at ~3.5MB (3,500,000 characters) to give buffer before 4MB limit
  return formData.value.content.length > 3500000;
});

watch(
  () => props.story,
  (newStory) => {
    if (newStory) {
      formData.value = {
        title: newStory.title || "",
        content: newStory.content || "",
        category: newStory.category || "General",
        status: newStory.status || "draft",
        author: newStory.author || "",
      };
    } else {
      formData.value = {
        title: "",
        content: "",
        category: "General",
        status: "draft",
        author: "",
      };
    }
    error.value = "";
  },
  { immediate: true }
);

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  try {
    const response = await apiClient.get("/stories/categories");
    if (response.data.success) {
      const existingCategories = response.data.data || [];
      storyCategories.value = [
        ...new Set([...storyCategories.value, ...existingCategories]),
      ]
        .filter((cat) => cat !== "custom")
        .sort();
      storyCategories.value.push("custom");
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

function close() {
  emit("close");
  error.value = "";
  showImageModal.value = false;
  imageUrl.value = "";
  imageFile.value = null;
  imageFilePreview.value = null;
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      error.value = "Image size should be less than 10MB";
      return;
    }
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imageFilePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
    error.value = "";
  }
}

function insertImage() {
  let imageToInsert = "";
  
  if (imageType.value === "url" && imageUrl.value.trim()) {
    imageToInsert = `[IMAGE:${imageUrl.value.trim()}]`;
  } else if (imageType.value === "upload" && imageFile.value) {
    // For uploaded images, we'll need to upload first and get URL
    // For now, show error that upload needs to be handled separately
    error.value = "Please upload the image first, then insert the URL";
    return;
  } else {
    error.value = "Please provide an image URL or upload an image";
    return;
  }

  // Insert at cursor position or at the end
  const textarea = contentTextarea.value;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.value.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    // Insert with spacing
    const insertText = before + (before && !before.endsWith('\n\n') ? '\n\n' : '') + imageToInsert + (after && !after.startsWith('\n\n') ? '\n\n' : '') + after;
    formData.value.content = insertText;
    
    // Set cursor position after inserted image
    setTimeout(() => {
      const newPos = start + imageToInsert.length + (before && !before.endsWith('\n\n') ? 2 : 0) + (after && !after.startsWith('\n\n') ? 2 : 0);
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  } else {
    // Fallback: append to end
    formData.value.content += (formData.value.content ? '\n\n' : '') + imageToInsert + '\n\n';
  }

  // Reset image modal
  showImageModal.value = false;
  imageUrl.value = "";
  imageFile.value = null;
  imageFilePreview.value = null;
  error.value = "";
}

async function handleSave() {
  error.value = "";

  if (!formData.value.title.trim()) {
    error.value = "Please enter a story title";
    return;
  }

  if (!formData.value.content.trim()) {
    error.value = "Please enter story content";
    return;
  }

  if (!formData.value.category || formData.value.category === "custom") {
    if (!customCategory.value.trim()) {
      error.value = "Please select or enter a category";
      return;
    }
    formData.value.category = customCategory.value.trim();
  }

  saving.value = true;

  try {
    // Extract images from content using [IMAGE:url] markers
    const imageMatches = formData.value.content.match(/\[(IMAGE|IMG):(.+?)\]/gi);
    const images = imageMatches ? imageMatches.map(match => {
      const url = match.replace(/\[(IMAGE|IMG):/i, '').replace(/\]/, '');
      return {
        url: url.trim(),
        position: formData.value.content.indexOf(match),
        caption: ''
      };
    }) : [];

    const payload = {
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      category: formData.value.category,
      status: formData.value.status,
      author: formData.value.author.trim() || "Admin",
      images: images
    };

    if (props.story) {
      await apiClient.put(`/stories/${props.story._id}`, payload);
    } else {
      await apiClient.post("/stories", payload);
    }

    emit("saved");
    close();
  } catch (err) {
    if (err.response?.status === 413) {
      error.value = "Story content is too large. Please reduce the content size or split it into multiple parts. Maximum size is approximately 4MB.";
    } else {
      error.value =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save story. Please try again.";
    }
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--dark-lighter);
  border-radius: 16px;
  border: 1px solid rgba(255, 69, 0, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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
  margin: 0;
}

.modal-header h3 svg {
  color: var(--primary);
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--dark);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.story-modal {
  max-width: 800px;
  max-height: 90vh;
}

.story-form {
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
  font-weight: 600;
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
  font-family: inherit;
  transition: all 0.3s ease;
  width: 100%;
}

.form-textarea {
  resize: vertical;
  min-height: 300px;
  font-family: inherit;
  line-height: 1.6;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
}

.char-count {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
}

.size-warning {
  color: #f59e0b;
  font-weight: 600;
  margin-left: 8px;
}

.status-options {
  display: flex;
  gap: 12px;
}

.status-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--dark);
  border: 2px solid rgba(255, 69, 0, 0.2);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-btn:hover {
  border-color: rgba(255, 69, 0, 0.4);
  color: var(--text-primary);
}

.status-btn.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
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
  padding-top: 24px;
  border-top: 1px solid rgba(255, 69, 0, 0.1);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--dark);
  color: var(--text-primary);
  border: 2px solid rgba(255, 69, 0, 0.2);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: var(--primary);
  background: rgba(255, 69, 0, 0.05);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.content-toolbar {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--dark);
  border: 1px solid rgba(255, 69, 0, 0.2);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(255, 69, 0, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

.content-help {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.help-text {
  font-size: 11px;
  color: var(--text-secondary);
  font-style: italic;
}

.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.image-modal {
  background: var(--dark-lighter);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 69, 0, 0.2);
}

.image-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 69, 0, 0.1);
}

.image-modal-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.image-modal-header .close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.image-modal-header .close-btn:hover {
  background: var(--dark);
  color: var(--text-primary);
}

.image-modal-body {
  padding: 20px;
}

.image-options {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.option-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--dark);
  border: 2px solid rgba(255, 69, 0, 0.2);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn.active {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
}

.image-url-input,
.image-upload-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview-small {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 69, 0, 0.2);
  margin-top: 12px;
}

.image-preview-small img {
  width: 100%;
  max-height: 300px;
  height: auto;
  object-fit: contain;
  display: block;
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

.image-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 69, 0, 0.1);
}
</style>
