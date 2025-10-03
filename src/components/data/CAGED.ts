import { CurrentCAGED } from '@/stores/usePatternStore';
import { majorKeyToNumber, minorKeyToNumber } from '@data/constants';
import { Tonality } from '@data/constants';

// position = fret number - 1
export const CAGED = {
    CShape: {
        e: [-2,-1,0,2, 10,11,12,14],
        B: [-1,0,2,3, 11,12,14,15],
        G: [-1,1, 11,13],
        D: [-1,0,1,2, 11,12,13,14],
        A: [-1,1,2, 11,13,14],
        E: [-2,-1,0,2, 10,11,12,14],
    },
    AShape: {
        e: [-10,-8, 2,4, 14,16],
        B: [-10,-9,-8,-7, 2,3,4,5, 14,15,16,17],
        G: [-11,-9,-8, 1,3,4, 13,15,16],
        D: [-11,-10,-8, 0,1,2,4, 12,13,14,16],
        A: [-11,-10,-8, 1,2,4,5, 13,14,16,17],
        E: [-10,-8, 2,4, 14,16],
    },
    GShape: {
        e: [-8,-6,-5, 4,6,7, 16,18,19],
        B: [-9,-8,-7,-5, 3,4,5,7, 15,16,17,19],
        G: [-9,-8,-6,-5, 3,4,6,7, 15,16,18,19],
        D: [-8,-6, 4,6, 16,18],
        A: [-8,-7,-6,-5, 4,5,6,7, 16,17,18,19],
        E: [-8,-6,-5, 4,6,7, 16,18,19],
    },
    EShape: {
        e: [-6,-5,-3,-2, 6,7,9,10, 18,19,21,22],
        B: [-5,-3, 7,9, 19,21],
        G: [-6,-5,-4,-3, 6,7,8,9, 18,19,20,21],
        D: [-6,-4,-3, 6,8,9, 18,20,21],
        A: [-7,-6,-5,-3, 5,6,7,9, 17,18,19,21],
        E: [-6,-5,-3,-2, 6,7,9,10, 18,19,21,22],
    },
    DShape: {
        e: [-3,-2,-1,0, 9,10,11,12, 21,22,23,24,],
        B: [-3,-1,0, 9,11,12, 21,23],
        G: [-5,-4,-3,-1, 7,8,9,11, 19,20,21,23],
        D: [-4,-3,-1,0, 8,9,11,12, 20,21,23],
        A: [-3,-1, 9,11, 21,23],
        E: [-3,-2,-1,0, 9,10,11,12, 21,22,23,24],
    }
}

export const isCAGED = (index: number, stringName: string, currentKey: string, tonality: Tonality, highlightCAGED?: string[]): boolean => {
    if (tonality == Tonality.MAJOR)
        index = index - majorKeyToNumber[currentKey];
    if (tonality == Tonality.MINOR)
        index = index - minorKeyToNumber[currentKey];

    if (highlightCAGED) {
        if (highlightCAGED.includes("CShape") && CAGED.CShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("AShape") && CAGED.AShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("GShape") && CAGED.GShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("EShape") && CAGED.EShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("DShape") && CAGED.DShape?.[stringName].includes(index)) 
            return true;
    }
};

export const CAGEDNamePosition = {
    CShape: {
        name: "C Shape",
        position: [-11, 1, 12],
    },
    AShape: {
        name: "A Shape",
        position: [-9, 3, 15],
    },
    GShape: {
        name: "G Shape",
        position: [-7, 5, 17],
    },
    EShape: {
        name: "E Shape",
        position: [-4, 8, 20],
    },
    DShape: {
        name: "D Shape",
        position: [-2, 10, 22],
    }
}

export const isCAGEDNameHere = (index: number, currentCAGED: CurrentCAGED, currentKey: string, tonality: Tonality) => {
    if (tonality == Tonality.MAJOR)
        index = index - majorKeyToNumber[currentKey];
    if (tonality == Tonality.MINOR)
        index = index - majorKeyToNumber[currentKey] - 3;

    if (currentCAGED.CShape && CAGEDNamePosition.CShape.position.includes(index))
        return true;

    if (currentCAGED.AShape && CAGEDNamePosition.AShape.position.includes(index))
        return true;

    if (currentCAGED.GShape && CAGEDNamePosition.GShape.position.includes(index))
        return true;

    if (currentCAGED.EShape && CAGEDNamePosition.EShape.position.includes(index))
        return true;

    if (currentCAGED.DShape && CAGEDNamePosition.DShape.position.includes(index))
        return true;
}

export const GetCAGEDName = (index: number, currentCAGED: CurrentCAGED, currentKey: string, tonality: Tonality) => {
    if (tonality == Tonality.MAJOR)
        index = index - majorKeyToNumber[currentKey];
    if (tonality == Tonality.MINOR)
        index = index - majorKeyToNumber[currentKey] - 3;

    if (currentCAGED.CShape && CAGEDNamePosition.CShape.position.includes(index))
        return CAGEDNamePosition.CShape.name;

    if (currentCAGED.AShape && CAGEDNamePosition.AShape.position.includes(index))
        return CAGEDNamePosition.AShape.name;

    if (currentCAGED.GShape && CAGEDNamePosition.GShape.position.includes(index))
        return CAGEDNamePosition.GShape.name;

    if (currentCAGED.EShape && CAGEDNamePosition.EShape.position.includes(index))
        return CAGEDNamePosition.EShape.name;

    if (currentCAGED.DShape && CAGEDNamePosition.DShape.position.includes(index))
        return CAGEDNamePosition.DShape.name;
}
