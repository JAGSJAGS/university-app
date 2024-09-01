export interface Subject {
    id: string;
    name: string;
    code: string;
    quarts: string[];
    validate: boolean,
    fail: boolean,
    requirement: string [],
    credit: number
}

export interface Year {
    id: number;
    year: number;
    subjects: Subject[];
}

export interface Career {
    id: number
    name: string;
    years: Year[];
}