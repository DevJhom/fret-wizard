import { CurrentCAGED } from '@/stores/usePatternStore';
import { majorKeyToNumber, minorKeyToNumber } from '@data/constants';
import { Tonality } from '@data/constants';

const CShapePositions = [-1,0,1,2, 11,12,13,14];
const AShapePositions = [-11,-10,-9,-8, 1,2,3,4, 13,14,15,16];
const GShapePositions = [-8,-7,-6,-5, 4,5,6,7, 16,17,18,19];
const EShapePositions = [-6,-5,-4,-3, 6,7,8,9, 18,19,20,21];
const DShapePositions = [-4,-3,-2,-1, 8,9,10,11, 20,21,22,23];

// position = fret number - 1
export const CAGED = {
    CShape: {
        e: CShapePositions,
        B: CShapePositions,
        G: CShapePositions,
        D: CShapePositions,
        A: CShapePositions,
        E: CShapePositions,
    },
    AShape: {
        e: AShapePositions,
        B: AShapePositions,
        G: AShapePositions,
        D: AShapePositions,
        A: AShapePositions,
        E: AShapePositions,
    },
    GShape: {
        e: GShapePositions,
        B: GShapePositions,
        G: GShapePositions,
        D: GShapePositions,
        A: GShapePositions,
        E: GShapePositions,
    },
    EShape: {
        e: EShapePositions,
        B: EShapePositions,
        G: EShapePositions,
        D: EShapePositions,
        A: EShapePositions,
        E: EShapePositions,
    },
    DShape: {
        e: DShapePositions,
        B: DShapePositions,
        G: DShapePositions,
        D: DShapePositions,
        A: DShapePositions,
        E: DShapePositions,
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
