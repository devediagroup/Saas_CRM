import React, { ReactNode } from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorProvider, useError } from '../contexts/ErrorContext';
import { ApiError } from '../lib/api';

// Test component to interact with ErrorContext
const TestComponent: React.FC<{
    triggerError?: () => void;
    triggerApiError?: () => void;
}> = ({ triggerError, triggerApiError }) => {
    const {
        error,
        showError,
        hideError,
        clearError
    } = useError();

    React.useEffect(() => {
        if (triggerError) {
            triggerError();
        }
        if (triggerApiError) {
            triggerApiError();
        }
    }, [triggerError, triggerApiError]);

    return (
        <div>
            <div data-testid="error-message">
                {error.error ? error.error.message : ''}
            </div>
            <div data-testid="error-visible">
                {error.isVisible ? 'visible' : 'hidden'}
            </div>
            <div data-testid="error-type">
                {error.error instanceof ApiError ? 'api-error' :
                    error.error instanceof Error ? 'error' : 'none'}
            </div>
            <button onClick={() => showError('Test error message')}>Show Error</button>
            <button onClick={() => showError(new Error('Native error'))}>Show Native Error</button>
            <button onClick={() => showError(new ApiError('API Error', 500))}>Show API Error</button>
            <button onClick={hideError}>Hide Error</button>
            <button onClick={clearError}>Clear Error</button>
        </div>
    );
};

// Wrapper component for testing
const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ErrorProvider>
        {children}
    </ErrorProvider>
);

describe('ErrorContext', () => {
    beforeEach(() => {
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should provide error context to children', () => {
        const { getByTestId } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        expect(getByTestId('error-message')).toBeInTheDocument();
        expect(getByTestId('error-visible')).toBeInTheDocument();
        expect(getByTestId('error-type')).toBeInTheDocument();
    });

    it('should start with no error state', () => {
        const { getByTestId } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        expect(getByTestId('error-message')).toHaveTextContent('');
        expect(getByTestId('error-visible')).toHaveTextContent('hidden');
        expect(getByTestId('error-type')).toHaveTextContent('none');
    });

    it('should show error when showError is called with string', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        act(() => {
            getByText('Show Error').click();
        });

        expect(getByTestId('error-message')).toHaveTextContent('Test error message');
        expect(getByTestId('error-visible')).toHaveTextContent('visible');
        expect(getByTestId('error-type')).toHaveTextContent('error');
    });

    it('should show error when showError is called with Error object', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        act(() => {
            getByText('Show Native Error').click();
        });

        expect(getByTestId('error-message')).toHaveTextContent('Native error');
        expect(getByTestId('error-visible')).toHaveTextContent('visible');
        expect(getByTestId('error-type')).toHaveTextContent('error');
    });

    it('should show error when showError is called with ApiError', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        act(() => {
            getByText('Show API Error').click();
        });

        expect(getByTestId('error-message')).toHaveTextContent('API Error');
        expect(getByTestId('error-visible')).toHaveTextContent('visible');
        expect(getByTestId('error-type')).toHaveTextContent('api-error');
    });

    it('should hide error when hideError is called', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        // First show an error
        act(() => {
            getByText('Show Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('visible');

        // Then hide it
        act(() => {
            getByText('Hide Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('hidden');
        // Error message should still be there, just hidden
        expect(getByTestId('error-message')).toHaveTextContent('Test error message');
    });

    it('should clear error when clearError is called', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        // First show an error
        act(() => {
            getByText('Show Error').click();
        });

        expect(getByTestId('error-message')).toHaveTextContent('Test error message');

        // Then clear it
        act(() => {
            getByText('Clear Error').click();
        });

        expect(getByTestId('error-message')).toHaveTextContent('');
        expect(getByTestId('error-visible')).toHaveTextContent('hidden');
        expect(getByTestId('error-type')).toHaveTextContent('none');
    });

    it('should auto-hide non-401 errors after timeout', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        // Show a regular error
        act(() => {
            getByText('Show Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('visible');

        // Fast-forward time to trigger auto-hide
        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(getByTestId('error-visible')).toHaveTextContent('hidden');
    });

    it('should NOT auto-hide 401 errors', () => {
        const TestWith401Error: React.FC = () => {
            const { showError } = useError();

            return (
                <button
                    onClick={() => {
                        const apiError = new ApiError('Unauthorized', 401);
                        showError(apiError);
                    }}
                >
                    Show 401 Error
                </button>
            );
        };

        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestWith401Error />
                <TestComponent />
            </TestWrapper>
        );

        // Show a 401 error
        act(() => {
            getByText('Show 401 Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('visible');

        // Fast-forward time beyond normal auto-hide timeout
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        // 401 error should still be visible
        expect(getByTestId('error-visible')).toHaveTextContent('visible');
    });

    it('should handle ApiError instances correctly', () => {
        const TestWithCustomApiError: React.FC = () => {
            const { showError } = useError();

            return (
                <button
                    onClick={() => {
                        const apiError = new ApiError('API failed', 500, 'SERVER_ERROR');
                        showError(apiError);
                    }}
                >
                    Trigger API Error
                </button>
            );
        };

        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestWithCustomApiError />
                <TestComponent />
            </TestWrapper>
        );

        act(() => {
            getByText('Trigger API Error').click();
        });

        expect(getByTestId('error-message')).toHaveTextContent('API failed');
        expect(getByTestId('error-visible')).toHaveTextContent('visible');
        expect(getByTestId('error-type')).toHaveTextContent('api-error');
    });

    it('should handle multiple consecutive errors', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        // Show first error
        act(() => {
            getByText('Show Error').click();
        });
        expect(getByTestId('error-message')).toHaveTextContent('Test error message');

        // Show API error (should replace first error)
        act(() => {
            getByText('Show API Error').click();
        });
        expect(getByTestId('error-message')).toHaveTextContent('API Error');
        expect(getByTestId('error-type')).toHaveTextContent('api-error');

        // Show native error (should replace API error)
        act(() => {
            getByText('Show Native Error').click();
        });
        expect(getByTestId('error-message')).toHaveTextContent('Native error');
        expect(getByTestId('error-type')).toHaveTextContent('error');
    });

    it('should provide all required context functions', () => {
        const functionCalls: string[] = [];

        const TestWithFunctionCapture: React.FC = () => {
            const { showError, hideError, clearError } = useError();

            return (
                <div>
                    <button
                        onClick={() => {
                            showError('Function test');
                            functionCalls.push('showError');
                        }}
                    >
                        Test showError
                    </button>
                    <button
                        onClick={() => {
                            hideError();
                            functionCalls.push('hideError');
                        }}
                    >
                        Test hideError
                    </button>
                    <button
                        onClick={() => {
                            clearError();
                            functionCalls.push('clearError');
                        }}
                    >
                        Test clearError
                    </button>
                </div>
            );
        };

        const { getByText } = render(
            <TestWrapper>
                <TestWithFunctionCapture />
            </TestWrapper>
        );

        act(() => {
            getByText('Test showError').click();
            getByText('Test hideError').click();
            getByText('Test clearError').click();
        });

        expect(functionCalls).toEqual(['showError', 'hideError', 'clearError']);
    });

    it('should handle empty string errors gracefully', () => {
        const TestWithEmptyError: React.FC = () => {
            const { showError } = useError();
            return (
                <button onClick={() => showError('')}>
                    Show Empty Error
                </button>
            );
        };

        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestWithEmptyError />
                <TestComponent />
            </TestWrapper>
        );

        act(() => {
            getByText('Show Empty Error').click();
        });

        expect(getByTestId('error-message')).toHaveTextContent('');
        expect(getByTestId('error-visible')).toHaveTextContent('visible');
    });

    it('should handle timeout cleanup properly', () => {
        const { getByTestId, getByText, unmount } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        // Show an error
        act(() => {
            getByText('Show Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('visible');

        // Unmount before timeout
        unmount();

        // Advance timers - should not cause any errors
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        // No assertions needed - just testing that cleanup works
    });

    it('should throw error when useError is used outside provider', () => {
        // Mock console.error to prevent error output in test
        const originalError = console.error;
        console.error = jest.fn();

        const TestWithoutProvider: React.FC = () => {
            const { showError } = useError();
            return <div>{showError.toString()}</div>;
        };

        expect(() => {
            render(<TestWithoutProvider />);
        }).toThrow('useError must be used within an ErrorProvider');

        // Restore console.error
        console.error = originalError;
    });

    it('should handle rapid successive error calls', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        // Rapidly show multiple errors
        act(() => {
            getByText('Show Error').click();
            getByText('Show Native Error').click();
            getByText('Show API Error').click();
        });

        // Should show the last error
        expect(getByTestId('error-message')).toHaveTextContent('API Error');
        expect(getByTestId('error-type')).toHaveTextContent('api-error');
    });

    it('should maintain error state consistency', () => {
        const { getByTestId, getByText } = render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        // Show error
        act(() => {
            getByText('Show Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('visible');
        expect(getByTestId('error-message')).toHaveTextContent('Test error message');

        // Hide error
        act(() => {
            getByText('Hide Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('hidden');
        expect(getByTestId('error-message')).toHaveTextContent('Test error message');

        // Clear error
        act(() => {
            getByText('Clear Error').click();
        });

        expect(getByTestId('error-visible')).toHaveTextContent('hidden');
        expect(getByTestId('error-message')).toHaveTextContent('');
    });
});
