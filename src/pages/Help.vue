<template>
  <div class="help-page">
    <div class="help-container">
      <div class="help-hero">
        <h1 class="help-title">Help Center</h1>
        <p class="help-subtitle">Find answers to common questions and get support</p>
        <div class="help-search">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for help..."
            class="help-search-input"
          />
        </div>
      </div>

      <div class="help-content">
        <div class="help-categories">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="activeCategory = category.id"
            :class="['category-button', { active: activeCategory === category.id }]"
          >
            {{ category.name }}
          </button>
        </div>

        <div class="help-articles">
          <section v-for="category in filteredCategories" :key="category.id" class="help-section">
            <h2 class="section-title">{{ category.name }}</h2>
            <div class="faq-list">
              <div
                v-for="faq in category.faqs"
                :key="faq.id"
                class="faq-item"
                :class="{ open: openFaq === faq.id }"
              >
                <button
                  @click="toggleFaq(faq.id)"
                  class="faq-question"
                >
                  <span>{{ faq.question }}</span>
                  <span class="faq-icon">{{ openFaq === faq.id ? '−' : '+' }}</span>
                </button>
                <div class="faq-answer">
                  <div class="faq-answer-content" v-html="faq.answer"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section class="help-contact">
        <h2>Still Need Help?</h2>
        <p>Can't find what you're looking for? Our support team is here to assist you.</p>
        <router-link to="/contact" class="help-contact-button">Contact Support</router-link>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'Help Center - MovieHub';
  window.scrollTo(0, 0);
});

const searchQuery = ref('');
const activeCategory = ref('all');
const openFaq = ref(null);

const categories = [
  { id: 'all', name: 'All Topics' },
  { id: 'getting-started', name: 'Getting Started' },
  { id: 'account', name: 'Account & Privacy' },
  { id: 'streaming', name: 'Streaming & Features' },
  { id: 'troubleshooting', name: 'Troubleshooting' },
  { id: 'billing', name: 'Billing & Payments' },
  { id: 'content', name: 'Content & Categories' }
];

const allFaqs = [
  {
    id: 1,
    category: 'getting-started',
    question: 'How do I verify my age and create an account?',
    answer: `
      <p>To access MovieHub, you must be 18 years or older. Here's how to get started:</p>
      <ol>
        <li>Click on "Sign Up" or "Register" in the top right corner</li>
        <li>You'll be prompted to verify your age - you must confirm you are 18+</li>
        <li>Enter your email address and create a secure password</li>
        <li>Verify your email through the confirmation link we send</li>
        <li>For premium features, you may need to verify age through payment method</li>
        <li>Set your viewing preferences and privacy settings</li>
        <li>Start exploring content!</li>
      </ol>
      <p><strong>Important:</strong> Age verification is mandatory and cannot be bypassed. We use multiple verification methods to ensure only adults can access our platform.</p>
    `
  },
  {
    id: 2,
    category: 'getting-started',
    question: 'Is MovieHub free? What are the subscription options?',
    answer: `
      <p>MovieHub offers flexible access options:</p>
      <ul>
        <li><strong>Free Access:</strong> Limited access to content with advertisements. Some premium content may be restricted.</li>
        <li><strong>Premium Monthly:</strong> Full access to all content, ad-free streaming, HD/4K quality, downloads, and exclusive features. Billed monthly.</li>
        <li><strong>Premium Annual:</strong> Best value - all premium features at a discounted annual rate.</li>
      </ul>
      <p>Premium subscriptions include:</p>
      <ul>
        <li>Unlimited access to entire content library</li>
        <li>Ad-free viewing experience</li>
        <li>HD and 4K video quality options</li>
        <li>Download videos for offline viewing</li>
        <li>Priority customer support</li>
        <li>Exclusive content and early access to new releases</li>
      </ul>
      <p>You can upgrade, downgrade, or cancel your subscription at any time from your account settings.</p>
    `
  },
  {
    id: 3,
    category: 'getting-started',
    question: 'What devices can I use? Is my viewing private?',
    answer: `
      <p>MovieHub works on all modern devices:</p>
      <ul>
        <li>Desktop/Laptop (Windows, Mac, Linux) - Chrome, Firefox, Safari, Edge</li>
        <li>Mobile phones (iOS 12+, Android 8+) - via mobile browser or PWA</li>
        <li>Tablets (iPad, Android tablets)</li>
        <li>Smart TVs with web browsers</li>
        <li>Streaming devices (Chromecast, Apple TV via AirPlay)</li>
      </ul>
      <p><strong>Privacy Features:</strong></p>
      <ul>
        <li>Your watch history syncs across devices but is completely private</li>
        <li>You can clear watch history at any time</li>
        <li>Private browsing mode available</li>
        <li>No viewing data is shared with third parties</li>
        <li>Discreet billing - charges appear as generic service charges</li>
      </ul>
      <p>For maximum privacy, use incognito/private browsing mode and clear your browser history after viewing.</p>
    `
  },
  {
    id: 16,
    category: 'getting-started',
    question: 'How do I follow my favorite performers or studios?',
    answer: `
      <p>Following performers and studios helps you stay updated on new content:</p>
      <ol>
        <li>Navigate to any video page</li>
        <li>Click the "Follow" or "Star" button next to the performer/studio name</li>
        <li>You'll receive notifications when they release new content</li>
        <li>Access all followed performers from the "Followed Stars" section in your account</li>
      </ol>
      <p>You can also browse by performer or studio from the categories page and follow them directly from their profile pages.</p>
    `
  },
  {
    id: 4,
    category: 'account',
    question: 'How do I change my password?',
    answer: `
      <p>To change your password:</p>
      <ol>
        <li>Go to your Account Settings</li>
        <li>Click on "Security" or "Password"</li>
        <li>Enter your current password</li>
        <li>Enter your new password (make sure it's strong and secure)</li>
        <li>Confirm your new password</li>
        <li>Click "Save Changes"</li>
      </ol>
      <p>If you've forgotten your password, use the "Forgot Password" link on the login page.</p>
    `
  },
  {
    id: 5,
    category: 'account',
    question: 'How do I update my profile information?',
    answer: `
      <p>To update your profile:</p>
      <ol>
        <li>Click on your profile icon in the top right corner</li>
        <li>Select "Account Settings" or "Profile"</li>
        <li>Edit any information you want to change (name, email, preferences, etc.)</li>
        <li>Click "Save Changes"</li>
      </ol>
      <p>You can update your profile picture, display name, and viewing preferences at any time.</p>
    `
  },
  {
    id: 6,
    category: 'account',
    question: 'How do I delete my account?',
    answer: `
      <p>To delete your account:</p>
      <ol>
        <li>Go to Account Settings</li>
        <li>Scroll to the "Account" section</li>
        <li>Click on "Delete Account"</li>
        <li>Confirm your decision by entering your password</li>
        <li>Read the information about what will be deleted</li>
        <li>Click "Permanently Delete Account"</li>
      </ol>
      <p><strong>Warning:</strong> This action cannot be undone. All your data, watch history, and preferences will be permanently deleted.</p>
    `
  },
  {
    id: 7,
    category: 'streaming',
    question: 'Why is my video buffering or loading slowly?',
    answer: `
      <p>Slow buffering can be caused by several factors:</p>
      <ul>
        <li><strong>Internet connection:</strong> Check your internet speed. We recommend at least 5 Mbps for HD streaming</li>
        <li><strong>Network congestion:</strong> Try reducing the number of devices using your network</li>
        <li><strong>Browser cache:</strong> Clear your browser cache and cookies</li>
        <li><strong>Device performance:</strong> Close other applications to free up resources</li>
        <li><strong>Server load:</strong> High traffic times may affect streaming quality</li>
      </ul>
      <p>Try lowering the video quality in the player settings if issues persist.</p>
    `
  },
  {
    id: 8,
    category: 'streaming',
    question: 'How do I change video quality?',
    answer: `
      <p>To change video quality:</p>
      <ol>
        <li>While a video is playing, click on the settings icon (gear icon) in the player</li>
        <li>Select "Quality" from the menu</li>
        <li>Choose your preferred quality:
          <ul>
            <li>Auto (recommended - adjusts based on your connection)</li>
            <li>1080p HD</li>
            <li>720p HD</li>
            <li>480p</li>
            <li>360p</li>
          </ul>
        </li>
      </ol>
      <p>The player will remember your quality preference for future videos.</p>
    `
  },
  {
    id: 9,
    category: 'streaming',
    question: 'Can I download videos for offline viewing? How does it work?',
    answer: `
      <p>Yes! Premium subscribers can download videos for offline viewing:</p>
      <ol>
        <li>Find the video you want to download</li>
        <li>Click the download icon (downward arrow) on the video player or card</li>
        <li>Select your preferred quality (HD, Full HD, or 4K if available)</li>
        <li>Wait for the download to complete (progress shown in notifications)</li>
        <li>Access downloaded videos from the "Downloads" section in your account</li>
      </ol>
      <p><strong>Download Details:</strong></p>
      <ul>
        <li>Downloads are stored locally on your device</li>
        <li>Available for 30 days or until manually deleted</li>
        <li>Maximum 10 downloads at a time (can queue more)</li>
        <li>Downloads are encrypted and can only be played through MovieHub app</li>
        <li>Some exclusive content may have download restrictions</li>
        <li>Downloads sync across devices when logged in</li>
      </ul>
      <p><strong>Privacy Note:</strong> Downloaded videos are stored securely on your device and are not accessible by other apps or users.</p>
    `
  },
  {
    id: 10,
    category: 'streaming',
    question: 'How do I use Watch Later, Favorites, and Playlists?',
    answer: `
      <p>MovieHub offers several ways to save and organize content:</p>
      <p><strong>Watch Later:</strong></p>
      <ol>
        <li>Click the clock icon on any video card or player</li>
        <li>Video is saved to your private Watch Later list</li>
        <li>Access from the Watch Later badge in the navigation bar</li>
        <li>Remove items by clicking the clock icon again</li>
      </ol>
      <p><strong>Favorites:</strong></p>
      <ol>
        <li>Click the heart/star icon on any video</li>
        <li>Video is added to your favorites collection</li>
        <li>Access from your account menu</li>
      </ol>
      <p><strong>Playlists:</strong></p>
      <ol>
        <li>Create custom playlists from the Playlists page</li>
        <li>Add videos to playlists from video pages</li>
        <li>Organize by mood, category, or personal preference</li>
        <li>Share playlists with other users (optional)</li>
      </ol>
      <p>All saved content is private and only visible to you. You can manage all saved items from your account dashboard.</p>
    `
  },
  {
    id: 17,
    category: 'streaming',
    question: 'What video qualities are available? How do I change quality?',
    answer: `
      <p>MovieHub offers multiple video quality options:</p>
      <ul>
        <li><strong>Auto:</strong> Automatically adjusts based on your connection (recommended)</li>
        <li><strong>360p:</strong> Low bandwidth, suitable for slow connections</li>
        <li><strong>480p:</strong> Standard definition</li>
        <li><strong>720p HD:</strong> High definition</li>
        <li><strong>1080p Full HD:</strong> Full high definition (Premium)</li>
        <li><strong>4K Ultra HD:</strong> Ultra high definition (Premium, select content)</li>
      </ul>
      <p>To change quality:</p>
      <ol>
        <li>While video is playing, click the settings/gear icon</li>
        <li>Select "Quality" from the menu</li>
        <li>Choose your preferred quality</li>
        <li>Settings are saved for future videos</li>
      </ol>
      <p><strong>Note:</strong> Higher quality requires faster internet. We recommend at least 5 Mbps for HD and 25 Mbps for 4K streaming.</p>
    `
  },
  {
    id: 11,
    category: 'troubleshooting',
    question: 'The video won\'t play. What should I do?',
    answer: `
      <p>If a video won't play, try these steps:</p>
      <ol>
        <li><strong>Refresh the page:</strong> Press F5 or click the refresh button</li>
        <li><strong>Clear browser cache:</strong> Clear your browser's cache and cookies</li>
        <li><strong>Check your internet:</strong> Ensure you have a stable internet connection</li>
        <li><strong>Try a different browser:</strong> Some browsers may have compatibility issues</li>
        <li><strong>Disable browser extensions:</strong> Ad blockers or other extensions may interfere</li>
        <li><strong>Update your browser:</strong> Make sure you're using the latest version</li>
        <li><strong>Check if JavaScript is enabled:</strong> MovieHub requires JavaScript to function</li>
      </ol>
      <p>If the problem persists, contact our support team with details about the issue.</p>
    `
  },
  {
    id: 12,
    category: 'troubleshooting',
    question: 'I\'m getting an error message. What does it mean?',
    answer: `
      <p>Common error messages and solutions:</p>
      <ul>
        <li><strong>"Video not available":</strong> The content may have been removed or is not available in your region</li>
        <li><strong>"Network error":</strong> Check your internet connection and try again</li>
        <li><strong>"Playback failed":</strong> Try refreshing the page or selecting a different video quality</li>
        <li><strong>"Age verification required":</strong> You need to verify your age to access adult content</li>
        <li><strong>"Account required":</strong> Some content requires you to be logged in</li>
      </ul>
      <p>If you continue to see errors, please contact support with the specific error message.</p>
    `
  },
  {
    id: 13,
    category: 'troubleshooting',
    question: 'The website is not loading properly. How do I fix it?',
    answer: `
      <p>If the website isn't loading correctly:</p>
      <ol>
        <li><strong>Check your internet connection</strong></li>
        <li><strong>Clear browser cache and cookies</strong></li>
        <li><strong>Disable browser extensions</strong> temporarily</li>
        <li><strong>Try incognito/private mode</strong> to rule out extension issues</li>
        <li><strong>Update your browser</strong> to the latest version</li>
        <li><strong>Try a different browser</strong> or device</li>
        <li><strong>Check if JavaScript is enabled</strong></li>
        <li><strong>Disable VPN</strong> if you're using one</li>
      </ol>
      <p>If none of these work, the issue may be on our end. Check our status page or contact support.</p>
    `
  },
  {
    id: 14,
    category: 'billing',
    question: 'How do I cancel my Premium subscription? Will I get a refund?',
    answer: `
      <p>To cancel your Premium subscription:</p>
      <ol>
        <li>Go to Account Settings → Subscription</li>
        <li>Click "Manage Subscription" or "Cancel Subscription"</li>
        <li>Select your reason for cancellation (optional)</li>
        <li>Confirm cancellation</li>
        <li>You'll receive email confirmation</li>
      </ol>
      <p><strong>Important Information:</strong></p>
      <ul>
        <li>Your Premium access continues until the end of your current billing period</li>
        <li>You won't be charged for the next billing cycle</li>
        <li>No refunds for partial billing periods (unless required by law)</li>
        <li>You can reactivate anytime - your preferences and history are saved</li>
        <li>After cancellation, you'll revert to free account with limited access</li>
      </ul>
      <p><strong>Refund Policy:</strong> Refunds are available within 7 days of initial subscription or if you experience technical issues preventing access. Contact support for refund requests.</p>
    `
  },
  {
    id: 18,
    category: 'billing',
    question: 'How does billing work? Is it discreet?',
    answer: `
      <p>MovieHub offers secure and discreet billing:</p>
      <p><strong>Payment Methods:</strong></p>
      <ul>
        <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
        <li>PayPal</li>
        <li>Cryptocurrency (Bitcoin, Ethereum) - for maximum privacy</li>
        <li>Prepaid cards accepted</li>
      </ul>
      <p><strong>Discreet Billing:</strong></p>
      <ul>
        <li>Charges appear as generic service charges on your statement</li>
        <li>No mention of MovieHub or adult content</li>
        <li>Billing name: "MHS Entertainment" or similar generic name</li>
        <li>You can request custom billing descriptor if needed</li>
      </ul>
      <p><strong>Billing Cycle:</strong></p>
      <ul>
        <li>Monthly subscriptions: Charged on the same date each month</li>
        <li>Annual subscriptions: Charged once per year</li>
        <li>Auto-renewal enabled by default (can be disabled)</li>
        <li>Email notifications sent before each charge</li>
      </ul>
      <p>All payments are processed through secure, PCI-DSS compliant payment gateways. We never store your full credit card information.</p>
    `
  },
  {
    id: 15,
    category: 'billing',
    question: 'How do I update my payment method?',
    answer: `
      <p>To update your payment method:</p>
      <ol>
        <li>Go to Account Settings → Billing</li>
        <li>Click "Payment Methods" or "Update Payment"</li>
        <li>Click "Edit" or "Change" next to your current payment method</li>
        <li>Enter your new payment information</li>
        <li>Verify the billing address matches your payment method</li>
        <li>Click "Save" to update</li>
      </ol>
      <p>Your new payment method will be used for all future transactions. We accept major credit cards, PayPal, and cryptocurrency.</p>
      <p><strong>Security:</strong> All payment information is encrypted and processed through secure payment gateways. We never store your full card details.</p>
    `
  },
  {
    id: 19,
    category: 'content',
    question: 'How do I find specific types of content or categories?',
    answer: `
      <p>MovieHub offers multiple ways to discover content:</p>
      <p><strong>Search:</strong></p>
      <ul>
        <li>Use the search bar to find videos by title, performer name, or keywords</li>
        <li>Search supports tags, categories, and studio names</li>
        <li>Advanced filters available on search results page</li>
      </ul>
      <p><strong>Categories:</strong></p>
      <ul>
        <li>Browse by category from the Categories page</li>
        <li>Hundreds of categories available (niche, mainstream, etc.)</li>
        <li>Filter by duration, date added, popularity, or rating</li>
      </ul>
      <p><strong>Recommendations:</strong></p>
      <ul>
        <li>Personalized recommendations based on viewing history</li>
        <li>"Because you watched" suggestions</li>
        <li>Trending content in your preferred categories</li>
        <li>New releases from followed performers/studios</li>
      </ul>
      <p><strong>Filters:</strong></p>
      <ul>
        <li>Filter by performer, studio, duration, date, quality</li>
        <li>Sort by newest, most popular, highest rated, or longest</li>
        <li>Save filter preferences for quick access</li>
      </ul>
    `
  },
  {
    id: 20,
    category: 'account',
    question: 'How do I ensure my viewing is completely private?',
    answer: `
      <p>MovieHub offers several privacy features:</p>
      <p><strong>Account Privacy Settings:</strong></p>
      <ul>
        <li>Disable watch history tracking in account settings</li>
        <li>Clear watch history at any time</li>
        <li>Disable recommendations based on viewing</li>
        <li>Opt out of analytics tracking</li>
      </ul>
      <p><strong>Browser Privacy:</strong></p>
      <ul>
        <li>Use incognito/private browsing mode</li>
        <li>Clear browser cache and cookies after viewing</li>
        <li>Use VPN for additional privacy</li>
        <li>Disable browser extensions that may track activity</li>
      </ul>
      <p><strong>Data Protection:</strong></p>
      <ul>
        <li>We never share viewing data with third parties</li>
        <li>All data is encrypted in transit and at rest</li>
        <li>You can request complete data deletion</li>
        <li>No viewing history is stored if you disable tracking</li>
      </ul>
      <p><strong>Billing Privacy:</strong></p>
      <ul>
        <li>Discreet billing descriptors</li>
        <li>Cryptocurrency payment option for maximum anonymity</li>
        <li>No adult content mentioned in billing</li>
      </ul>
    `
  },
  {
    id: 21,
    category: 'troubleshooting',
    question: 'The video quality is poor or keeps buffering. What can I do?',
    answer: `
      <p>Poor quality or buffering can be caused by several factors:</p>
      <p><strong>Internet Connection:</strong></p>
      <ul>
        <li>Check your internet speed (need at least 5 Mbps for HD)</li>
        <li>Test connection at speedtest.net</li>
        <li>Try reducing video quality in player settings</li>
        <li>Close other apps/streams using bandwidth</li>
        <li>Use wired connection instead of WiFi if possible</li>
      </ul>
      <p><strong>Device Performance:</strong></p>
      <ul>
        <li>Close other browser tabs and applications</li>
        <li>Clear browser cache and cookies</li>
        <li>Update your browser to latest version</li>
        <li>Restart your device</li>
        <li>Check available storage space</li>
      </ul>
      <p><strong>Browser Issues:</strong></p>
      <ul>
        <li>Try a different browser (Chrome, Firefox, Safari, Edge)</li>
        <li>Disable browser extensions temporarily</li>
        <li>Clear browser cache and cookies</li>
        <li>Disable hardware acceleration in browser settings</li>
      </ul>
      <p><strong>CDN/Server Issues:</strong></p>
      <ul>
        <li>Try again in a few minutes (may be temporary server load)</li>
        <li>Check our status page for known issues</li>
        <li>Contact support if problem persists</li>
      </ul>
    `
  }
];

const filteredCategories = computed(() => {
  let filtered = allFaqs;

  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(faq => faq.category === activeCategory.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }

  // Group by category
  const grouped = {};
  filtered.forEach(faq => {
    if (!grouped[faq.category]) {
      grouped[faq.category] = {
        id: faq.category,
        name: categories.find(c => c.id === faq.category)?.name || faq.category,
        faqs: []
      };
    }
    grouped[faq.category].faqs.push(faq);
  });

  return Object.values(grouped);
});

const toggleFaq = (id) => {
  openFaq.value = openFaq.value === id ? null : id;
};
</script>

<style scoped>
.help-page {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  background: var(--dark);
  color: var(--text-primary);
}

.help-container {
  max-width: 1000px;
  margin: 0 auto;
}

.help-hero {
  text-align: center;
  margin-bottom: 50px;
  padding: 40px 0;
}

.help-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 15px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.help-subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 30px;
}

.help-search {
  max-width: 600px;
  margin: 0 auto;
}

.help-search-input {
  width: 100%;
  padding: 15px 20px;
  background: var(--dark-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.3s ease;
}

.help-search-input:focus {
  outline: none;
  /* Focus indicators disabled */
}

.help-search-input::placeholder {
  color: var(--text-secondary);
}

.help-content {
  display: flex;
  gap: 30px;
  margin-bottom: 50px;
}

.help-categories {
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-button {
  padding: 12px 20px;
  background: var(--dark-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.category-button:hover {
  background: var(--dark-lighter);
  color: var(--text-primary);
}

.category-button.active {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
}

.help-articles {
  flex: 1;
}

.help-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 25px;
  color: var(--primary);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.faq-item {
  background: var(--dark-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: var(--primary);
}

.faq-item.open {
  border-color: var(--primary);
}

.faq-question {
  width: 100%;
  padding: 20px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.faq-question:hover {
  color: var(--primary);
}

.faq-icon {
  font-size: 24px;
  font-weight: 300;
  color: var(--primary);
  flex-shrink: 0;
  margin-left: 15px;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-item.open .faq-answer {
  max-height: 1000px;
}

.faq-answer-content {
  padding: 0 20px 20px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.faq-answer-content p {
  margin-bottom: 10px;
}

.faq-answer-content ul,
.faq-answer-content ol {
  margin: 10px 0;
  padding-left: 30px;
}

.faq-answer-content li {
  margin-bottom: 8px;
}

.faq-answer-content strong {
  color: var(--text-primary);
}

.help-contact {
  text-align: center;
  padding: 50px;
  background: var(--dark-light);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.help-contact h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 15px;
  color: var(--primary);
}

.help-contact p {
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 25px;
}

.help-contact-button {
  display: inline-block;
  padding: 15px 40px;
  background: var(--gradient-primary);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.help-contact-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

@media (max-width: 968px) {
  .help-content {
    flex-direction: column;
  }

  .help-categories {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .category-button {
    flex: 1;
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .help-page {
    padding: 30px 15px;
  }

  .help-title {
    font-size: 36px;
  }

  .help-subtitle {
    font-size: 18px;
  }

  .section-title {
    font-size: 24px;
  }

  .help-contact {
    padding: 35px 25px;
  }

  .help-contact h2 {
    font-size: 26px;
  }
}
</style>

