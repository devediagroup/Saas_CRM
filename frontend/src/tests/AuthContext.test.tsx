import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Test component that uses useAuth
const TestComponent = () => {
    const { user, isAuthenticated, isLoading, login, logout, hasPermission } = useAuth();

    if (isLoading) return <div data-testid="loading">Loading...</div>;

    return (
        <div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user">{user ? user.email : 'no user'}</div>
            <button data-testid="login" onClick={() => login('test@example.com', 'password')}>
                Login
            </button>
            <button data-testid="logout" onClick={logout}>
                Logout
            </button>
            <div data-testid="has-permission">
                {hasPermission('leads.read') ? 'has-permission' : 'no-permission'}
            </div>
        </div>
    );
};

const renderWithAuth = () => {
    return render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(null);
    });

    describe('Initial State', () => {
        it('should initialize with null user and loading state', () => {
            renderWithAuth();

            expect(screen.getByTestId('loading')).toBeInTheDocument();
        });

        it('should check for existing token on mount', async () => {
            mockLocalStorage.getItem.mockReturnValue('test-token');
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: '1',
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User',
                    role: 'USER',
                    company_id: 'company1',
                }),
            });

            renderWithAuth();

            // Wait for loading to finish
            await screen.findByTestId('authenticated');

            expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
                signal: expect.any(AbortSignal),
                headers: {
                    Authorization: 'Bearer test-token',
                },
            });
        });
    });

    describe('Login', () => {
        it('should login successfully', async () => {
            const mockUserData = {
                id: '1',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                role: 'USER',
                company_id: 'company1',
            };

            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        token: 'new-token',
                        user: mockUserData,
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        permissions: ['leads.read', 'properties.read'],
                    }),
                });

            renderWithAuth();

            // Wait for initial load
            await screen.findByTestId('authenticated');

            // Login
            const loginButton = screen.getByTestId('login');
            loginButton.click();

            // Wait for login to complete
            await screen.findByText('test@example.com');

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
            expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        });
    });

    describe('Logout', () => {
        it('should logout successfully', async () => {
            renderWithAuth();

            // Wait for initial load
            await screen.findByTestId('authenticated');

            // Logout
            const logoutButton = screen.getByTestId('logout');
            logoutButton.click();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
            expect(screen.getByTestId('user')).toHaveTextContent('no user');
        });
    });

    describe('Permissions', () => {
        it('should grant all permissions to SUPER_ADMIN', async () => {
            // Mock login with SUPER_ADMIN user
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        token: 'token',
                        user: {
                            id: '1',
                            email: 'admin@example.com',
                            first_name: 'Super',
                            last_name: 'Admin',
                            role: 'SUPER_ADMIN',
                            company_id: 'company1',
                        },
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        permissions: [],
                    }),
                });

            renderWithAuth();

            // Wait for initial load
            await screen.findByTestId('authenticated');

            // Login
            const loginButton = screen.getByTestId('login');
            loginButton.click();

            // Wait for login to complete
            await screen.findByText('admin@example.com');

            // SUPER_ADMIN should have permissions
            expect(screen.getByTestId('has-permission')).toHaveTextContent('has-permission');
        });

        it('should check specific permissions for regular users', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        token: 'token',
                        user: {
                            id: '1',
                            email: 'test@example.com',
                            first_name: 'Test',
                            last_name: 'User',
                            role: 'USER',
                            company_id: 'company1',
                            permissions: ['leads.read', 'properties.read'], // Include permissions directly
                        },
                    }),
                });

            renderWithAuth();

            // Wait for initial load
            await screen.findByTestId('authenticated');

            // Login
            const loginButton = screen.getByTestId('login');
            loginButton.click();

            // Wait for login to complete
            await screen.findByText('test@example.com');

            // Should have the specific permission
            expect(screen.getByTestId('has-permission')).toHaveTextContent('has-permission');
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            mockLocalStorage.getItem.mockReturnValue('test-token');
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            renderWithAuth();

            // Wait for error handling
            await screen.findByTestId('authenticated');

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
            expect(screen.getByTestId('user')).toHaveTextContent('no user');
        });
    });
});
