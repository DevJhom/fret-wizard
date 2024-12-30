import { CurrentCAGED } from '@/stores/usePatternStore';
import { KEY_TO_NUMBER } from './noteNames';

export const CAGED = {
    CShape: {
        E: [-1,2,11,14],
        A: [0,2,12,14],
        D: [-1,1,11,13],
        G: [-1,1,11,13],
        B: [-1,2,11,14],
        e: [-1,2,11,14],
    },
    AShape: {
        E: [-10,-8,2,4,14,16],
        A: [-10,-8,2,4,14,16],
        D: [-11,-8,1,4,13,16],
        G: [-11,-8,1,4,13,16],
        B: [-10,-8,2,4,14,16],
        e: [-10,-8,2,4,14,16],
    },
    GShape: {
        E: [-8,-5,4,7,16,19],
        A: [-8,-5,4,7,16,19],
        D: [-8,-6,4,6,16,18],
        G: [-8,-6,4,6,16,18],
        B: [-8,-6,4,6,16,18],
        e: [-8,-5,4,7,16,19],
    },
    EShape: {
        E: [-5,-3,7,9,19,21],
        A: [-5,-3,7,9,19,21],
        D: [-6,-4,6,8,18,20],
        G: [-6,-3,6,9,18,21],
        B: [-6,-3,6,9,18,21],
        e: [-5,-3,7,9,19,21],
    },
    DShape: {
        E: [-3,-1,9,11,21,23],
        A: [-3,0,9,12,21],
        D: [-4,-1,8,11,20,23],
        G: [-3,-1,9,11,21,23],
        B: [-3,-1,9,11,21,23],
        e: [-3,-1,9,11,21,23],
    }
}

export const isCAGED = (index: number, stringName: string, currentKey: string, highlightCAGED?: string[]): boolean => {
    index = index - KEY_TO_NUMBER[currentKey];

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

export const isCAGEDNameHere = (index: number, currentCAGED: CurrentCAGED) => {
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

export const GetCAGEDName = (index: number, currentCAGED: CurrentCAGED) => {
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
