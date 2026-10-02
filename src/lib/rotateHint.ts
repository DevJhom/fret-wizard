import { ref } from 'vue';

// Shared so the dismissed hint stays hidden when the Scale/Chord pages remount; resets on reload.
export const rotateHintDismissed = ref(false);
