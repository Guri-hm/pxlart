export const AlertColor = {
    success: 'success' as any,
    info: 'info' as any,
    warning: 'warning' as any,
    error: 'error' as any,
} as const;
export type AlertColorType = typeof AlertColor[keyof typeof AlertColor];

export type AlertMessageType = {
    message: string,
    type: AlertColorType,
    open: boolean
}
