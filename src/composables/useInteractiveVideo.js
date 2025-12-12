import { ref, computed } from 'vue';

/**
 * Interactive Video Experience - Choose Your Own Adventure
 * Handles branching video paths and user choices
 */
export function useInteractiveVideo() {
  const currentPath = ref([]); // Array of choices made
  const currentSegment = ref(null);
  const videoBranches = ref({});
  const isInteractive = ref(false);
  const choicePoints = ref([]);
  const selectedChoices = ref({}); // Map of choicePointId -> choiceId

  /**
   * Initialize interactive video
   * @param {Object} video - Video object with interactive metadata
   */
  function initializeInteractiveVideo(video) {
    if (!video || !video.interactive) {
      isInteractive.value = false;
      return false;
    }

    isInteractive.value = true;
    videoBranches.value = video.interactive.branches || {};
    choicePoints.value = video.interactive.choicePoints || [];
    currentPath.value = [];
    selectedChoices.value = {};

    // Start with first segment
    if (video.interactive.startSegment) {
      currentSegment.value = video.interactive.startSegment;
    }

    return true;
  }

  /**
   * Get current video segment URL
   */
  function getCurrentSegmentUrl() {
    if (!currentSegment.value) return null;
    
    const segment = videoBranches.value[currentSegment.value];
    if (!segment) return null;

    return segment.videoUrl || segment.url;
  }

  /**
   * Get choices available at current time
   * @param {number} currentTime - Current playback time
   */
  function getChoicesAtTime(currentTime) {
    if (!isInteractive.value) return [];

    return choicePoints.value.filter(cp => {
      // Check if choice point is at current time (with 2 second tolerance)
      return Math.abs(cp.timestamp - currentTime) <= 2;
    });
  }

  /**
   * Make a choice at a choice point
   * @param {string} choicePointId - ID of the choice point
   * @param {string} choiceId - ID of the selected choice
   */
  function makeChoice(choicePointId, choiceId) {
    if (!isInteractive.value) return false;

    const choicePoint = choicePoints.value.find(cp => cp.id === choicePointId);
    if (!choicePoint) return false;

    const choice = choicePoint.choices.find(c => c.id === choiceId);
    if (!choice) return false;

    // Record the choice
    selectedChoices.value[choicePointId] = choiceId;
    currentPath.value.push({
      choicePointId,
      choiceId,
      timestamp: Date.now(),
    });

    // Navigate to next segment
    if (choice.nextSegment) {
      currentSegment.value = choice.nextSegment;
      return true;
    }

    return false;
  }

  /**
   * Get next segment after making a choice
   * @param {string} choiceId - ID of the selected choice
   */
  function getNextSegment(choiceId) {
    // This would be called after makeChoice
    // Returns the segment to play next
    return currentSegment.value;
  }

  /**
   * Check if video has multiple endings
   */
  function hasMultipleEndings() {
    if (!isInteractive.value) return false;

    // Count segments marked as endings
    let endingCount = 0;
    Object.values(videoBranches.value).forEach(segment => {
      if (segment.isEnding) endingCount++;
    });

    return endingCount > 1;
  }

  /**
   * Get all possible paths through the video
   */
  function getAllPaths() {
    if (!isInteractive.value) return [];

    // This would generate all possible paths through the interactive video
    // For now, return simplified version
    return currentPath.value;
  }

  /**
   * Reset to start of interactive video
   */
  function resetInteractiveVideo() {
    if (!isInteractive.value) return;

    currentPath.value = [];
    selectedChoices.value = {};
    
    // Reset to start segment
    const video = videoBranches.value;
    if (video && video.start) {
      currentSegment.value = video.start;
    }
  }

  /**
   * Get path summary (for analytics/replay)
   */
  function getPathSummary() {
    return {
      totalChoices: currentPath.value.length,
      path: currentPath.value.map(choice => ({
        choicePoint: choice.choicePointId,
        choice: choice.choiceId,
        timestamp: choice.timestamp,
      })),
      currentSegment: currentSegment.value,
      isComplete: currentSegment.value && videoBranches.value[currentSegment.value]?.isEnding,
    };
  }

  /**
   * Replay from a specific choice point
   * @param {string} choicePointId - Choice point to replay from
   */
  function replayFromChoice(choicePointId) {
    if (!isInteractive.value) return false;

    // Find the choice point in path
    const index = currentPath.value.findIndex(c => c.choicePointId === choicePointId);
    if (index === -1) return false;

    // Truncate path from this point
    currentPath.value = currentPath.value.slice(0, index);
    delete selectedChoices.value[choicePointId];

    // Reset to this choice point's segment
    const choicePoint = choicePoints.value.find(cp => cp.id === choicePointId);
    if (choicePoint && choicePoint.segment) {
      currentSegment.value = choicePoint.segment;
      return true;
    }

    return false;
  }

  return {
    isInteractive: computed(() => isInteractive.value),
    currentSegment: computed(() => currentSegment.value),
    currentPath: computed(() => currentPath.value),
    choicePoints: computed(() => choicePoints.value),
    selectedChoices: computed(() => selectedChoices.value),
    initializeInteractiveVideo,
    getCurrentSegmentUrl,
    getChoicesAtTime,
    makeChoice,
    getNextSegment,
    hasMultipleEndings,
    getAllPaths,
    resetInteractiveVideo,
    getPathSummary,
    replayFromChoice,
  };
}

