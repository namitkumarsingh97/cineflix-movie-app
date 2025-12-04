<template>
  <div class="story-detail-page">
    <Loader v-if="loading" message="Loading story..." />

    <div v-else-if="story" class="story-content">
      <div class="story-header">
        <button class="back-btn" @click="goBack">
          <ArrowLeft :size="20" />
          <span>Back to Stories</span>
        </button>
        <h1 class="story-title-main">{{ story.title }}</h1>
        <div class="story-meta">
          <span class="story-author-main">by {{ story.author }}</span>
          <span class="story-date">{{ formatDate(story.createdAt) }}</span>
          <span class="story-category">{{ story.category }}</span>
        </div>
        <div class="story-stats">
          <span class="stat-item">
            <Eye :size="16" />
            {{ formatNumber(story.views || 0) }} views
          </span>
          <span class="stat-item">
            <Heart :size="16" />
            {{ formatNumber(story.likes || 0) }} likes
          </span>
        </div>
      </div>

      <div class="story-body">
        <div
          v-for="(page, index) in paginatedContent"
          :key="index"
          class="story-page"
          :class="{ active: currentPage === index + 1 }"
        >
          <div class="story-text" v-html="formatContent(page)"></div>
        </div>
      </div>

      <!-- Story Pagination -->
      <div v-if="totalPages > 1" class="story-pagination">
        <button
          class="story-pagination-btn"
          @click="previousPage"
          :disabled="currentPage === 1"
        >
          <ChevronLeft :size="18" />
          <span>Previous</span>
        </button>
        <div class="story-page-info">
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
        </div>
        <button
          class="story-pagination-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          <span>Next</span>
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <div v-else class="error-state">
      <AlertCircle :size="48" />
      <h3>Story not found</h3>
      <p>The story you're looking for doesn't exist.</p>
      <button class="btn-primary" @click="goBack">Go Back</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Eye, Heart, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-vue-next';
import apiClient from '../plugins/axios';
import Loader from '../components/Loader.vue';

const route = useRoute();
const router = useRouter();

const story = ref(null);
const loading = ref(true);
const currentPage = ref(1);
const wordsPerPage = 2000; // Increased for more content per page

const totalPages = computed(() => {
  if (!story.value || !story.value.content) return 1;
  const words = story.value.content.split(/\s+/).length;
  return Math.ceil(words / wordsPerPage);
});

const paginatedContent = computed(() => {
  if (!story.value || !story.value.content) return [];
  
  // Split content by paragraphs (double line breaks)
  const paragraphs = story.value.content.split(/\n\s*\n/).filter(p => p.trim());
  
  // Calculate words per page
  const totalWords = story.value.content.split(/\s+/).length;
  const wordsPerPageCount = Math.ceil(totalWords / totalPages.value);
  
  const pages = [];
  let currentPage = '';
  let currentWordCount = 0;
  
  for (const paragraph of paragraphs) {
    const paraWords = paragraph.trim().split(/\s+/).length;
    
    // If adding this paragraph would exceed the page limit, start a new page
    if (currentWordCount + paraWords > wordsPerPageCount && currentPage) {
      pages.push(currentPage.trim());
      currentPage = paragraph.trim() + '\n\n';
      currentWordCount = paraWords;
    } else {
      currentPage += (currentPage ? '\n\n' : '') + paragraph.trim();
      currentWordCount += paraWords;
    }
  }
  
  // Add the last page if there's content
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  
  // If no pages were created, return the full content as one page
  return pages.length > 0 ? pages : [story.value.content];
});

onMounted(async () => {
  await loadStory();
});

async function loadStory() {
  loading.value = true;
  try {
    const response = await apiClient.get(`/stories/${route.params.id}`);
    if (response.data.success) {
      story.value = response.data.data;
      currentPage.value = 1;
    }
  } catch (error) {
    console.error('Failed to load story:', error);
  } finally {
    loading.value = false;
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTop();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTop();
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatContent(text) {
  if (!text) return '';
  
  // Check if content already contains HTML (like img tags)
  if (text.includes('<img') || text.includes('<p>') || text.includes('<div>')) {
    // Content is already HTML, return as-is but sanitize
    return sanitizeHTML(text);
  }
  
  // Split by double line breaks (paragraph breaks)
  const paragraphs = text.split(/\n\s*\n/);
  
  // Process each paragraph
  const formattedParagraphs = paragraphs.map(para => {
    // Trim whitespace
    para = para.trim();
    
    // If paragraph is empty, return empty string
    if (!para) return '';
    
    // Check if paragraph contains image markers like [IMAGE:url] or [IMG:url]
    if (para.match(/\[(IMAGE|IMG):(.+?)\]/i)) {
      const match = para.match(/\[(IMAGE|IMG):(.+?)\]/i);
      const imageUrl = match[2];
      // Replace marker with img tag
      para = para.replace(/\[(IMAGE|IMG):.+?\]/i, `<div class="story-image-container"><img src="${imageUrl}" alt="Story image" class="story-image" /></div>`);
    }
    
    // Replace single line breaks within paragraph with <br> tags
    para = para.replace(/\n/g, '<br>');
    
    // Wrap in paragraph tag (unless it already contains div/img)
    if (para.includes('<div') || para.includes('<img')) {
      return para;
    }
    return `<p>${para}</p>`;
  }).filter(p => p); // Remove empty paragraphs
  
  return formattedParagraphs.join('');
}

function sanitizeHTML(html) {
  // Basic sanitization - allow img, p, br, div tags
  // In production, use a proper HTML sanitizer library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/on\w+="[^"]*"/gi, ''); // Remove event handlers
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function goBack() {
  router.push('/stories');
}
</script>

<style scoped>
.story-detail-page {
  min-height: calc(100vh - 200px);
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.story-content {
  background: var(--dark-lighter);
  border-radius: 16px;
  padding: 40px;
  border: 1px solid rgba(255, 0, 110, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.story-header {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 0, 110, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--dark);
  border: 1px solid rgba(255, 0, 110, 0.2);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.back-btn:hover {
  background: rgba(255, 0, 110, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
  color: var(--text-primary);
}

.story-title-main {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.story-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.story-author-main {
  color: var(--text-secondary);
  font-size: 14px;
}

.story-date {
  color: var(--text-secondary);
  font-size: 14px;
}

.story-category {
  padding: 4px 12px;
  background: rgba(255, 0, 110, 0.1);
  border: 1px solid rgba(255, 0, 110, 0.2);
  border-radius: 8px;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.story-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
}

.stat-item svg {
  width: 16px;
  height: 16px;
}

.story-body {
  margin-bottom: 40px;
}

.story-page {
  display: none;
}

.story-page.active {
  display: block;
}

.story-text {
  font-size: 17px;
  line-height: 1.9;
  color: var(--text-primary);
  word-wrap: break-word;
  text-align: justify;
  max-width: 100%;
  overflow-wrap: break-word;
  hyphens: auto;
}

.story-text :deep(p) {
  margin: 0 0 24px 0;
  padding: 0;
  text-indent: 0;
}

.story-text :deep(p:last-child) {
  margin-bottom: 0;
}

.story-text :deep(br) {
  line-height: 1.9;
}

/* Style for paragraphs with multiple line breaks (spacing) */
.story-text :deep(p + p) {
  margin-top: 24px;
}

.story-text :deep(.story-image-container) {
  margin: 32px 0;
  text-align: center;
}

.story-text :deep(.story-image) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 0, 110, 0.2);
}

.story-text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 32px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 0, 110, 0.2);
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.story-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: var(--dark);
  border-radius: 12px;
  border: 1px solid rgba(255, 0, 110, 0.1);
  margin-top: 40px;
}

.story-pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--dark-lighter);
  border: 2px solid rgba(255, 0, 110, 0.2);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.story-pagination-btn:hover:not(:disabled) {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.story-pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.story-page-info {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.error-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.error-state svg {
  color: #ef4444;
  margin-bottom: 24px;
}

.error-state h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.btn-primary {
  margin-top: 24px;
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .story-detail-page {
    padding: 32px;
  }

  .story-content {
    padding: 32px;
  }

  .story-title-main {
    font-size: 28px;
  }

  .story-text {
    font-size: 16px;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .story-detail-page {
    padding: 16px;
  }

  .story-content {
    padding: 20px;
    border-radius: 12px;
  }

  .story-header {
    margin-bottom: 24px;
    padding-bottom: 20px;
  }

  .back-btn {
    padding: 8px 12px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .back-btn svg {
    width: 16px;
    height: 16px;
  }

  .story-title-main {
    font-size: 22px;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .story-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }

  .story-category {
    font-size: 11px;
    padding: 3px 10px;
  }

  .story-stats {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .stat-item {
    font-size: 13px;
  }

  .stat-item svg {
    width: 14px;
    height: 14px;
  }

  .story-body {
    margin-bottom: 32px;
  }

  .story-text {
    font-size: 16px;
    line-height: 1.8;
    text-align: left; /* Left align on mobile for better readability */
  }

  .story-text :deep(p) {
    margin: 0 0 20px 0;
  }

  .story-text :deep(p + p) {
    margin-top: 20px;
  }

  .story-pagination {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    margin-top: 32px;
  }

  .story-pagination-btn {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 15px;
  }

  .story-page-info {
    text-align: center;
    font-size: 14px;
  }

  .error-state {
    padding: 60px 20px;
  }

  .error-state svg {
    width: 40px;
    height: 40px;
  }

  .error-state h3 {
    font-size: 20px;
  }

  .btn-primary {
    padding: 14px 28px;
    font-size: 15px;
    width: 100%;
    max-width: 200px;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .story-detail-page {
    padding: 12px;
  }

  .story-content {
    padding: 16px;
  }

  .story-title-main {
    font-size: 20px;
  }

  .story-text {
    font-size: 15px;
    line-height: 1.75;
  }

  .story-text :deep(p) {
    margin: 0 0 18px 0;
  }

  .story-text :deep(p + p) {
    margin-top: 18px;
  }

  .back-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .story-pagination {
    padding: 16px;
  }

  .story-pagination-btn {
    padding: 12px 16px;
    font-size: 14px;
  }

  .story-meta {
    font-size: 12px;
  }

  .stat-item {
    font-size: 12px;
  }
}

/* Large Desktop - Optimized reading width */
@media (min-width: 1400px) {
  .story-detail-page {
    max-width: 1000px;
  }

  .story-text {
    font-size: 18px;
    line-height: 2;
  }

  .story-text :deep(p) {
    margin: 0 0 28px 0;
  }
}

/* Extra Large Desktop */
@media (min-width: 1920px) {
  .story-detail-page {
    max-width: 1100px;
  }

  .story-content {
    padding: 48px;
  }

  .story-title-main {
    font-size: 36px;
  }

  .story-text {
    font-size: 19px;
    line-height: 2.1;
  }
}
</style>

