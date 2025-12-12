<template>
  <div>
    <AgeVerification />
    <div v-show="isAgeVerified" class="app-content" :style="{ display: isAgeVerified ? 'block' : 'none' }">
      <PublicLayout
        v-model="searchQuery"
        @refresh="handleRefresh"
        @addMovie="showAddModal = true"
      />
      <AddMovieModal
        :show="showAddModal"
        @close="showAddModal = false"
        @saved="handleMovieSaved"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, watch } from 'vue';
import PublicLayout from './layouts/PublicLayout.vue';
import AddMovieModal from './components/AddMovieModal.vue';
import AgeVerification from './components/AgeVerification.vue';

const searchQuery = ref('');
const showAddModal = ref(false);
const isAgeVerified = ref(false);

function checkAgeVerification() {
  const verified = localStorage.getItem('ageVerified');
  const timestamp = localStorage.getItem('ageVerifiedTimestamp');
  
  if (verified === 'true' && timestamp) {
    const verificationDate = parseInt(timestamp);
    const daysSinceVerification = (Date.now() - verificationDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceVerification < 30) {
      isAgeVerified.value = true;
    } else {
      localStorage.removeItem('ageVerified');
      localStorage.removeItem('ageVerifiedTimestamp');
    }
  }
}

// Watch for changes in localStorage
watch(() => localStorage.getItem('ageVerified'), () => {
  checkAgeVerification();
});

// Listen for custom age verification event
onMounted(() => {
  checkAgeVerification();
  
  // Listen for storage events (when age verification changes in another tab)
  window.addEventListener('storage', () => {
    checkAgeVerification();
  });
  
  // Listen for custom age verified event
  window.addEventListener('ageVerified', () => {
    checkAgeVerification();
  });
  
  // Also poll for changes (fallback)
  const interval = setInterval(() => {
    const currentVerified = localStorage.getItem('ageVerified') === 'true';
    if (currentVerified !== isAgeVerified.value) {
      checkAgeVerification();
    }
  }, 100);
  
  // Cleanup on unmount
  return () => {
    clearInterval(interval);
    window.removeEventListener('storage', checkAgeVerification);
    window.removeEventListener('ageVerified', checkAgeVerification);
  };
});

// Provide search query and refresh trigger to child components
provide('searchQuery', searchQuery);

const refreshTrigger = ref(0);
provide('refreshTrigger', refreshTrigger);

function handleRefresh() {
  refreshTrigger.value++;
}

function handleMovieSaved() {
  // Refresh movies after adding
  handleRefresh();
  // Show success message
  alert('Movie added successfully!');
}
</script>

<style>
/* Global styles are in style.css */
</style>
