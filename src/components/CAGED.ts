
export const CAGED = {
    CShape : {
        E: [2,11,14],
        A: [0,2,12,14],
        D: [1,11,13],
        G: [1,11,13],
        B: [2,11,14],
        e: [2,11,14],
    },
    AShape : {
        E: [2,4,14,16],
        A: [2,4,14,16],
        D: [1,4,13,16],
        G: [1,4,13,16],
        B: [2,4,14,16],
        e: [2,4,14,16],
    },
    GShape : {
        E: [4,7,16,19],
        A: [4,7,16,19],
        D: [4,6,16,18],
        G: [4,6,16,18],
        B: [4,6,16,18],
        e: [4,7,16,19],
    },
    EShape : {
        E: [7,9,19,21],
        A: [7,9,19,21],
        D: [6,8,18,20],
        G: [6,9,18,21],
        B: [6,9,18,21],
        e: [7,9,19,21],
    },
    DShape : {
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
        if (highlightCAGED.includes("C") && CAGED.CShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("A") && CAGED.AShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("G") && CAGED.GShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("E") && CAGED.EShape?.[stringName].includes(index)) 
            return true;
        
        if (highlightCAGED.includes("D") && CAGED.DShape?.[stringName].includes(index)) 
            return true;
    }
};
