/* eslint-disable */

type ErrorResponse = Record<string, string[]>;

interface NestedErrorResponse {
    errors?: string;
    details?: Record<string, string[]>;
}

type CombinedErrorResponse = ErrorResponse | NestedErrorResponse;

/**
 * Flattens and formats error messages from various error response types.
 * @param errorResponse The error response object from the backend.
 * @returns An array of formatted error messages.
 */

export function extractErrorMessages(errorResponse: CombinedErrorResponse): string[] {
    console.log('Extracting error messages from response:', errorResponse); 
    if (!errorResponse || typeof errorResponse !== 'object') {
        return ['An unknown error occurred.'];
    }

    const messages: string[] = [];

    // Check if it's the nested format with "errors" and "details"
    if ('errors' in errorResponse || 'details' in errorResponse) {
        const nestedResponse = errorResponse as NestedErrorResponse;
        
        // Add the general error message if it exists
        if (nestedResponse.errors && typeof nestedResponse.errors === 'string') {
            messages.push(nestedResponse.errors);
        }
        
        // Extract field-specific errors from details
        if (nestedResponse.details && typeof nestedResponse.details === 'object') {
            for (const [field, errors] of Object.entries(nestedResponse.details)) {
                if (Array.isArray(errors)) {
                    errors.forEach((msg) => {
                        // Optionally, include the field name in the message for clarity
                        messages.push(`${field}: ${msg}`);
                    });
                }
            }
        }
    } else {
        // Handle the original flat format
        const flatResponse = errorResponse as ErrorResponse;
        for (const [field, errors] of Object.entries(flatResponse)) {
            if (Array.isArray(errors)) {
                errors.forEach((msg) => {
                    // Optionally, include the field name in the message
                    messages.push(msg);
                });
            }
        }
    }

    return messages.length > 0 ? messages : ['An unknown error occurred.'];
}