<template>
  <div class="watch-party-room">
    <div class="party-header">
      <div class="party-info">
        <h2 class="party-title">
          <Users :size="24" />
          <span>Watch Party</span>
        </h2>
        <div class="party-meta">
          <span class="room-id">Room: {{ roomId }}</span>
          <span class="participant-count">{{ participantCount }} watching</span>
        </div>
      </div>
      <div class="party-actions">
        <button class="invite-btn" @click="copyInviteLink" title="Copy invite link">
          <Share2 :size="18" />
          <span>Invite</span>
        </button>
        <button class="leave-btn" @click="handleLeave" title="Leave party">
          <X :size="18" />
          <span>Leave</span>
        </button>
      </div>
    </div>

    <div class="party-content">
      <!-- Participants List -->
      <div class="participants-section">
        <h3 class="section-title">Participants</h3>
        <div class="participants-list">
          <div
            v-for="participant in participants"
            :key="participant.id"
            class="participant-item"
            :class="{ 'is-host': participant.isHost }"
          >
            <div class="participant-avatar">
              {{ getInitials(participant.name || 'User') }}
            </div>
            <div class="participant-info">
              <div class="participant-name">
                {{ participant.name || 'Anonymous' }}
                <span v-if="participant.isHost" class="host-badge">Host</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Section -->
      <div class="chat-section">
        <h3 class="section-title">Chat</h3>
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="message in chatMessages"
            :key="message.id"
            class="chat-message"
            :class="{ 'own-message': message.isOwn }"
          >
            <div class="message-author">{{ message.author }}</div>
            <div class="message-text">{{ message.message }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        <div class="chat-input-container">
          <input
            v-model="chatInput"
            type="text"
            placeholder="Type a message..."
            class="chat-input"
            @keyup.enter="sendChatMessage"
            maxlength="500"
          />
          <button class="chat-send-btn" @click="sendChatMessage" :disabled="!chatInput.trim()">
            <Send :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Users, Share2, X, Send } from 'lucide-vue-next';
import { useSocialWatchParty } from '../composables/useSocialWatchParty';

const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['leave']);

const {
  participants,
  chatMessages,
  isHost,
  sendMessage,
  leaveRoom,
  getRoomInfo,
} = useSocialWatchParty();

const chatInput = ref('');
const chatMessagesRef = ref(null);

const participantCount = computed(() => participants.value.length + 1); // +1 for current user

function sendChatMessage() {
  if (!chatInput.value.trim()) return;

  sendMessage(chatInput.value, 'You');
  chatInput.value = '';

  // Scroll to bottom
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
}

function copyInviteLink() {
  const roomInfo = getRoomInfo();
  const inviteLink = `${window.location.origin}/watch-party/${roomInfo.roomId}`;
  
  navigator.clipboard.writeText(inviteLink).then(() => {
    // Show toast notification (would implement toast system)
    alert('Invite link copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function handleLeave() {
  leaveRoom();
  emit('leave');
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

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Auto-scroll chat when new messages arrive
watch(chatMessages, () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
}, { deep: true });
</script>

<style scoped>
.watch-party-room {
  background: var(--bg-secondary, #1a1a2e);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.party-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.party-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 8px 0;
}

.party-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.party-actions {
  display: flex;
  gap: 8px;
}

.invite-btn,
.leave-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.invite-btn {
  background: rgba(255, 69, 0, 0.2);
  color: var(--primary, #ff4500);
  border: 1px solid rgba(255, 69, 0, 0.3);
}

.invite-btn:hover {
  background: rgba(255, 69, 0, 0.3);
}

.leave-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.leave-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.party-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

.participants-section,
.chat-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 16px 0;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.participant-item.is-host {
  background: rgba(255, 69, 0, 0.1);
  border: 1px solid rgba(255, 69, 0, 0.3);
}

.participant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-primary, linear-gradient(135deg, #ff4500, #ff6b35));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.participant-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #ffffff);
  display: flex;
  align-items: center;
  gap: 8px;
}

.host-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--primary, #ff4500);
  border-radius: 4px;
  color: white;
  text-transform: uppercase;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding-right: 8px;
}

.chat-message {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  max-width: 80%;
}

.chat-message.own-message {
  background: rgba(255, 69, 0, 0.2);
  align-self: flex-end;
  margin-left: auto;
}

.message-author {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 4px;
}

.message-text {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.9));
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 10px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
}

.chat-input-container {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary, #ff4500);
}

.chat-send-btn {
  padding: 12px;
  background: var(--primary, #ff4500);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-send-btn:hover:not(:disabled) {
  background: #ff6b35;
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .party-content {
    grid-template-columns: 1fr;
  }

  .party-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>

