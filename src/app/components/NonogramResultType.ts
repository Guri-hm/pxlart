
export const enmStatus = {
    MISS: 0 as number,
    SUCCESS: 1 as number,
    EVALUATION: 2 as number,
    THANK: 3 as number
} as const;
export type ResultStatusType = typeof enmStatus[keyof typeof enmStatus];

export type ResultType = {
    open: boolean,
    result: ResultStatusType
}