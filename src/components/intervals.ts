interface Intervals {
    [key: string]: number[];
}

const roots: Intervals = {
    E: [-4,8,20],
    A: [-11,1,13],
    D: [-7,5,17],
    G: [-2,10,22],
    B: [-9,3,15],
    e: [-4,8,20]
}

const thirds: Intervals = {
    E: [0,12,24],
    A: [-7,5,17],
    D: [-3,9,21],
    G: [-10,2,14],
    B: [-5,7,19],
    e: [0,12,24]
}

const fifths: Intervals = {
    E: [-9,3,15],
    A: [-2,8,20],
    D: [0,12,24],
    G: [-7,5,17],
    B: [-2,10,22],
    e: [-9,3,15]
}

export const getRoots = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return roots[stringName];
    if(currentKey == "C#")
        return roots[stringName].map(note => note + 1);
    if(currentKey == "D")
        return roots[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return roots[stringName].map(note => note + 3);
    if(currentKey == "E")
        return roots[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return roots[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return roots[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return roots[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return roots[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return roots[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return roots[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return roots[stringName].map(note => note + 11);
}

export const getThirds = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return thirds[stringName];
    if(currentKey == "C#")
        return thirds[stringName].map(note => note + 1);
    if(currentKey == "D")
        return thirds[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return thirds[stringName].map(note => note + 3);
    if(currentKey == "E")
        return thirds[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return thirds[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return thirds[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return thirds[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return thirds[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return thirds[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return thirds[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return thirds[stringName].map(note => note + 11);
}

export const getFifths = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return fifths[stringName];
    if(currentKey == "C#")
        return fifths[stringName].map(note => note + 1);
    if(currentKey == "D")
        return fifths[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return fifths[stringName].map(note => note + 3);
    if(currentKey == "E")
        return fifths[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return fifths[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return fifths[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return fifths[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return fifths[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return fifths[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return fifths[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return fifths[stringName].map(note => note + 11);
}