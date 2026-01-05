import { Pattern, Tonality } from '@/components/data/constants';
import pattern from '@data/pattern.json';

export const fetchScalePattern = async (tonality: Tonality, scale: string, key: string) => {
    switch (scale) {
        case Pattern.Pentatonic:
            return pattern.pentatonic_scale.C;

        case Pattern.Blue:
            return pattern.blue_scale.C;

        case Pattern.Diatonic:
            return pattern.diatonic_scale.C;

        case Pattern.Chromatic:
            return pattern.chromaic_scale.C;

        case Pattern.Triad:
          if (tonality == Tonality.MAJOR)
            return pattern.triad.C
          if (tonality == Tonality.MINOR)
            return pattern.minor_triad.A
        break;

        case Pattern.Seventh:
          if (tonality == Tonality.MAJOR)
            return pattern.seventh.C
          if (tonality == Tonality.MINOR)
            return pattern.minor_seventh.A
        break;

        case Pattern.Add9:
          if (tonality == Tonality.MAJOR)
            return pattern.add9.C
          if (tonality == Tonality.MINOR)
            return pattern.minor_add9.A
        break;

        case Pattern.Add11:
          if (tonality == Tonality.MAJOR)
            return pattern.add11.C
          if (tonality == Tonality.MINOR)
            return pattern.minor_add11.A
        break;

        case Pattern.Add13:
          if (tonality == Tonality.MAJOR)
            return pattern.add13.C
          if (tonality == Tonality.MINOR)
            return pattern.minor_add13.A
        break;

        case Pattern.Dominant:
          return pattern.dominant.C;

        case Pattern.Power:
          return pattern.power.C;

        default:
            return pattern.pentatonic_scale.C;
    }
}