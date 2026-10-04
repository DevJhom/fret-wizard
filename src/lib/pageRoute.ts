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

export const isFretboardView = (view: View): view is FretboardView => view === 'scale' || view === 'chord';

export interface Route {
  view: View;
  // The Library card a Scale/Chord page is working on: /fret-wizard/scale/<card-id>
  cardId: string | null;
}

export const pathForView = (view: View, cardId: string | null = null) =>
  `${base}${segments[view]}${cardId && isFretboardView(view) ? `/${encodeURIComponent(cardId)}` : ''}`;

const decode = (text: string) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

export const routeFromPath = (path: string): Route => {
  const rest = path.startsWith(base) ? path.slice(base.length).replace(/\/$/, '') : '';
  const [segment, cardId, ...extra] = rest.split('/');
  const view = (Object.keys(segments) as View[]).find(v => segments[v] === segment) ?? 'scale';
  const hasCard = isFretboardView(view) && segments[view] === segment && !!cardId && extra.length === 0;
  return { view, cardId: hasCard ? decode(cardId) : null };
}

export const viewFromPath = (path: string): View => routeFromPath(path).view;
