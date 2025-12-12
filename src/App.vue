<template>
  <div>
    <AgeVerification />
    <div v-if="isAgeVerified" class="app-content">
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

onMounted(() => {
  checkAgeVerification();
  
  // Listen for storage events (when age verification changes in another tab)
  window.addEventListener('storage', () => {
    checkAgeVerification();
  });
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
