<template>
  <div class="creator-studio-page">
    <div class="studio-header">
      <h1 class="studio-title">
        <Palette :size="32" />
        <span>Creator Studio</span>
      </h1>
      <p class="studio-subtitle">Manage your content, analytics, and fan engagement</p>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon views">
          <Eye :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(analytics.views.total) }}</div>
          <div class="stat-label">Total Views</div>
          <div class="stat-trend positive">{{ analytics.views.trend }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon engagement">
          <Heart :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(analytics.engagement.likes) }}</div>
          <div class="stat-label">Total Likes</div>
          <div class="stat-trend positive">{{ analytics.engagement.engagementRate }}% engagement</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon subscribers">
          <Users :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(analytics.audience.subscribers) }}</div>
          <div class="stat-label">Subscribers</div>
          <div class="stat-trend positive">Growing</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue">
          <DollarSign :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">${{ formatNumber(revenue.total) }}</div>
          <div class="stat-label">Total Revenue</div>
          <div class="stat-trend positive">{{ revenue.trend }}</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="studio-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" :size="18" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Analytics Tab -->
      <div v-show="activeTab === 'analytics'" class="tab-panel">
        <div class="analytics-grid">
          <div class="analytics-card">
            <h3 class="card-title">Views Over Time</h3>
            <div class="chart-placeholder">
              <BarChart3 :size="48" />
              <p>Chart visualization would go here</p>
            </div>
          </div>

          <div class="analytics-card">
            <h3 class="card-title">Top Performing Content</h3>
            <div class="top-content-list">
              <div
                v-for="(video, index) in topContent"
                :key="video.id"
                class="content-item"
              >
                <div class="content-rank">#{{ index + 1 }}</div>
                <div class="content-info">
                  <div class="content-title">{{ video.title }}</div>
                  <div class="content-stats">
                    <span>{{ formatNumber(video.views) }} views</span>
                    <span>•</span>
                    <span>{{ formatNumber(video.likes) }} likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <h3 class="card-title">Audience Demographics</h3>
            <div class="demographics">
              <div class="demo-item">
                <span class="demo-label">Age Range</span>
                <span class="demo-value">18-34 (65%)</span>
              </div>
              <div class="demo-item">
                <span class="demo-label">Gender</span>
                <span class="demo-value">Mixed</span>
              </div>
              <div class="demo-item">
                <span class="demo-label">Top Countries</span>
                <span class="demo-value">US, UK, CA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Suggestions Tab -->
      <div v-show="activeTab === 'suggestions'" class="tab-panel">
        <div class="suggestions-list">
          <div
            v-for="suggestion in contentSuggestions"
            :key="suggestion.type"
            class="suggestion-card"
            :class="`priority-${suggestion.priority}`"
          >
            <div class="suggestion-header">
              <div class="suggestion-type">{{ suggestion.type.toUpperCase() }}</div>
              <div class="suggestion-priority" :class="suggestion.priority">
                {{ suggestion.priority }}
              </div>
            </div>
            <div class="suggestion-message">{{ suggestion.message }}</div>
            <div class="suggestion-action">{{ suggestion.action }}</div>
            <button class="suggestion-apply-btn">Apply Suggestion</button>
          </div>
        </div>
      </div>

      <!-- Fan Messages Tab -->
      <div v-show="activeTab === 'messages'" class="tab-panel">
        <div class="messages-container">
          <div v-if="fanMessages.length === 0" class="empty-messages">
            <MessageSquare :size="48" />
            <p>No fan messages yet</p>
          </div>
          <div v-else class="messages-list">
            <div
              v-for="message in fanMessages"
              :key="message.id"
              class="message-item"
            >
              <div class="message-avatar">
                {{ getInitials(message.fanName) }}
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-author">{{ message.fanName }}</span>
                  <span class="message-date">{{ formatTimeAgo(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.text }}</div>
                <button class="reply-btn" @click="replyToFan(message)">Reply</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Tab -->
      <div v-show="activeTab === 'revenue'" class="tab-panel">
        <div class="revenue-grid">
          <div class="revenue-card">
            <h3 class="card-title">Revenue Breakdown</h3>
            <div class="revenue-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Subscriptions</span>
                <span class="breakdown-value">${{ formatNumber(revenue.breakdown.subscriptions) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Tips</span>
                <span class="breakdown-value">${{ formatNumber(revenue.breakdown.tips) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Premium Content</span>
                <span class="breakdown-value">${{ formatNumber(revenue.breakdown.premium) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Ads</span>
                <span class="breakdown-value">${{ formatNumber(revenue.breakdown.ads) }}</span>
              </div>
            </div>
          </div>

          <div class="revenue-card">
            <h3 class="card-title">Projected Revenue</h3>
            <div class="projections">
              <div class="projection-item">
                <span class="projection-label">Next Month</span>
                <span class="projection-value">${{ formatNumber(revenue.projected.nextMonth) }}</span>
              </div>
              <div class="projection-item">
                <span class="projection-label">Next Quarter</span>
                <span class="projection-value">${{ formatNumber(revenue.projected.nextQuarter) }}</span>
              </div>
              <div class="projection-item">
                <span class="projection-label">Next Year</span>
                <span class="projection-value">${{ formatNumber(revenue.projected.nextYear) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Palette,
  Eye,
  Heart,
  Users,
  DollarSign,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Mail,
  Wallet,
} from 'lucide-vue-next';
import { useCreatorStudio } from '../composables/useCreatorStudio';

const { getAnalytics, getContentSuggestions, getFanMessages, getRevenueBreakdown, sendFanMessage } = useCreatorStudio();

const activeTab = ref('analytics');
const tabs = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'suggestions', label: 'AI Suggestions', icon: Lightbulb },
  { id: 'messages', label: 'Fan Messages', icon: Mail },
  { id: 'revenue', label: 'Revenue', icon: Wallet },
];

const analytics = computed(() => getAnalytics('30d'));
const contentSuggestions = computed(() => getContentSuggestions());
const fanMessages = computed(() => getFanMessages());
const revenue = computed(() => getRevenueBreakdown());
const topContent = computed(() => {
  // Mock top content - in production, would come from API
  return [
    { id: '1', title: 'Sample Video 1', views: 12500, likes: 850 },
    { id: '2', title: 'Sample Video 2', views: 9800, likes: 720 },
    { id: '3', title: 'Sample Video 3', views: 7600, likes: 580 },
  ];
});

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function replyToFan(message) {
  const reply = prompt(`Reply to ${message.fanName}:`);
  if (reply) {
    sendFanMessage(message.fanId, reply);
  }
}

onMounted(() => {
  // Load initial data
  getAnalytics('30d');
  getContentSuggestions();
  getFanMessages();
  getRevenueBreakdown();
});
</script>

<style scoped>
.creator-studio-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.studio-header {
  margin-bottom: 32px;
}

.studio-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0 0 8px 0;
}

.studio-subtitle {
  font-size: 16px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin: 0;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.views {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.engagement {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-icon.subscribers {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.positive {
  color: #43e97b;
}

.studio-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.tab-btn:hover {
  color: var(--text-primary, #ffffff);
}

.tab-btn.active {
  color: var(--primary, #ff4500);
  border-bottom-color: var(--primary, #ff4500);
}

.tab-content {
  min-height: 400px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.analytics-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 16px 0;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  gap: 12px;
}

.top-content-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.content-rank {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--primary, #ff4500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.content-info {
  flex: 1;
}

.content-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #ffffff);
  margin-bottom: 4px;
}

.content-stats {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  display: flex;
  gap: 8px;
}

.demographics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.demo-label {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.demo-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid;
}

.suggestion-card.priority-high {
  border-left-color: #f5576c;
}

.suggestion-card.priority-medium {
  border-left-color: #ffd700;
}

.suggestion-card.priority-low {
  border-left-color: #43e97b;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.suggestion-type {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-priority {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.suggestion-priority.high {
  background: rgba(245, 87, 108, 0.2);
  color: #f5576c;
}

.suggestion-priority.medium {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.suggestion-priority.low {
  background: rgba(67, 233, 123, 0.2);
  color: #43e97b;
}

.suggestion-message {
  font-size: 16px;
  color: var(--text-primary, #ffffff);
  margin-bottom: 8px;
}

.suggestion-action {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin-bottom: 12px;
}

.suggestion-apply-btn {
  padding: 8px 16px;
  background: var(--primary, #ff4500);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-apply-btn:hover {
  background: #ff6b35;
}

.messages-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  gap: 12px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary, linear-gradient(135deg, #ff4500, #ff6b35));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.message-date {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
}

.message-text {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.9));
  margin-bottom: 8px;
  line-height: 1.5;
}

.reply-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--text-primary, #ffffff);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reply-btn:hover {
  border-color: var(--primary, #ff4500);
  color: var(--primary, #ff4500);
}

.revenue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.revenue-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
}

.revenue-breakdown,
.projections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item,
.projection-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.breakdown-label,
.projection-label {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.breakdown-value,
.projection-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

@media (max-width: 768px) {
  .creator-studio-page {
    padding: 16px;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .analytics-grid,
  .revenue-grid {
    grid-template-columns: 1fr;
  }

  .studio-tabs {
    overflow-x: auto;
  }
}
</style>

