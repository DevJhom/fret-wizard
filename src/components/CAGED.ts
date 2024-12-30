import { CurrentCAGED } from '@/stores/usePatternStore';

export const CAGED = {
    CShape: {
        E: [2,11,14],
        A: [0,2,12,14],
        D: [1,11,13],
        G: [1,11,13],
        B: [2,11,14],
        e: [2,11,14],
    },
    AShape: {
        E: [2,4,14,16],
        A: [2,4,14,16],
        D: [1,4,13,16],
        G: [1,4,13,16],
        B: [2,4,14,16],
        e: [2,4,14,16],
    },
    GShape: {
        E: [4,7,16,19],
        A: [4,7,16,19],
        D: [4,6,16,18],
        G: [4,6,16,18],
        B: [4,6,16,18],
        e: [4,7,16,19],
    },
    EShape: {
        E: [7,9,19,21],
        A: [7,9,19,21],
        D: [6,8,18,20],
        G: [6,9,18,21],
        B: [6,9,18,21],
        e: [7,9,19,21],
    },
    DShape: {
        E: [9,11,21,23],
        A: [9,12,21],
        D: [8,11,20,23],
        G: [9,11,21,23],
        B: [9,11,21,23],
        e: [9,11,21,23],
    }
}

export const isCAGED = (index: number, stringName: string, highlightCAGED?: string[] ): boolean => {
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
