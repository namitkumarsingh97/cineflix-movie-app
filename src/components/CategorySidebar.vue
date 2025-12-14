<template>
  <aside class="category-sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-content">
      <!-- Featured Category -->
      <div class="sidebar-section">
        <h3 class="section-header">CATEGORIES</h3>
        <button
          :class="['sidebar-item', 'featured-item', 'featured-item-divider', { active: route.path === '/hd-4k' }]"
          @click="navigateToHD4K"
        >
          <span class="item-label">4K/HD Only</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', 'featured-item-divider', { active: route.path === '/amateur' }]"
          @click="navigateToAmateur"
        >
          <span class="item-label">Amateur</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', 'featured-item-divider', { active: route.path === '/anal' }]"
          @click="navigateToAnal"
        >
          <span class="item-label">Anal</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/asian' }]"
          @click="navigateToAsian"
        >
          <span class="item-label">Asian</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/behind-the-scenes' }]"
          @click="navigateToBehindTheScenes"
        >
          <span class="item-label">Behind the Scenes</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/bdsm' }]"
          @click="navigateToBdsm"
        >
          <span class="item-label">BDSM</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/big-ass' }]"
          @click="navigateToBigAss"
        >
          <span class="item-label">Big Ass</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/big-dick' }]"
          @click="navigateToBigDick"
        >
          <span class="item-label">Big Dick</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/big-tits' }]"
          @click="navigateToBigTits"
        >
          <span class="item-label">Big Tits</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/bisexual' }]"
          @click="navigateToBisexual"
        >
          <span class="item-label">Bisexual</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/blonde' }]"
          @click="navigateToBlonde"
        >
          <span class="item-label">Blonde</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/blowjob' }]"
          @click="navigateToBlowjob"
        >
          <span class="item-label">Blowjob</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/brunette' }]"
          @click="navigateToBrunette"
        >
          <span class="item-label">Brunette</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/bukkake' }]"
          @click="navigateToBukkake"
        >
          <span class="item-label">Bukkake</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/compilations' }]"
          @click="navigateToCompilations"
        >
          <span class="item-label">Compilations</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/creampie' }]"
          @click="navigateToCreampie"
        >
          <span class="item-label">Creampie</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/cumshot' }]"
          @click="navigateToCumshot"
        >
          <span class="item-label">Cumshot</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/documentaries' }]"
          @click="navigateToDocumentaries"
        >
          <span class="item-label">Documentaries</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/double-penetration' }]"
          @click="navigateToDoublePenetration"
        >
          <span class="item-label">Double Penetration</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/ebony' }]"
          @click="navigateToEbony"
        >
          <span class="item-label">Ebony</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/for-women' }]"
          @click="navigateToForWomen"
        >
          <span class="item-label">For Women</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/group-sex' }]"
          @click="navigateToGroupSex"
        >
          <span class="item-label">Group Sex</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/handjob' }]"
          @click="navigateToHandjob"
        >
          <span class="item-label">Handjob</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/hardcore' }]"
          @click="navigateToHardcore"
        >
          <span class="item-label">Hardcore</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/hentai' }]"
          @click="navigateToHentai"
        >
          <span class="item-label">Hentai</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/homemade' }]"
          @click="navigateToHomemade"
        >
          <span class="item-label">Homemade</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/hotel' }]"
          @click="navigateToHotel"
        >
          <span class="item-label">Hotel</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/housewives' }]"
          @click="navigateToHousewives"
        >
          <span class="item-label">Housewives</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/interracial' }]"
          @click="navigateToInterracial"
        >
          <span class="item-label">Interracial</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/interviews' }]"
          @click="navigateToInterviews"
        >
          <span class="item-label">Interviews</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/latina' }]"
          @click="navigateToLatina"
        >
          <span class="item-label">Latina</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/lesbian' }]"
          @click="navigateToLesbian"
        >
          <span class="item-label">Lesbian</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/live-cams' }]"
          @click="navigateToLiveCams"
        >
          <span class="item-label">Live Cams</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/massage' }]"
          @click="navigateToMassage"
        >
          <span class="item-label">Massage</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/masturbation' }]"
          @click="navigateToMasturbation"
        >
          <span class="item-label">Masturbation</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/mature' }]"
          @click="navigateToMature"
        >
          <span class="item-label">Mature</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/milf' }]"
          @click="navigateToMILF"
        >
          <span class="item-label">MILF</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/nurse' }]"
          @click="navigateToNurse"
        >
          <span class="item-label">Nurse</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/office' }]"
          @click="navigateToOffice"
        >
          <span class="item-label">Office</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/outdoor' }]"
          @click="navigateToOutdoor"
        >
          <span class="item-label">Outdoor</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/parodies' }]"
          @click="navigateToParodies"
        >
          <span class="item-label">Parodies</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/pov' }]"
          @click="navigateToPOV"
        >
          <span class="item-label">POV</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/public' }]"
          @click="navigateToPublic"
        >
          <span class="item-label">Public</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/shemale' }]"
          @click="navigateToShemale"
        >
          <span class="item-label">Shemale</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/sleep' }]"
          @click="navigateToSleep"
        >
          <span class="item-label">Sleep</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/small-tits' }]"
          @click="navigateToSmallTits"
        >
          <span class="item-label">Small Tits</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/squirt' }]"
          @click="navigateToSquirt"
        >
          <span class="item-label">Squirt</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/verified-amateur' }]"
          @click="navigateToVerifiedAmateur"
        >
          <span class="item-label">Verified Amateur</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/vr-360' }]"
          @click="navigateToVR360"
        >
          <span class="item-label">VR/360° Videos</span>
        </button>
        <button
          :class="['sidebar-item', 'featured-item', { active: route.path === '/webcam' }]"
          @click="navigateToWebcam"
        >
          <span class="item-label">Webcam</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  RotateCcw,
  Play,
  ThumbsUp,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import { videosApi } from "../api/videos";
import { useEporner } from "../composables/useEporner";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["filter-change"]);

const router = useRouter();
const route = useRoute();
const { searchVideos } = useEporner();

const selectedTopNav = ref(null);
const selectedProduction = ref("all");
const selectedCategory = ref("all");

const categories = ref([]);
const loadingCategories = ref(false);
const categoryCurrentPage = ref(1);
const categoryTotalPages = ref(1);
const categoryLimit = 20;

// Top navigation items
const topNavItems = [
  { id: "history", label: "History", icon: RotateCcw },
  { id: "newest", label: "Newest videos", icon: Play },
  { id: "best", label: "Best Videos", icon: ThumbsUp },
  { id: "top-rated", label: "Top rated", icon: Star },
  { id: "most-viewed", label: "Most viewed", icon: Eye },
];

// Production items (with sample counts - should come from API)
const productionItems = ref([
  { id: "all", label: "All", count: 0 },
  { id: "professional", label: "Professional", count: 0 },
  { id: "homemade", label: "Homemade", count: 0 },
]);

// Load categories from API
async function loadCategories(page = 1) {
  loadingCategories.value = true;
  try {
    // Try to get categories from API
    const response = await videosApi.getAll({
      page,
      limit: categoryLimit,
    });

    // Extract categories from videos
    const categoryMap = new Map();
    const videos =
      response.data?.data || response.data?.videos || response.data || [];

    videos.forEach((video) => {
      if (video.categories && Array.isArray(video.categories)) {
        video.categories.forEach((cat) => {
          if (cat && cat.trim()) {
            const catName = cat.trim();
            if (!categoryMap.has(catName)) {
              categoryMap.set(catName, { name: catName, count: 0 });
            }
            categoryMap.get(catName).count++;
          }
        });
      }
    });

    categories.value = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Calculate total pages (estimate based on response)
    const total =
      response.data?.total || response.data?.totalCount || videos.length;
    categoryTotalPages.value = Math.ceil(total / categoryLimit) || 1;
    categoryCurrentPage.value = page;
  } catch (error) {
    console.error("Failed to load categories:", error);
    categories.value = [];
  } finally {
    loadingCategories.value = false;
  }
}

function loadCategoryPage(page) {
  if (page >= 1 && page <= categoryTotalPages.value) {
    loadCategories(page);
  }
}

function formatCount(count) {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function selectTopNav(id) {
  selectedTopNav.value = selectedTopNav.value === id ? null : id;
  selectedProduction.value = "all";
  selectedCategory.value = "all";

  // Navigate based on selection
  if (id === "newest") {
    router.push("/videos?order=latest");
  } else if (id === "best") {
    router.push("/videos?order=most-popular");
  } else if (id === "top-rated") {
    router.push("/videos?order=top-rated");
  } else if (id === "most-viewed") {
    router.push("/videos?order=most-popular");
  } else if (id === "history") {
    // Navigate to watch history if available
    router.push("/dashboard?tab=history");
  }

  emit("filter-change", { type: "topNav", value: id });
}

function selectProduction(id) {
  selectedProduction.value = id;
  selectedCategory.value = "all";
  selectedTopNav.value = null;

  // Filter by production type
  const query = id === "all" ? "all" : id;
  searchVideos(query, 1, { order: "most-popular" });
  router.push(`/videos?q=${encodeURIComponent(query)}`);

  emit("filter-change", { type: "production", value: id });
}

function selectCategory(categoryName) {
  selectedCategory.value = categoryName;
  selectedProduction.value = "all";
  selectedTopNav.value = null;

  // Filter by category
  const query = categoryName === "all" ? "all" : categoryName;
  searchVideos(query, 1, { order: "most-popular" });
  router.push(`/videos?q=${encodeURIComponent(query)}`);

  emit("filter-change", { type: "category", value: categoryName });
}

function navigateToDoublePenetration() {
  selectedCategory.value = "double penetration";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/double-penetration");
  emit("filter-change", { type: "category", value: "double penetration" });
}

function navigateToAmateur() {
  selectedCategory.value = "amateur";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/amateur");
  emit("filter-change", { type: "category", value: "amateur" });
}

function navigateToAnal() {
  selectedCategory.value = "anal";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/anal");
  emit("filter-change", { type: "category", value: "anal" });
}

function navigateToAsian() {
  selectedCategory.value = "asian";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/asian");
  emit("filter-change", { type: "category", value: "asian" });
}

function navigateToBdsm() {
  selectedCategory.value = "bdsm";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/bdsm");
  emit("filter-change", { type: "category", value: "bdsm" });
}

function navigateToBigAss() {
  selectedCategory.value = "big ass";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/big-ass");
  emit("filter-change", { type: "category", value: "big ass" });
}

function navigateToBigDick() {
  selectedCategory.value = "big dick";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/big-dick");
  emit("filter-change", { type: "category", value: "big dick" });
}

function navigateToBigTits() {
  selectedCategory.value = "big tits";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/big-tits");
  emit("filter-change", { type: "category", value: "big tits" });
}

function navigateToBisexual() {
  selectedCategory.value = "bisexual";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/bisexual");
  emit("filter-change", { type: "category", value: "bisexual" });
}

function navigateToBlonde() {
  selectedCategory.value = "blonde";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/blonde");
  emit("filter-change", { type: "category", value: "blonde" });
}

function navigateToBlowjob() {
  selectedCategory.value = "blowjob";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/blowjob");
  emit("filter-change", { type: "category", value: "blowjob" });
}

function navigateToBrunette() {
  selectedCategory.value = "brunette";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/brunette");
  emit("filter-change", { type: "category", value: "brunette" });
}

function navigateToBukkake() {
  selectedCategory.value = "bukkake";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/bukkake");
  emit("filter-change", { type: "category", value: "bukkake" });
}

function navigateToCreampie() {
  selectedCategory.value = "creampie";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/creampie");
  emit("filter-change", { type: "category", value: "creampie" });
}

function navigateToCumshot() {
  selectedCategory.value = "cumshot";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/cumshot");
  emit("filter-change", { type: "category", value: "cumshot" });
}

function navigateToEbony() {
  selectedCategory.value = "ebony";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/ebony");
  emit("filter-change", { type: "category", value: "ebony" });
}

function navigateToForWomen() {
  selectedCategory.value = "for women";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/for-women");
  emit("filter-change", { type: "category", value: "for women" });
}

function navigateToGroupSex() {
  selectedCategory.value = "group sex";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/group-sex");
  emit("filter-change", { type: "category", value: "group sex" });
}

function navigateToHandjob() {
  selectedCategory.value = "handjob";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/handjob");
  emit("filter-change", { type: "category", value: "handjob" });
}

function navigateToHardcore() {
  selectedCategory.value = "hardcore";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/hardcore");
  emit("filter-change", { type: "category", value: "hardcore" });
}

function navigateToHentai() {
  selectedCategory.value = "hentai";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/hentai");
  emit("filter-change", { type: "category", value: "hentai" });
}

function navigateToHomemade() {
  selectedCategory.value = "homemade";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/homemade");
  emit("filter-change", { type: "category", value: "homemade" });
}

function navigateToHotel() {
  selectedCategory.value = "hotel";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/hotel");
  emit("filter-change", { type: "category", value: "hotel" });
}

function navigateToHousewives() {
  selectedCategory.value = "housewives";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/housewives");
  emit("filter-change", { type: "category", value: "housewives" });
}

function navigateToInterracial() {
  selectedCategory.value = "interracial";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/interracial");
  emit("filter-change", { type: "category", value: "interracial" });
}

function navigateToLatina() {
  selectedCategory.value = "latina";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/latina");
  emit("filter-change", { type: "category", value: "latina" });
}

function navigateToLesbian() {
  selectedCategory.value = "lesbian";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/lesbian");
  emit("filter-change", { type: "category", value: "lesbian" });
}

function navigateToMassage() {
  selectedCategory.value = "massage";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/massage");
  emit("filter-change", { type: "category", value: "massage" });
}

function navigateToMasturbation() {
  selectedCategory.value = "masturbation";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/masturbation");
  emit("filter-change", { type: "category", value: "masturbation" });
}

function navigateToMature() {
  selectedCategory.value = "mature";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/mature");
  emit("filter-change", { type: "category", value: "mature" });
}

function navigateToMILF() {
  selectedCategory.value = "milf";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/milf");
  emit("filter-change", { type: "category", value: "milf" });
}

function navigateToNurse() {
  selectedCategory.value = "nurse";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/nurse");
  emit("filter-change", { type: "category", value: "nurse" });
}

function navigateToOffice() {
  selectedCategory.value = "office";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/office");
  emit("filter-change", { type: "category", value: "office" });
}

function navigateToOutdoor() {
  selectedCategory.value = "outdoor";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/outdoor");
  emit("filter-change", { type: "category", value: "outdoor" });
}

function navigateToPOV() {
  selectedCategory.value = "pov";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/pov");
  emit("filter-change", { type: "category", value: "pov" });
}

function navigateToPublic() {
  selectedCategory.value = "public";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/public");
  emit("filter-change", { type: "category", value: "public" });
}

function navigateToShemale() {
  selectedCategory.value = "shemale";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/shemale");
  emit("filter-change", { type: "category", value: "shemale" });
}

function navigateToSleep() {
  selectedCategory.value = "sleep";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/sleep");
  emit("filter-change", { type: "category", value: "sleep" });
}

function navigateToSmallTits() {
  selectedCategory.value = "small tits";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/small-tits");
  emit("filter-change", { type: "category", value: "small tits" });
}

function navigateToSquirt() {
  selectedCategory.value = "squirt";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/squirt");
  emit("filter-change", { type: "category", value: "squirt" });
}

function navigateToVR360() {
  selectedCategory.value = "vr 360";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/vr-360");
  emit("filter-change", { type: "category", value: "vr 360" });
}

function navigateToHD4K() {
  selectedCategory.value = "4k hd";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/hd-4k");
  emit("filter-change", { type: "category", value: "4k hd" });
}

function navigateToVerifiedAmateur() {
  selectedCategory.value = "verified amateur";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/verified-amateur");
  emit("filter-change", { type: "category", value: "verified amateur" });
}

function navigateToLiveCams() {
  selectedCategory.value = "live cam";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/live-cams");
  emit("filter-change", { type: "category", value: "live cam" });
}

function navigateToCompilations() {
  selectedCategory.value = "compilation";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/compilations");
  emit("filter-change", { type: "category", value: "compilation" });
}

function navigateToBehindTheScenes() {
  selectedCategory.value = "behind the scenes";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/behind-the-scenes");
  emit("filter-change", { type: "category", value: "behind the scenes" });
}

function navigateToInterviews() {
  selectedCategory.value = "interview";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/interviews");
  emit("filter-change", { type: "category", value: "interview" });
}

function navigateToParodies() {
  selectedCategory.value = "parody";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/parodies");
  emit("filter-change", { type: "category", value: "parody" });
}

function navigateToDocumentaries() {
  selectedCategory.value = "documentary";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/documentaries");
  emit("filter-change", { type: "category", value: "documentary" });
}

function navigateToWebcam() {
  selectedCategory.value = "webcam";
  selectedProduction.value = "all";
  selectedTopNav.value = null;
  router.push("/webcam");
  emit("filter-change", { type: "category", value: "webcam" });
}

// Load initial categories
onMounted(() => {
  loadCategories(1);

  // Load production counts (sample - should come from API)
  // For now, we'll estimate based on total videos
  videosApi
    .getAll({ limit: 1 })
    .then((response) => {
      const total = response.data?.total || response.data?.totalCount || 0;
      productionItems.value[0].count = total;
      // Estimate: 70% professional, 30% homemade
      productionItems.value[1].count = Math.floor(total * 0.7);
      productionItems.value[2].count = Math.floor(total * 0.3);
    })
    .catch(() => {
      // Ignore errors
    });
});
</script>

<style scoped>
.category-sidebar {
  position: sticky;
  top: 64px; /* Below navbar */
  align-self: flex-start;
  width: 280px;
  max-height: calc(100vh - 64px);
  background: var(--dark-light);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  z-index: 90;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  height: fit-content;
}

.sidebar-content {
  padding: 20px 0;
}

.sidebar-section {
  margin-bottom: 30px;
  padding: 0 16px;
}

.sidebar-section:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
}

.section-header {
  font-size: 13px; /* Larger */
  font-weight: 800; /* Bolder */
  color: var(--accent); /* Use CSS variable */
  text-transform: uppercase;
  letter-spacing: 1.2px; /* More spacing */
  margin-bottom: 12px;
  padding: 0 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px; /* More padding */
  font-size: 14px; /* Larger font */
  font-weight: 500; /* Slightly bolder */
  margin-bottom: 4px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  gap: 12px;
}

.sidebar-item:hover {
  background: var(--dark-lighter);
  color: var(--text-primary);
  transform: translateX(4px); /* Subtle slide effect */
  transition: all 0.2s ease;
}

.sidebar-item.active {
  background: rgba(230, 57, 70, 0.2); /* Use new primary color */
  color: var(--primary);
  font-weight: 700; /* Bolder */
  border-left: 3px solid var(--primary); /* Visual indicator */
  padding-left: 13px; /* Adjust for border */
}

.sidebar-item.active .item-count {
  color: var(--primary);
  font-weight: 700;
}

.sidebar-item svg {
  flex-shrink: 0;
  opacity: 0.8;
}

.sidebar-item.active svg {
  opacity: 1;
  color: var(--primary);
  transform: scale(1.1);
}

.featured-item {
  font-weight: 600;
}

.featured-item:hover {
  background: var(--dark-lighter);
}

.featured-item.active {
  background: rgba(255, 69, 0, 0.15);
  border: 1px solid rgba(255, 69, 0, 0.3);
  color: #ff4500;
}

.featured-item.active:hover {
  background: rgba(255, 69, 0, 0.2);
  border-color: rgba(255, 69, 0, 0.5);
}

.featured-item-divider {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 4px;
  padding-bottom: 10px;
}

.item-label {
  flex: 1;
  text-align: left;
}

.item-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.categories-list {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.categories-list::-webkit-scrollbar {
  width: 6px;
}

.categories-list::-webkit-scrollbar-track {
  background: var(--dark);
}

.categories-list::-webkit-scrollbar-thumb {
  background: var(--dark-lighter);
  border-radius: 3px;
}

.categories-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-color);
}

.category-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
  margin-top: 12px;
  border-top: 1px solid var(--border-color);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--dark-lighter);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--gradient-primary);
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
}

/* Responsive: Hide on mobile - categories are in mobile menu instead */
@media (max-width: 1024px) {
  .category-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .category-sidebar {
    width: 260px;
    top: 56px;
    height: calc(100vh - 56px);
  }
}

@media (max-width: 480px) {
  .category-sidebar {
    width: 240px;
    top: 52px;
    height: calc(100vh - 52px);
  }

  .sidebar-section {
    padding: 0 12px;
  }

  .sidebar-item {
    padding: 8px 10px;
    font-size: 13px;
  }

  .item-count {
    font-size: 12px;
  }
}
</style>
