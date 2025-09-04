import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ApiError } from '../lib/api';

interface ErrorState {
    error: Error | ApiError | null;
    isVisible: boolean;
}

interface ErrorContextType {
    error: ErrorState;
    showError: (error: Error | ApiError | string) => void;
    hideError: () => void;
    clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

interface ErrorProviderProps {
    children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
    const [error, setError] = useState<ErrorState>({
        error: null,
        isVisible: false,
    });

    const showError = (errorInput: Error | ApiError | string) => {
        const errorObj = typeof errorInput === 'string'
            ? new Error(errorInput)
            : errorInput;

        setError({
            error: errorObj,
            isVisible: true,
        });

        // Auto-hide after 5 seconds for non-critical errors
        if (!(errorObj instanceof ApiError) || errorObj.status !== 401) {
            setTimeout(() => {
                hideError();
            }, 5000);
        }
    };

    const hideError = () => {
        setError(prev => ({
            ...prev,
            isVisible: false,
        }));
    };

    const clearError = () => {
        setError({
            error: null,
            isVisible: false,
        });
    };

    return (
        <ErrorContext.Provider value={{ error, showError, hideError, clearError }}>
            {children}
            {error.isVisible && error.error && (
                <ErrorNotification
                    error={error.error}
                    onClose={hideError}
                    onClear={clearError}
                />
            )}
        </ErrorContext.Provider>
    );
};

interface ErrorNotificationProps {
    error: Error | ApiError;
    onClose: () => void;
    onClear: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
    error,
    onClose,
    onClear
}) => {
    const isApiError = error instanceof ApiError;
    const isAuthError = isApiError && error.status === 401;
    const isCritical = isApiError && [500, 502, 503, 504].includes(error.status || 0);

    const getErrorIcon = () => {
        if (isAuthError) {
            return (
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            );
        }

        if (isCritical) {
            return (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            );
        }

        return (
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        );
    };

    const getBgColor = () => {
        if (isAuthError) return 'bg-yellow-50 border-yellow-200';
        if (isCritical) return 'bg-red-50 border-red-200';
        return 'bg-blue-50 border-blue-200';
    };

    const getTextColor = () => {
        if (isAuthError) return 'text-yellow-800';
        if (isCritical) return 'text-red-800';
        return 'text-blue-800';
    };

    return (
        <div className="fixed top-4 right-4 max-w-sm w-full z-50 animate-slide-in">
            <div className={`rounded-md border p-4 ${getBgColor()}`}>
                <div className="flex">
                    <div className="flex-shrink-0">
                        {getErrorIcon()}
                    </div>
                    <div className="ml-3">
                        <h3 className={`text-sm font-medium ${getTextColor()}`}>
                            {isApiError ? `خطأ ${error.status || ''}` : 'خطأ'}
                        </h3>
                        <div className={`mt-2 text-sm ${getTextColor()}`}>
                            <p>{error.message}</p>
                            {isApiError && error.code && (
                                <p className="mt-1 text-xs opacity-75">
                                    كود الخطأ: {error.code}
                                </p>
                            )}
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                {!isAuthError && (
                                    <button
                                        type="button"
                                        onClick={onClear}
                                        className={`rounded-md px-2 py-1.5 text-sm font-medium hover:bg-opacity-20 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTextColor()}`}
                                    >
                                        المحاولة مرة أخرى
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`mr-3 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-opacity-20 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTextColor()}`}
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
