
export const Mode = {
    DRAW: 'draw' as string,
    ERASE: 'erase' as string,
    FILL: 'fill' as string,
    MARK: 'mark' as string,
    STOP: 'stop' as string,
    SPUIT: 'spuit' as string,
    SELECT: 'select' as string,
    MOVE: 'move' as string
} as const;
export type ModeType = typeof Mode[keyof typeof Mode];
