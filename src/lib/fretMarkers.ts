// Frets with a number and an inlay dot
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export const DOUBLE_INLAY_FRETS = [12, 24];
export const SINGLE_INLAY_FRETS = FRET_MARKERS.filter(fret => !DOUBLE_INLAY_FRETS.includes(fret));
