import { ref, computed } from 'vue';

/**
 * Social Watch Parties - Synchronized Group Viewing
 * WebRTC-based synchronized video playback with chat
 */
export function useSocialWatchParty() {
  const isHost = ref(false);
  const roomId = ref(null);
  const participants = ref([]);
  const isConnected = ref(false);
  const chatMessages = ref([]);
  const currentVideo = ref(null);
  const playbackState = ref({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
  });

  // WebRTC/WebSocket connection (would use real implementation)
  const connection = ref(null);
  const dataChannel = ref(null);

  /**
   * Create a new watch party room
   * @param {Object} video - Video to watch
   * @param {Object} options - Room options
   */
  function createRoom(video, options = {}) {
    const {
      isPrivate = true,
      maxParticipants = 10,
      allowGuests = false,
    } = options;

    // Generate unique room ID
    roomId.value = generateRoomId();
    isHost.value = true;
    currentVideo.value = video;

    // Initialize connection (would use WebRTC/WebSocket in production)
    initializeConnection();

    return {
      roomId: roomId.value,
      inviteLink: `${window.location.origin}/watch-party/${roomId.value}`,
    };
  }

  /**
   * Join an existing watch party room
   * @param {string} roomIdToJoin - Room ID to join
   */
  function joinRoom(roomIdToJoin) {
    roomId.value = roomIdToJoin;
    isHost.value = false;

    // Initialize connection
    initializeConnection();

    // Request current state from host
    requestState();
  }

  /**
   * Initialize WebRTC/WebSocket connection
   * (Simplified - would use real WebRTC implementation)
   */
  function initializeConnection() {
    // In production, this would:
    // 1. Create WebRTC peer connection
    // 2. Set up data channel for synchronization
    // 3. Connect to signaling server (WebSocket)
    // 4. Handle ICE candidates
    // 5. Establish connection

    // For now, simulate connection
    setTimeout(() => {
      isConnected.value = true;
    }, 500);
  }

  /**
   * Generate unique room ID
   */
  function generateRoomId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /**
   * Send playback state to all participants
   * @param {Object} state - Playback state
   */
  function broadcastState(state) {
    if (!isHost.value || !isConnected.value) return;

    playbackState.value = {
      ...playbackState.value,
      ...state,
    };

    // Send to all participants via data channel
    if (dataChannel.value && dataChannel.value.readyState === 'open') {
      dataChannel.value.send(JSON.stringify({
        type: 'playback-state',
        state: playbackState.value,
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * Request current state from host
   */
  function requestState() {
    if (isHost.value || !isConnected.value) return;

    // Request state from host
    if (dataChannel.value && dataChannel.value.readyState === 'open') {
      dataChannel.value.send(JSON.stringify({
        type: 'request-state',
      }));
    }
  }

  /**
   * Synchronize playback with host
   * @param {Object} videoPlayer - Video player element
   */
  function synchronizePlayback(videoPlayer) {
    if (!videoPlayer || !isConnected.value) return;

    // If not host, sync with host state
    if (!isHost.value) {
      const { isPlaying, currentTime, playbackRate } = playbackState.value;

      // Sync time (with small tolerance)
      if (Math.abs(videoPlayer.currentTime - currentTime) > 1) {
        videoPlayer.currentTime = currentTime;
      }

      // Sync playback state
      if (videoPlayer.paused === isPlaying) {
        if (isPlaying) {
          videoPlayer.play();
        } else {
          videoPlayer.pause();
        }
      }

      // Sync playback rate
      if (videoPlayer.playbackRate !== playbackRate) {
        videoPlayer.playbackRate = playbackRate;
      }
    }
  }

  /**
   * Send chat message
   * @param {string} message - Message text
   * @param {string} author - Author name
   */
  function sendMessage(message, author = 'Anonymous') {
    if (!isConnected.value) return;

    const chatMessage = {
      id: Date.now().toString(),
      author,
      message,
      timestamp: Date.now(),
      isOwn: true,
    };

    chatMessages.value.push(chatMessage);

    // Send to all participants
    if (dataChannel.value && dataChannel.value.readyState === 'open') {
      dataChannel.value.send(JSON.stringify({
        type: 'chat-message',
        message: chatMessage,
      }));
    }
  }

  /**
   * Handle incoming message
   * @param {Object} data - Message data
   */
  function handleMessage(data) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'playback-state':
          if (!isHost.value) {
            playbackState.value = message.state;
          }
          break;

        case 'chat-message':
          if (message.message.author !== 'You') {
            chatMessages.value.push({
              ...message.message,
              isOwn: false,
            });
          }
          break;

        case 'participant-joined':
          participants.value.push(message.participant);
          break;

        case 'participant-left':
          participants.value = participants.value.filter(
            p => p.id !== message.participantId
          );
          break;

        case 'request-state':
          if (isHost.value) {
            broadcastState(playbackState.value);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Leave watch party
   */
  function leaveRoom() {
    if (isConnected.value && dataChannel.value) {
      // Notify participants
      dataChannel.value.send(JSON.stringify({
        type: 'participant-left',
        participantId: 'current-user', // Would be actual user ID
      }));
    }

    // Close connection
    if (connection.value) {
      connection.value.close();
    }

    // Reset state
    isHost.value = false;
    roomId.value = null;
    participants.value = [];
    isConnected.value = false;
    chatMessages.value = [];
    currentVideo.value = null;
  }

  /**
   * Get room info
   */
  function getRoomInfo() {
    return {
      roomId: roomId.value,
      isHost: isHost.value,
      participantCount: participants.value.length + 1, // +1 for current user
      isConnected: isConnected.value,
      currentVideo: currentVideo.value,
    };
  }

  return {
    isHost: computed(() => isHost.value),
    roomId: computed(() => roomId.value),
    participants: computed(() => participants.value),
    isConnected: computed(() => isConnected.value),
    chatMessages: computed(() => chatMessages.value),
    currentVideo: computed(() => currentVideo.value),
    playbackState: computed(() => playbackState.value),
    createRoom,
    joinRoom,
    broadcastState,
    synchronizePlayback,
    sendMessage,
    leaveRoom,
    getRoomInfo,
  };
}

