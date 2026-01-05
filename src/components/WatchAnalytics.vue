<template>
  <div class="watch-analytics-dashboard">
    <div class="analytics-header">
      <h2 class="analytics-title">
        <BarChart3 :size="24" />
        <span>Your Watch Analytics</span>
      </h2>
      <button class="close-btn" @click="$emit('close')" title="Close">
        <X :size="20" />
      </button>
    </div>

    <div class="analytics-content">
      <!-- Overview Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <Clock :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalWatchTime }}</div>
            <div class="stat-label">Total Watch Time</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <Play :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalVideosWatched }}</div>
            <div class="stat-label">Videos Watched</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <Heart :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalFavorites }}</div>
            <div class="stat-label">Favorites</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <TrendingUp :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ averageWatchDuration }}</div>
            <div class="stat-label">Avg. Watch Duration</div>
          </div>
        </div>
      </div>

      <!-- Top Categories -->
      <div class="analytics-section">
        <h3 class="section-title">
          <FolderOpen :size="20" />
          <span>Top Categories</span>
        </h3>
        <div class="categories-list">
          <div
            v-for="(category, index) in topCategories"
            :key="category.name"
            class="category-item"
          >
            <div class="category-rank">{{ index + 1 }}</div>
            <div class="category-info">
              <span class="category-name">{{ category.name }}</span>
              <div class="category-bar">
                <div
                  class="category-bar-fill"
                  :style="{ width: `${(category.count / topCategories[0].count) * 100}%` }"
                ></div>
              </div>
            </div>
            <div class="category-count">{{ category.count }} videos</div>
          </div>
        </div>
      </div>

      <!-- Peak Viewing Times -->
      <div class="analytics-section">
        <h3 class="section-title">
          <Clock :size="20" />
          <span>Peak Viewing Times</span>
        </h3>
        <div class="viewing-times">
          <div
            v-for="time in peakViewingTimes"
            :key="time.hour"
            class="time-item"
          >
            <div class="time-hour">{{ formatHour(time.hour) }}</div>
            <div class="time-bar">
              <div
                class="time-bar-fill"
                :style="{ width: `${(time.count / peakViewingTimes[0].count) * 100}%` }"
              ></div>
            </div>
            <div class="time-count">{{ time.count }} sessions</div>
          </div>
        </div>
      </div>

      <!-- Watch Patterns -->
      <div class="analytics-section">
        <h3 class="section-title">
          <Activity :size="20" />
          <span>Watch Patterns</span>
        </h3>
        <div class="patterns-grid">
          <div class="pattern-card">
            <div class="pattern-label">Most Active Day</div>
            <div class="pattern-value">{{ mostActiveDay }}</div>
          </div>
          <div class="pattern-card">
            <div class="pattern-label">Weekly Average</div>
            <div class="pattern-value">{{ weeklyAverage }} videos</div>
          </div>
          <div class="pattern-card">
            <div class="pattern-label">Longest Session</div>
            <div class="pattern-value">{{ longestSession }}</div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="analytics-section">
        <h3 class="section-title">
          <Award :size="20" />
          <span>Your Badges</span>
        </h3>
        <div class="badges-grid">
          <div
            v-for="badge in earnedBadges"
            :key="badge.id"
            class="badge-item"
            :class="{ earned: badge.earned }"
            :title="badge.description"
          >
            <div class="badge-icon">{{ badge.icon }}</div>
            <div class="badge-name">{{ badge.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
	Activity,
	Award,
	BarChart3,
	Clock,
	FolderOpen,
	Heart,
	Play,
	TrendingUp,
	X,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useGuestSession } from "../composables/useGuestSession";
import { useFavorites, useWatchHistory } from "../composables/useWatchHistory";

const emit = defineEmits(["close"]);

const router = useRouter();
const { getHistory } = useWatchHistory();
const { getFavorites } = useFavorites();
const { isGuest, getSessionInfo } = useGuestSession();
const { isAuthenticated } = useAuth();

const watchHistory = ref([]);
const favorites = ref([]);
const isGuestUser = computed(() => isGuest() || !isAuthenticated.value);
const guestSessionInfo = computed(() =>
	isGuestUser.value ? getSessionInfo() : null,
);
const analytics = ref({
	totalWatchTime: 0,
	totalVideos: 0,
	topCategories: [],
	peakViewingTimes: [],
	watchPatterns: {},
});

// Computed stats
const totalWatchTime = computed(() => {
	const totalSeconds = watchHistory.value.reduce((sum, item) => {
		return sum + (item.duration || 0);
	}, 0);
	return formatDuration(totalSeconds);
});

const totalVideosWatched = computed(() => watchHistory.value.length);

const totalFavorites = computed(() => favorites.value.length);

const averageWatchDuration = computed(() => {
	if (watchHistory.value.length === 0) return "0:00";
	const total = watchHistory.value.reduce(
		(sum, item) => sum + (item.duration || 0),
		0,
	);
	const avg = total / watchHistory.value.length;
	return formatDuration(avg);
});

const topCategories = computed(() => {
	const categoryCount = new Map();
	watchHistory.value.forEach((item) => {
		if (item.category) {
			categoryCount.set(
				item.category,
				(categoryCount.get(item.category) || 0) + 1,
			);
		}
	});

	return Array.from(categoryCount.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);
});

const peakViewingTimes = computed(() => {
	const hourCount = new Map();
	watchHistory.value.forEach((item) => {
		if (item.watchedAt) {
			const hour = new Date(item.watchedAt).getHours();
			hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
		}
	});

	return Array.from(hourCount.entries())
		.map(([hour, count]) => ({ hour, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);
});

const mostActiveDay = computed(() => {
	const dayCount = new Map();
	watchHistory.value.forEach((item) => {
		if (item.watchedAt) {
			const day = new Date(item.watchedAt).toLocaleDateString("en-US", {
				weekday: "long",
			});
			dayCount.set(day, (dayCount.get(day) || 0) + 1);
		}
	});

	if (dayCount.size === 0) return "N/A";
	return Array.from(dayCount.entries()).sort((a, b) => b[1] - a[1])[0][0];
});

const weeklyAverage = computed(() => {
	if (watchHistory.value.length === 0) return 0;
	const weeks = Math.max(
		1,
		Math.ceil(
			(Date.now() -
				new Date(
					watchHistory.value[watchHistory.value.length - 1].watchedAt,
				).getTime()) /
				(7 * 24 * 60 * 60 * 1000),
		),
	);
	return Math.round(watchHistory.value.length / weeks);
});

const longestSession = computed(() => {
	if (watchHistory.value.length === 0) return "0:00";
	const maxDuration = Math.max(
		...watchHistory.value.map((item) => item.duration || 0),
	);
	return formatDuration(maxDuration);
});

const earnedBadges = computed(() => {
	const badges = [
		{
			id: "first-watch",
			name: "First Watch",
			icon: "🎬",
			description: "Watched your first video",
			earned: watchHistory.value.length > 0,
		},
		{
			id: "night-owl",
			name: "Night Owl",
			icon: "🦉",
			description: "Watched videos after midnight",
			earned: peakViewingTimes.value.some((t) => t.hour >= 0 && t.hour < 6),
		},
		{
			id: "early-bird",
			name: "Early Bird",
			icon: "🐦",
			description: "Watched videos before 8 AM",
			earned: peakViewingTimes.value.some((t) => t.hour >= 5 && t.hour < 8),
		},
		{
			id: "marathon",
			name: "Marathon",
			icon: "🏃",
			description: "Watched 10+ videos in a day",
			earned: false,
		}, // Would need daily tracking
		{
			id: "explorer",
			name: "Explorer",
			icon: "🗺️",
			description: "Watched 5+ different categories",
			earned: topCategories.value.length >= 5,
		},
		{
			id: "collector",
			name: "Collector",
			icon: "⭐",
			description: "Added 10+ favorites",
			earned: favorites.value.length >= 10,
		},
		{
			id: "dedicated",
			name: "Dedicated",
			icon: "💪",
			description: "Watched 50+ videos",
			earned: watchHistory.value.length >= 50,
		},
		{
			id: "veteran",
			name: "Veteran",
			icon: "👑",
			description: "Watched 100+ videos",
			earned: watchHistory.value.length >= 100,
		},
	];

	return badges;
});

function formatDuration(seconds) {
	if (!seconds || isNaN(seconds)) return "0:00";
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatHour(hour) {
	if (hour === 0) return "12 AM";
	if (hour < 12) return `${hour} AM`;
	if (hour === 12) return "12 PM";
	return `${hour - 12} PM`;
}

function calculateAnalytics() {
	watchHistory.value = getHistory();
	favorites.value = getFavorites();
}

function handleSignupClick() {
	if (emit) {
		emit("close");
	}
	// Navigation handled by router-link
}

onMounted(() => {
	calculateAnalytics();
});
</script>

<style scoped>
.watch-analytics-dashboard {
  background: var(--bg-secondary, #1a1a2e);
  border-radius: 12px;
  padding: 24px;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary, #ffffff);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.analytics-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #ffffff);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.guest-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 69, 0, 0.1);
  border: 1px solid rgba(255, 69, 0, 0.3);
  border-radius: 8px;
}

.guest-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary, #ff4500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.signup-link {
  font-size: 12px;
  color: var(--text-primary, #ffffff);
  text-decoration: none;
  transition: color 0.2s ease;
}

.signup-link:hover {
  color: var(--primary, #ff4500);
  text-decoration: underline;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
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
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--gradient-primary, linear-gradient(135deg, #ff4500, #ff6b35));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.analytics-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary, #ffffff);
}

.categories-list,
.viewing-times {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item,
.time-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.category-rank,
.time-hour {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--gradient-primary, linear-gradient(135deg, #ff4500, #ff6b35));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.category-info,
.time-bar {
  flex: 1;
}

.category-name {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-primary, #ffffff);
}

.category-bar,
.time-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.category-bar-fill,
.time-bar-fill {
  height: 100%;
  background: var(--gradient-primary, linear-gradient(135deg, #ff4500, #ff6b35));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.category-count,
.time-count {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  white-space: nowrap;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.pattern-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.pattern-label {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pattern-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.badge-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.badge-item.earned {
  opacity: 1;
  background: rgba(255, 69, 0, 0.1);
  border: 1px solid rgba(255, 69, 0, 0.3);
}

.badge-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

@media (max-width: 768px) {
  .watch-analytics-dashboard {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .patterns-grid {
    grid-template-columns: 1fr;
  }
}
</style>

