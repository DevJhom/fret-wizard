import data from '../../database/all-scales.json';

type GuitarStrings = {
  [key: string]: string[];
};

export const getCurrentKey = async () => {
    return {
        key: "C"
    };
}

export const updateCurrentKey = async (key: string) => {}

export const getScale = async (scale: string, key: string) => {
    if (scale == "pentatonic_scale")
        return data.pentatonic_scale.C;
    else if (scale == "blue_scale")
        return data.blue_scale.C;
    else if (scale == "diatonic_scale")
        return data.diatonic_scale.C
    else if (scale == "triad")
        return data.triad.C
}

export const updateCurrentScale = async (scale: string) => {}

export const updateScale = async (scale: string, key: string, guitarStrings: GuitarStrings) => {}
