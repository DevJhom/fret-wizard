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

const seconds: Intervals = {
    E: [],
    A: [],
    D: [],
    G: [],
    B: [],
    e: []
}

const thirds: Intervals = {
    E: [0,12,24],
    A: [-7,5,17],
    D: [-3,9,21],
    G: [-10,2,14],
    B: [-5,7,19],
    e: [0,12,24]
}

const fourths: Intervals = {
    E: [],
    A: [],
    D: [],
    G: [],
    B: [],
    e: []
}

const fifths: Intervals = {
    E: [-9,3,15],
    A: [-2,8,20],
    D: [0,12,24],
    G: [-7,5,17],
    B: [-2,10,22],
    e: [-9,3,15]
}

const sixths: Intervals = {
    E: [],
    A: [],
    D: [],
    G: [],
    B: [],
    e: []
}

const sevenths: Intervals = {
    E: [],
    A: [],
    D: [],
    G: [],
    B: [],
    e: []
}

const blues: Intervals = {
    E: [],
    A: [],
    D: [],
    G: [],
    B: [],
    e: []
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

export const getSeconds = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return seconds[stringName];
    if(currentKey == "C#")
        return seconds[stringName].map(note => note + 1);
    if(currentKey == "D")
        return seconds[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return seconds[stringName].map(note => note + 3);
    if(currentKey == "E")
        return seconds[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return seconds[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return seconds[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return seconds[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return seconds[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return seconds[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return seconds[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return seconds[stringName].map(note => note + 11);
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

export const getFourths = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return fourths[stringName];
    if(currentKey == "C#")
        return fourths[stringName].map(note => note + 1);
    if(currentKey == "D")
        return fourths[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return fourths[stringName].map(note => note + 3);
    if(currentKey == "E")
        return fourths[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return fourths[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return fourths[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return fourths[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return fourths[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return fourths[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return fourths[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return fourths[stringName].map(note => note + 11);
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

export const getSixths = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return sixths[stringName];
    if(currentKey == "C#")
        return sixths[stringName].map(note => note + 1);
    if(currentKey == "D")
        return sixths[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return sixths[stringName].map(note => note + 3);
    if(currentKey == "E")
        return sixths[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return sixths[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return sixths[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return sixths[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return sixths[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return sixths[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return sixths[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return sixths[stringName].map(note => note + 11);
}

export const getSevenths = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return sevenths[stringName];
    if(currentKey == "C#")
        return sevenths[stringName].map(note => note + 1);
    if(currentKey == "D")
        return sevenths[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return sevenths[stringName].map(note => note + 3);
    if(currentKey == "E")
        return sevenths[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return sevenths[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return sevenths[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return sevenths[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return sevenths[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return sevenths[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return sevenths[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return sevenths[stringName].map(note => note + 11);
}

export const getBlues = (currentKey: string, stringName: string) => {
    if(currentKey == "C")
        return blues[stringName];
    if(currentKey == "C#")
        return blues[stringName].map(note => note + 1);
    if(currentKey == "D")
        return blues[stringName].map(note => note + 2); 
    if(currentKey == "D#")
        return blues[stringName].map(note => note + 3);
    if(currentKey == "E")
        return blues[stringName].map(note => note + 4); 
    if(currentKey == "F")
        return blues[stringName].map(note => note + 5);
    if(currentKey == "F#")
        return blues[stringName].map(note => note + 6); 
    if(currentKey == "G")
        return blues[stringName].map(note => note + 7);
    if(currentKey == "G#")
        return blues[stringName].map(note => note + 8); 
    if(currentKey == "A")
        return blues[stringName].map(note => note + 9);
    if(currentKey == "A#")
        return blues[stringName].map(note => note + 10); 
    if(currentKey == "B")
        return blues[stringName].map(note => note + 11);
}