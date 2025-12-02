<template>
  <div>
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
</template>

<script setup>
import { ref, provide } from 'vue';
import PublicLayout from './layouts/PublicLayout.vue';
import AddMovieModal from './components/AddMovieModal.vue';

const searchQuery = ref('');
const showAddModal = ref(false);

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
