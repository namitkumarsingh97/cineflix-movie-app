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
            <label for="storyContent">
              <FileText :size="16" />
              <span>Story Content *</span>
            </label>
            <textarea
              id="storyContent"
              v-model="formData.content"
              placeholder="Write your story here..."
              class="form-textarea"
              rows="15"
              required
            ></textarea>
            <span class="char-count"
              >{{ formData.content.length }} characters</span
            >
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
    const payload = {
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      category: formData.value.category,
      status: formData.value.status,
      author: formData.value.author.trim() || "Admin",
    };

    if (props.story) {
      await apiClient.put(`/stories/${props.story._id}`, payload);
    } else {
      await apiClient.post("/stories", payload);
    }

    emit("saved");
    close();
  } catch (err) {
    error.value =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Failed to save story. Please try again.";
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
  border: 1px solid rgba(255, 0, 110, 0.2);
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
  border-bottom: 1px solid rgba(255, 0, 110, 0.1);
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
  box-shadow: 0 0 0 4px rgba(255, 0, 110, 0.1);
}

.char-count {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
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
  border: 2px solid rgba(255, 0, 110, 0.2);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-btn:hover {
  border-color: rgba(255, 0, 110, 0.4);
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
  border-top: 1px solid rgba(255, 0, 110, 0.1);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--dark);
  color: var(--text-primary);
  border: 2px solid rgba(255, 0, 110, 0.2);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: var(--primary);
  background: rgba(255, 0, 110, 0.05);
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
</style>
