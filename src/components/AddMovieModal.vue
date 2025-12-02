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
import { ref, watch } from 'vue';
import { movieService } from '../services/movieService';
import { Film, Plus, X, Video, Sparkles, Loader2 } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'saved']);

const movieData = ref({
  title: '',
  iframeCode: '',
});

const saving = ref(false);

watch(() => props.show, (newVal) => {
  if (!newVal) {
    // Reset form when modal closes
    movieData.value = { title: '', iframeCode: '' };
  }
});

async function handleSave() {
  if (!movieData.value.title.trim()) {
    alert('Please enter a movie title');
    return;
  }

  if (!movieData.value.iframeCode.trim()) {
    alert('Please enter iframe code');
    return;
  }

  saving.value = true;
  try {
    await movieService.createMovie(
      movieData.value.title,
      movieData.value.iframeCode
    );
    emit('saved');
    emit('close');
    movieData.value = { title: '', iframeCode: '' };
  } catch (error) {
    alert(error.message || 'Failed to save movie. Please try again.');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
/* Styles are in global style.css */
</style>

