export type FretboardView = 'scale' | 'chord';
export type View = FretboardView | 'progression' | 'library';

// Paths under the app base (/fret-wizard/). GitHub Pages has no server routing, so the build
// copies index.html to 404.html: an unknown path like /fret-wizard/chord still loads the app.
const segments: Record<View, string> = {
  scale: 'scale',
  chord: 'chord',
  progression: 'chord-progression',
  library: 'library',
};

const base = import.meta.env.BASE_URL;

export const pathForView = (view: View) => `${base}${segments[view]}`;

export const viewFromPath = (path: string): View => {
  const segment = path.startsWith(base) ? path.slice(base.length).replace(/\/$/, '') : '';
  const match = (Object.keys(segments) as View[]).find(view => segments[view] === segment);
  return match ?? 'scale';
}
