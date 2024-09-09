export interface Subject {
    id: number;
    name: string;
    code: string;
    quarts: number[];
    validate: boolean,
    fail: boolean,
    requirements: number [],
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

export interface Careers {
    data: Career[]
}

export interface Years{
    data: Year[]
}

export interface Subjects{
    data: Subject[]
}

