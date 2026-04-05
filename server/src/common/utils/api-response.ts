export function successResponse(message: string, data?: unknown) {
    return {
        message,
        data,
    };
}