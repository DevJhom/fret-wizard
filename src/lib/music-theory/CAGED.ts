import { CurrentCAGED } from '@/lib/fretboardData';
import { majorKeyToNumber, minorKeyToNumber, Pattern } from '@data/constants';
import { Tonality } from '@data/constants';

type Shape = keyof CurrentCAGED;

// First fret of each shape's block in C: four frets on every string, repeating every 12 frets
const CAGEDBlockStart: Record<Shape, number> = {
    CShape: 0,
    AShape: 2,
    GShape: 5,
    EShape: 7,
    DShape: 10,
}

const BLOCK_FRETS = 4;

// Shape notes in C that sit a fret outside the block; they stay lit, though the block isn't drawn under them
const outsideBlock: Partial<Record<Shape, Record<string, number[]>>> = {
    // The scale's 4th
    AShape: { B: [6] },
    // The scale's 7th, and the minor chord's 3rd
    GShape: { G: [4], B: [4] },
    // The scale's 7th and 3rd
    DShape: { D: [9], G: [9] },
}

// The add9 chords' A and E shapes reach two frets past the block for their 9th
const add9OutsideBlock: Partial<Record<Shape, Record<string, number[]>>> = {
    AShape: { G: [7] },
    EShape: { D: [12] },
}

const mod12 = (value: number) => ((value % 12) + 12) % 12;

// Minor keys take their relative major's shapes
const shapeShift = (currentKey: string, tonality: Tonality) =>
    tonality == Tonality.MINOR ? minorKeyToNumber[currentKey] : majorKeyToNumber[currentKey];

// position = fret number - 1; the open string is asked about as fret 12
const fretInC = (index: number, currentKey: string, tonality: Tonality) => index + 1 - shapeShift(currentKey, tonality);

const inBlock = (shape: Shape, fret: number) => mod12(fret - CAGEDBlockStart[shape]) < BLOCK_FRETS;

export const isInCAGEDBlock = (index: number, currentKey: string, tonality: Tonality, highlightCAGED?: string[]): boolean => {
    const fret = fretInC(index, currentKey, tonality);
    return !!highlightCAGED?.some(shape => shape in CAGEDBlockStart && inBlock(shape as Shape, fret));
};

// Whether a note belongs to a highlighted shape: inside its block, or one of the notes just outside it
export const isCAGED = (index: number, stringName: string, currentKey: string, tonality: Tonality, highlightCAGED?: string[], pattern?: Pattern): boolean => {
    const fret = fretInC(index, currentKey, tonality);
    const outsideNotes = pattern == Pattern.Add9 ? [outsideBlock, add9OutsideBlock] : [outsideBlock];

    return !!highlightCAGED?.some(shape => shape in CAGEDBlockStart && (
        inBlock(shape as Shape, fret) ||
        outsideNotes.some(notes => !!notes[shape as Shape]?.[stringName]?.some(outside => mod12(fret - outside) == 0))
    ));
};

export const CAGEDNamePosition = {
    CShape: {
        name: "C Shape",
        position: [-11, 1, 13],
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
    return !!GetCAGEDName(index, currentCAGED, currentKey, tonality);
}

export const GetCAGEDName = (index: number, currentCAGED: CurrentCAGED, currentKey: string, tonality: Tonality) => {
    index = index - shapeShift(currentKey, tonality);

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
