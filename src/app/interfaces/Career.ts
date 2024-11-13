export interface Subject {
    id: number;
    name: string;
    code: string;
    quarts: number[];
    validate: boolean,
    fail: boolean,
    requirements: number [],
    credit: number,
    link: string,
    group: Group[],
    groups: number [],
    critic: boolean,
    career_id: number
}

export interface Group {
    id: number,
    name: string
}

export interface Year {
    id: number;
    year: number;
    subjects: Subject[];
    career_id: number
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

