import React from 'react';

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => ({}),
  Link: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
  NavLink: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: ({ element }) => React.createElement('div', null, element),
}));

export { mockNavigate, mockLocation };
