<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { getCurrentKey, updateCurrentKey, getScale, updateCurrentScale, updateScale } from '@services/service';
import { getRoots, getSeconds, getThirds, getFourths, getFifths, getSixths, getSevenths, getBlues } from './intervals';
import { usePatternStore } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';

const patternStore = usePatternStore();
const { currentPattern, currentHighlightNotes } = storeToRefs(patternStore);

const fretAmount = ref(24);
const fretIndicator = new Array(24);
const keys = ref(["C","C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);
const patterns = ref(["Pentatonic Scale", "Blue Scale", "Diatonic Scale", "Triad Arpeggio", "Custom"]);
const currentKey = ref<string>("C");

const E = ref();
const A = ref();
const D = ref();
const G = ref();
const B = ref();
const e = ref();

// Roots
const ERoots = computed(() => {
    return getRoots(currentKey.value, "E");
})
const ARoots = computed(() => {
    return getRoots(currentKey.value, "A");
})
const DRoots = computed(() => {
    return getRoots(currentKey.value, "D");
})
const GRoots = computed(() => {
    return getRoots(currentKey.value, "G");
})
const BRoots = computed(() => {
    return getRoots(currentKey.value, "B");
})
const eRoots = computed(() => {
    return getRoots(currentKey.value, "e");
})

// Seconds
const ESeconds = computed(() => {
    return getSeconds(currentKey.value, "E");
})
const ASeconds = computed(() => {
    return getSeconds(currentKey.value, "A");
})
const DSeconds = computed(() => {
    return getSeconds(currentKey.value, "D");
})
const GSeconds = computed(() => {
    return getSeconds(currentKey.value, "G");
})
const BSeconds = computed(() => {
    return getSeconds(currentKey.value, "B");
})
const eSeconds = computed(() => {
    return getSeconds(currentKey.value, "e");
})

// Thirds
const EThirds = computed(() => {
    return getThirds(currentKey.value, "E");
})
const AThirds = computed(() => {
    return getThirds(currentKey.value, "A");
})
const DThirds = computed(() => {
    return getThirds(currentKey.value, "D");
})
const GThirds = computed(() => {
    return getThirds(currentKey.value, "G");
})
const BThirds = computed(() => {
    return getThirds(currentKey.value, "B");
})
const eThirds = computed(() => {
    return getThirds(currentKey.value, "e");
})

// Fourths
const EFourths = computed(() => {
    return getFourths(currentKey.value, "E");
})
const AFourths = computed(() => {
    return getFourths(currentKey.value, "A");
})
const DFourths = computed(() => {
    return getFourths(currentKey.value, "D");
})
const GFourths = computed(() => {
    return getFourths(currentKey.value, "G");
})
const BFourths = computed(() => {
    return getFourths(currentKey.value, "B");
})
const eFourths = computed(() => {
    return getFourths(currentKey.value, "e");
})

// Fifths
const EFifths = computed(() => {
    return getFifths(currentKey.value, "E");
})
const AFifths = computed(() => {
    return getFifths(currentKey.value, "A");
})
const DFifths = computed(() => {
    return getFifths(currentKey.value, "D");
})
const GFifths = computed(() => {
    return getFifths(currentKey.value, "G");
})
const BFifths = computed(() => {
    return getFifths(currentKey.value, "B");
})
const eFifths = computed(() => {
    return getFifths(currentKey.value, "e");
})

// Sixths
const ESixths = computed(() => {
    return getSixths(currentKey.value, "E");
})
const ASixths = computed(() => {
    return getSixths(currentKey.value, "A");
})
const DSixths = computed(() => {
    return getSixths(currentKey.value, "D");
})
const GSixths = computed(() => {
    return getSixths(currentKey.value, "G");
})
const BSixths = computed(() => {
    return getSixths(currentKey.value, "B");
})
const eSixths = computed(() => {
    return getSixths(currentKey.value, "e");
})

// Sevenths
const ESevenths = computed(() => {
    return getSevenths(currentKey.value, "E");
})
const ASevenths = computed(() => {
    return getSevenths(currentKey.value, "A");
})
const DSevenths = computed(() => {
    return getSevenths(currentKey.value, "D");
})
const GSevenths = computed(() => {
    return getSevenths(currentKey.value, "G");
})
const BSevenths = computed(() => {
    return getSevenths(currentKey.value, "B");
})
const eSevenths = computed(() => {
    return getSevenths(currentKey.value, "e");
})

// Blues
const EBlues = computed(() => {
    return getBlues(currentKey.value, "E");
})
const ABlues = computed(() => {
    return getBlues(currentKey.value, "A");
})
const DBlues = computed(() => {
    return getBlues(currentKey.value, "D");
})
const GBlues = computed(() => {
    return getBlues(currentKey.value, "G");
})
const BBlues = computed(() => {
    return getBlues(currentKey.value, "B");
})
const eBlues = computed(() => {
    return getBlues(currentKey.value, "e");
})

const fetchCurrentKey = async () => {
    const data = await getCurrentKey();
    currentKey.value = data.key;
}

const fetchScale = async () => {
    const data = await getScale(mapScaleName(), "C");

    for (let i = 0; i < mapCurrentKeyToNumber.value; i++) {
        const lastValueOfE = data.E.pop(); 
        data.E.unshift(lastValueOfE);

        const lastValueOfA = data.A.pop(); 
        data.A.unshift(lastValueOfA);

        const lastValueOfD = data.D.pop(); 
        data.D.unshift(lastValueOfD);

        const lastValueOfG = data.G.pop(); 
        data.G.unshift(lastValueOfG);

        const lastValueOfB = data.B.pop(); 
        data.B.unshift(lastValueOfB);

        const lastValueOfe = data.e.pop(); 
        data.e.unshift(lastValueOfe);
    }

    E.value = data.E;
    A.value = data.A;
    D.value = data.D;
    G.value = data.G;
    B.value = data.B;
    e.value = data.e;
}

const mapScaleName: () => string = () => {
    if(currentPattern.value == 'Pentatonic Scale')
        return 'pentatonic_scale';
    if(currentPattern.value == 'Blue Scale')
        return 'blue_scale';
    if(currentPattern.value == 'Diatonic Scale')
        return 'diatonic_scale';
    if(currentPattern.value == 'Triad Arpeggio')
        return 'triad_arpeggio';
    if(currentPattern.value == 'Custom')
        return 'custom';

    return '';
};

const onChangeCurrentKey = () => {
    fetchScale();
    updateCurrentKey(currentKey.value);
}

const onChangeCurrentScale = () => {
    fetchScale();
    updateCurrentScale(currentPattern.value);
}

watch([E, A, D, G, B, e], (newValue) => {
    updateScale(mapScaleName(), currentKey.value, {
        E: Object.assign([], newValue[0]), 
        A: Object.assign([], newValue[1]), 
        D: Object.assign([], newValue[2]), 
        G: Object.assign([], newValue[3]),
        B: Object.assign([], newValue[4]),
        e: Object.assign([], newValue[5])
    })
}, { deep: true })

const mapCurrentKeyToNumber = computed(() => {
    if(currentKey.value == "C")
        return 0;
    if(currentKey.value == "C#")
        return 1;
    if(currentKey.value == "D")
        return 2;
    if(currentKey.value == "D#")
        return 3;
    if(currentKey.value == "E")
        return 4;
    if(currentKey.value == "F")
        return 5;
    if(currentKey.value == "F#")
        return 6;
    if(currentKey.value == "G")
        return 7;
    if(currentKey.value == "G#")
        return 8;
    if(currentKey.value == "A")
        return 9;
    if(currentKey.value == "A#")
        return 10;
    if(currentKey.value == "B")
        return 11;
    return 0;
})

// CAGED
const CAGED = ref([
    {
        name: "C Shape",
        position: computed(() => -11 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "A Shape",
        position: computed(() => -9 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "G Shape",
        position: computed(() => -7 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "E Shape",
        position: computed(() => -4 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "D Shape",
        position: computed(() => -2 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "C Shape",
        position: computed(() => 1 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "A Shape",
        position: computed(() => 3 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "G Shape",
        position: computed(() => 5 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "E Shape",
        position: computed(() => 8 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "D Shape",
        position: computed(() => 10 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "C Shape",
        position: computed(() => 12 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "A Shape",
        position: computed(() => 15 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "G Shape",
        position: computed(() => 17 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "E Shape",
        position: computed(() => 20 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
    {
        name: "D Shape",
        position: computed(() => 22 + mapCurrentKeyToNumber.value),
        isChecked: false
    },
]);

const GetCAGEDPosition = (index: number) => {
   return CAGED.value.some(obj => Object.values(obj).includes(index));
}

const GetCAGEDName = (index: number) => {
    const filtered = CAGED.value.find(obj => obj.position == index);

    if(filtered)
        return filtered.name;
}

onMounted(async () => {
    await fetchCurrentKey();
    await fetchScale();
})
</script>

<template>
    <!-- Key Selector -->
    <div class="d-flex justify-content-center align-items-center">
        <span class="me-2 text-yellow fw-bold">
            Key
        </span>
        <div v-for="(key, index) in keys" :key="key" class="d-inline-block custom-radio">
            <label class="d-flex flex-column">
                <input type="radio" name="keys" v-model="currentKey" :value="keys[index]" @change="onChangeCurrentKey()">
                    <span class="label"> {{ key }} </span>
                </input>
            </label>
        </div>
    </div>
    <!-- Pattern Selector -->
    <div class="d-flex justify-content-center align-items-center mt-5">
        <span class="me-2 text-yellow fw-bold">
            Pattern
        </span>
        <div v-for="(scale, index) in patterns" :key="scale" class="d-inline-block custom-radio">
            <label class="d-flex flex-column">
                <input type="radio" name="scales" v-model="currentPattern" :value="patterns[index]" @change="onChangeCurrentScale()">
                    <span class="label px-3">{{ scale }}</span>
                </input>
            </label>
        </div>
    </div>
    <!-- Fret Indicator -->
    <div class="d-flex mt-5">
        <div class="d-inline-block string-name"></div>
        <div v-for="(_, index) in fretIndicator" :key="index" class="d-inline-block" :class="{'fret-indicator': index < fretAmount}">
            <div v-if="index < fretAmount">
                <small v-if="[3,5,7,9,12,15,17,19,21,24].includes(index + 1)" class="opacity-75">
                    {{ index + 1 }}
                </small>
            </div>
        </div>
    </div>
    <!-- Fretboard -->
    <div class="d-flex text-nowrap">
        <div class="d-inline-block string-name">e</div>
        <div class="fret-start string-E">
            <div v-for="(_, index) in E" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                <label v-if="index < fretAmount" class="notes">
                    <input type="checkbox" v-model="E[index]"/>
                    <div class="checkbox__checkmark" 
                        :class="{
                            'root-note': currentHighlightNotes.includes('roots') ? ERoots?.includes(index + 1) : '', 
                            'second': currentHighlightNotes.includes('seconds') ? ESeconds?.includes(index + 1): '',
                            'third': currentHighlightNotes.includes('thirds') ? EThirds?.includes(index + 1) : '',
                            'fourth': currentHighlightNotes.includes('fourths') ? EFourths?.includes(index + 1) : '',
                            'fifth': currentHighlightNotes.includes('fifths') ? EFifths?.includes(index + 1) : '',
                            'sixth': currentHighlightNotes.includes('sixths') ? ESixths?.includes(index + 1) : '',
                            'seventh': currentHighlightNotes.includes('sevenths') ? ESevenths?.includes(index + 1) : '',
                            'blue': currentHighlightNotes.includes('blues') ? EBlues?.includes(index + 1) : '',
                        }">
                        <span v-if="currentHighlightNotes.includes('roots') && ERoots?.includes(index + 1)" class="note-names">C</span>
                        <span v-if="currentHighlightNotes.includes('seconds') && ESeconds?.includes(index + 1)" class="note-names">D</span>
                        <span v-if="currentHighlightNotes.includes('thirds') && EThirds?.includes(index + 1)" class="note-names">E</span>
                        <span v-if="currentHighlightNotes.includes('fourths') && EFourths?.includes(index + 1)" class="note-names">F</span>
                        <span v-if="currentHighlightNotes.includes('fifths') && EFifths?.includes(index + 1)" class="note-names">G</span>
                        <span v-if="currentHighlightNotes.includes('sixths') && ESixths?.includes(index + 1)" class="note-names">A</span>
                        <span v-if="currentHighlightNotes.includes('sevenths') && ESevenths?.includes(index + 1)" class="note-names">B</span>
                    </div>
                </label>
            </div>
        </div>
    </div>
    <div class="d-flex text-nowrap">
        <div class="d-inline-block string-name">B</div>
        <div class="fret-start string-A">
            <div v-for="(_, index) in A" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                <label v-if="index < fretAmount" class="notes">
                    <input type="checkbox" v-model="A[index]"/>
                    <div class="checkbox__checkmark" 
                        :class="{
                            'root-note': currentHighlightNotes.includes('roots') ? ARoots?.includes(index + 1) : '', 
                            'second': currentHighlightNotes.includes('seconds') ? ASeconds?.includes(index + 1): '',
                            'third': currentHighlightNotes.includes('thirds') ? AThirds?.includes(index + 1) : '',
                            'fourth': currentHighlightNotes.includes('fourths') ? AFourths?.includes(index + 1) : '',
                            'fifth': currentHighlightNotes.includes('fifths') ? AFifths?.includes(index + 1) : '',
                            'sixth': currentHighlightNotes.includes('sixths') ? ASixths?.includes(index + 1) : '',
                            'seventh': currentHighlightNotes.includes('sevenths') ? ASevenths?.includes(index + 1) : '',
                            'blue': currentHighlightNotes.includes('blues') ? ABlues?.includes(index + 1) : '',
                        }">
                        <span v-if="currentHighlightNotes.includes('roots') && ARoots?.includes(index + 1)" class="note-names">C</span>
                        <span v-if="currentHighlightNotes.includes('seconds') && ASeconds?.includes(index + 1)" class="note-names">D</span>
                        <span v-if="currentHighlightNotes.includes('thirds') && AThirds?.includes(index + 1)" class="note-names">E</span>
                        <span v-if="currentHighlightNotes.includes('fourths') && AFourths?.includes(index + 1)" class="note-names">F</span>
                        <span v-if="currentHighlightNotes.includes('fifths') && AFifths?.includes(index + 1)" class="note-names">G</span>
                        <span v-if="currentHighlightNotes.includes('sixths') && ASixths?.includes(index + 1)" class="note-names">A</span>
                        <span v-if="currentHighlightNotes.includes('sevenths') && ASevenths?.includes(index + 1)" class="note-names">B</span>
                    </div>
                </label>
            </div>
        </div>
    </div>
    <div class="d-flex text-nowrap">
        <div class="d-inline-block string-name">G</div>
        <div class="fret-start string-D">
            <div v-for="(_, index) in D" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                <label v-if="index < fretAmount" class="notes">
                    <input type="checkbox" v-model="D[index]"/>
                    <div class="checkbox__checkmark" 
                        :class="{
                            'root-note': currentHighlightNotes.includes('roots') ? DRoots?.includes(index + 1) : '', 
                            'second': currentHighlightNotes.includes('seconds') ? DSeconds?.includes(index + 1): '',
                            'third': currentHighlightNotes.includes('thirds') ? DThirds?.includes(index + 1) : '',
                            'fourth': currentHighlightNotes.includes('fourths') ? DFourths?.includes(index + 1) : '',
                            'fifth': currentHighlightNotes.includes('fifths') ? DFifths?.includes(index + 1) : '',
                            'sixth': currentHighlightNotes.includes('sixths') ? DSixths?.includes(index + 1) : '',
                            'seventh': currentHighlightNotes.includes('sevenths') ? DSevenths?.includes(index + 1) : '',
                            'blue': currentHighlightNotes.includes('blues') ? DBlues?.includes(index + 1) : '',
                        }">
                        <span v-if="currentHighlightNotes.includes('roots') && DRoots?.includes(index + 1)" class="note-names">C</span>
                        <span v-if="currentHighlightNotes.includes('seconds') && DSeconds?.includes(index + 1)" class="note-names">D</span>
                        <span v-if="currentHighlightNotes.includes('thirds') && DThirds?.includes(index + 1)" class="note-names">E</span>
                        <span v-if="currentHighlightNotes.includes('fourths') && DFourths?.includes(index + 1)" class="note-names">F</span>
                        <span v-if="currentHighlightNotes.includes('fifths') && DFifths?.includes(index + 1)" class="note-names">G</span>
                        <span v-if="currentHighlightNotes.includes('sixths') && DSixths?.includes(index + 1)" class="note-names">A</span>
                        <span v-if="currentHighlightNotes.includes('sevenths') && DSevenths?.includes(index + 1)" class="note-names">B</span>
                    </div>
                </label>
            </div>
        </div>
    </div>
    <div class="d-flex text-nowrap">
        <div class="d-inline-block string-name">D</div>
        <div class="fret-start string-G">
            <div v-for="(_, index) in G" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                <label v-if="index < fretAmount" class="notes">
                    <input type="checkbox" v-model="G[index]"/>
                    <div class="checkbox__checkmark" 
                        :class="{
                            'root-note': currentHighlightNotes.includes('roots') ? GRoots?.includes(index + 1) : '', 
                            'second': currentHighlightNotes.includes('seconds') ? GSeconds?.includes(index + 1): '',
                            'third': currentHighlightNotes.includes('thirds') ? GThirds?.includes(index + 1) : '',
                            'fourth': currentHighlightNotes.includes('fourths') ? GFourths?.includes(index + 1) : '',
                            'fifth': currentHighlightNotes.includes('fifths') ? GFifths?.includes(index + 1) : '',
                            'sixth': currentHighlightNotes.includes('sixths') ? GSixths?.includes(index + 1) : '',
                            'seventh': currentHighlightNotes.includes('sevenths') ? GSevenths?.includes(index + 1) : '',
                            'blue': currentHighlightNotes.includes('blues') ? GBlues?.includes(index + 1) : '',
                        }">
                        <span v-if="currentHighlightNotes.includes('roots') && GRoots?.includes(index + 1)" class="note-names">C</span>
                        <span v-if="currentHighlightNotes.includes('seconds') && GSeconds?.includes(index + 1)" class="note-names">D</span>
                        <span v-if="currentHighlightNotes.includes('thirds') && GThirds?.includes(index + 1)" class="note-names">E</span>
                        <span v-if="currentHighlightNotes.includes('fourths') && GFourths?.includes(index + 1)" class="note-names">F</span>
                        <span v-if="currentHighlightNotes.includes('fifths') && GFifths?.includes(index + 1)" class="note-names">G</span>
                        <span v-if="currentHighlightNotes.includes('sixths') && GSixths?.includes(index + 1)" class="note-names">A</span>
                        <span v-if="currentHighlightNotes.includes('sevenths') && GSevenths?.includes(index + 1)" class="note-names">B</span>
                    </div>
                </label>
            </div>
        </div>
    </div>
    <div class="d-flex text-nowrap">
        <div class="d-inline-block string-name">A</div>
        <div class="fret-start string-B">
            <div v-for="(_, index) in B" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                <label v-if="index < fretAmount" class="notes">
                    <input type="checkbox" v-model="B[index]"/>
                    <div class="checkbox__checkmark" 
                        :class="{
                            'root-note': currentHighlightNotes.includes('roots') ? BRoots?.includes(index + 1) : '', 
                            'second': currentHighlightNotes.includes('seconds') ? BSeconds?.includes(index + 1): '',
                            'third': currentHighlightNotes.includes('thirds') ? BThirds?.includes(index + 1) : '',
                            'fourth': currentHighlightNotes.includes('fourths') ? BFourths?.includes(index + 1) : '',
                            'fifth': currentHighlightNotes.includes('fifths') ? BFifths?.includes(index + 1) : '',
                            'sixth': currentHighlightNotes.includes('sixths') ? BSixths?.includes(index + 1) : '',
                            'seventh': currentHighlightNotes.includes('sevenths') ? BSevenths?.includes(index + 1) : '',
                            'blue': currentHighlightNotes.includes('blues') ? BBlues?.includes(index + 1) : '',
                        }">
                        <span v-if="currentHighlightNotes.includes('roots') && BRoots?.includes(index + 1)" class="note-names">C</span>
                        <span v-if="currentHighlightNotes.includes('seconds') && BSeconds?.includes(index + 1)" class="note-names">D</span>
                        <span v-if="currentHighlightNotes.includes('thirds') && BThirds?.includes(index + 1)" class="note-names">E</span>
                        <span v-if="currentHighlightNotes.includes('fourths') && BFourths?.includes(index + 1)" class="note-names">F</span>
                        <span v-if="currentHighlightNotes.includes('fifths') && BFifths?.includes(index + 1)" class="note-names">G</span>
                        <span v-if="currentHighlightNotes.includes('sixths') && BSixths?.includes(index + 1)" class="note-names">A</span>
                        <span v-if="currentHighlightNotes.includes('sevenths') && BSevenths?.includes(index + 1)" class="note-names">B</span>
                    </div>
                </label>
            </div>
        </div>
    </div>
    <div class="d-flex text-nowrap">
        <div class="d-inline-block string-name">E</div>
        <div class="fret-start string-e last-string">
            <div v-for="(_, index) in e" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" style="border-right: none">
                <label v-if="index < fretAmount" class="notes">
                    <input type="checkbox" v-model="e[index]"/>
                    <div class="checkbox__checkmark" 
                        :class="{
                            'root-note': currentHighlightNotes.includes('roots') ? eRoots?.includes(index + 1) : '', 
                            'second': currentHighlightNotes.includes('seconds') ? eSeconds?.includes(index + 1): '',
                            'third': currentHighlightNotes.includes('thirds') ? eThirds?.includes(index + 1) : '',
                            'fourth': currentHighlightNotes.includes('fourths') ? eFourths?.includes(index + 1) : '',
                            'fifth': currentHighlightNotes.includes('fifths') ? eFifths?.includes(index + 1) : '',
                            'sixth': currentHighlightNotes.includes('sixths') ? eSixths?.includes(index + 1) : '',
                            'seventh': currentHighlightNotes.includes('sevenths') ? eSevenths?.includes(index + 1) : '',
                            'blue': currentHighlightNotes.includes('blues') ? eBlues?.includes(index + 1) : '',
                        }">
                        <span v-if="currentHighlightNotes.includes('roots') && eRoots?.includes(index + 1)" class="note-names">C</span>
                        <span v-if="currentHighlightNotes.includes('seconds') && eSeconds?.includes(index + 1)" class="note-names">D</span>
                        <span v-if="currentHighlightNotes.includes('thirds') && eThirds?.includes(index + 1)" class="note-names">E</span>
                        <span v-if="currentHighlightNotes.includes('fourths') && eFourths?.includes(index + 1)" class="note-names">F</span>
                        <span v-if="currentHighlightNotes.includes('fifths') && eFifths?.includes(index + 1)" class="note-names">G</span>
                        <span v-if="currentHighlightNotes.includes('sixths') && eSixths?.includes(index + 1)" class="note-names">A</span>
                        <span v-if="currentHighlightNotes.includes('sevenths') && eSevenths?.includes(index + 1)" class="note-names">B</span>
                    </div>
                </label>
            </div>
        </div>
    </div>
    <!-- CAGED  -->
    <div v-for="(_, index) in e" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" style="border-right: none;">
        <div v-if="index < fretAmount">
            <div v-if="GetCAGEDPosition(index)" style="white-space: nowrap;">
                {{ GetCAGEDName(index) }}
            </div>
        </div>
    </div>
    <div class="mt-5">
        <span class="me-3 text-yellow fw-bold">
            Number of Frets
        </span>
        <input type="range" min="12" max="24" step="1" v-model="fretAmount">
        <span class="ms-3 text-yellow fw-bold">
            {{ fretAmount }}
        </span>
    </div>
</template>

<style scoped lang="scss">
.custom-radio {
    min-width: 50px;
}

.custom-radio input {
    display: none;
}

.custom-radio input:checked + .label {
    border: 3px solid $yellow;
    border-radius: 9px;
    padding: 5px;
    color: $yellow;
}

/* FRETBOARD */
.fret-indicator {
    min-width: 50px;
    height: 40px;
}

.string-name {
    width: 30px;
    margin-top: -13px;
}

.fret-start {
    border-left: 3px solid #8f8575;
}

.string-E {
    border-top: 1px solid #8f8575;
}

.string-A {
    border-top: 1.5px solid #8f8575;
}

.string-D {
    border-top: 2px solid #8f8575;
}

.string-G {
    border-top: 2.5px solid #8f8575;
}

.string-B {
    border-top: 3px solid #8f8575;
}

.string-e {
    border-top: 3.5px solid #8f8575;
}

.last-string {
    border-left-color: transparent;
}

.fret {
    min-width: 50px;
    max-width: 50px;
    border-right: 1px solid gray;
}

/* Range Input */
/* Thank you, https://range-input-css.netlify.app/ 
    for this awesome range input. */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 25rem;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]::-webkit-slider-runnable-track {
  background-color: #242525;
  border-radius: 0.5rem;
  height: 1rem;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; 
  appearance: none;
  margin-top: -8px;
  background-color: $yellow;
  opacity: 0.75;
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
}

input[type="range"]:focus::-webkit-slider-thumb {
  outline: 3px solid #808080;
  outline-offset: 0.125rem;
}


input[type="range"]::-moz-range-track {
  background-color: #c1c9cd;
  border-radius: 0.5rem;
  height: 1rem;
}


input[type="range"]::-moz-range-thumb {
  background-color: #808080;
  border: none; 
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
}

input[type="range"]:focus::-moz-range-thumb{
  outline: 3px solid #808080;
  outline-offset: 0.125rem;
}
</style>
