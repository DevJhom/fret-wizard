import { Pattern, Tonality } from '@/components/data/constants';
import pattern from '@data/pattern.json';

export const fetchScalePattern = async (tonality: Tonality, scale: string, key: string) => {
    if (scale == Pattern.Pentatonic) {
        return pattern.pentatonic_scale.C;
    }
    else if (scale == Pattern.Blue) {
        return pattern.blue_scale.C;
    }
    else if (scale == Pattern.Diatonic) {
        return pattern.diatonic_scale.C
    }
    else if (scale == Pattern.Triad) {
        if (tonality == Tonality.MAJOR) {
            return pattern.triad.C
        }
        if (tonality == Tonality.MINOR) {
            return pattern.minor_triad.A
        }
    }
}