import { Degree } from '@data/constants';

// CSS class per degree; the colors are $degree-colors in notes-input.scss
export const degreeClasses: Record<Degree, string> = {
  [Degree.roots]: 'root-note',
  [Degree.minorSeconds]: 'minor-second',
  [Degree.seconds]: 'second',
  [Degree.minorThirds]: 'minor-third',
  [Degree.thirds]: 'third',
  [Degree.fourths]: 'fourth',
  [Degree.tritones]: 'tritone',
  [Degree.fifths]: 'fifth',
  [Degree.minorSixths]: 'minor-sixth',
  [Degree.sixths]: 'sixth',
  [Degree.minorSevenths]: 'minor-seventh',
  [Degree.sevenths]: 'seventh',
};
