export interface Subject {
    id: string;
    name: string;
    code: string;
    quarts: string[];
    validate: boolean
}

export interface Year {
    year: number;
    subjects: Subject[];
}

export interface Career {
    career: string;
    years: Year[];
}