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

        default:
            return pattern.pentatonic_scale.C;
    }
}