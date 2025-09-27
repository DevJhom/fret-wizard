import { Pattern, Tonality } from '@/components/data/constants';
import data from '../../database/all-scales.json';

type GuitarStrings = {
  [key: string]: string[];
};

export const fetchCurrentKey = async () => {
    return {
        key: "C"
    };
}

export const saveCurrentKey = async (key: string) => {}

export const fetchScale = async (tonality: Tonality, scale: string, key: string) => {
    if (scale == Pattern.Pentatonic) {
        return data.pentatonic_scale.C;
    }
    else if (scale == Pattern.Blue) {
        return data.blue_scale.C;
    }
    else if (scale == Pattern.Diatonic) {
        return data.diatonic_scale.C
    }
    else if (scale == Pattern.Triad) {
        if (tonality == Tonality.MAJOR) {
            return data.triad.C
        }
        if (tonality == Tonality.MINOR) {
            return data.minor_triad.A
        }
    }
}

export const saveCurrentScale = async (scale: string) => {}

export const saveScale = async (scale: string, key: string, guitarStrings: GuitarStrings) => {}
