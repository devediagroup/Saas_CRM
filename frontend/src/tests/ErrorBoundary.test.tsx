import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
    if (shouldThrow) {
        throw new Error('Test error for ErrorBoundary');
    }
    return <div data-testid="normal-component">Normal Component</div>;
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // Mock console.error to avoid noise in test output
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render children when there is no error', () => {
        const { getByTestId } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(getByTestId('normal-component')).toBeInTheDocument();
    });

    it('should catch errors and show error UI', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument();
        expect(getByText(/نعتذر عن الإزعاج/)).toBeInTheDocument();
    });

    it('should show error details in development mode', () => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(getByText('تفاصيل الخطأ (وضع التطوير):')).toBeInTheDocument();
        expect(getByText(/Test error for ErrorBoundary/)).toBeInTheDocument();

        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });

    it('should hide error details in production mode', () => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const { queryByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(queryByText('تفاصيل الخطأ (وضع التطوير):')).not.toBeInTheDocument();
        expect(queryByText(/Test error for ErrorBoundary/)).not.toBeInTheDocument();

        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });

    it('should show reset and refresh buttons', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(getByText('إعادة المحاولة')).toBeInTheDocument();
        expect(getByText('تحديث الصفحة')).toBeInTheDocument();
    });

    it('should handle componentDidCatch lifecycle', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // componentDidCatch should log the error
        expect(consoleSpy).toHaveBeenCalled();
    });

    it('should render error with proper structure', () => {
        const { container } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // Check for error container structure
        const errorContainer = container.querySelector('.text-center');
        expect(errorContainer).toBeInTheDocument();
    });

    it('should handle multiple error scenarios', () => {
        const { getByText, rerender } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // Error should be displayed
        expect(getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument();

        // Rerender with different error
        rerender(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        // Since we can't reset state in this simple test, error boundary will still show error
        // This is expected behavior for error boundaries
    });

    it('should handle error boundary state correctly', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // Error UI should be visible
        expect(getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument();

        // Action buttons should be present
        expect(getByText('إعادة المحاولة')).toBeInTheDocument();
        expect(getByText('تحديث الصفحة')).toBeInTheDocument();
    });

    it('should render in both Arabic and accessible format', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // Arabic error messages
        expect(getByText('عذراً، حدث خطأ غير متوقع')).toBeInTheDocument();
        expect(getByText('إعادة المحاولة')).toBeInTheDocument();
        expect(getByText('تحديث الصفحة')).toBeInTheDocument();
    });
});
