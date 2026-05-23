import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainDashboard from '../app/page';

// Mock child components to isolate auth wall testing
jest.mock('../app/components/Sidebar', () => () => <div data-testid="sidebar-mock" />);
jest.mock('../app/components/Playground', () => () => <div data-testid="playground-mock" />);
jest.mock('../app/components/DataCatalog', () => () => <div data-testid="catalog-mock" />);
jest.mock('../app/components/Settings', () => () => <div data-testid="settings-mock" />);

describe('MainDashboard Auth Wall', () => {
  beforeEach(() => {
    // Clear localStorage between tests
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the Auth Wall when no token is present', () => {
    render(<MainDashboard />);
    expect(screen.getByText('HyperMindZ Analytics')).toBeInTheDocument();
    expect(screen.getByText('Natural Language Tabular Query Console')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('toggles between Sign In and Create Account modes', () => {
    render(<MainDashboard />);
    
    // Default mode should be Sign In
    const signInBtns = screen.getAllByText(/Sign In/i);
    const createAccountBtns = screen.getAllByText(/Create Account/i);
    
    expect(screen.getByText('Enter your credentials to access your isolated data sandbox.')).toBeInTheDocument();
    
    // Switch to Create Account
    fireEvent.click(createAccountBtns[0]);
    expect(screen.getByText('Register a secure account to load datasets and get SQL insights.')).toBeInTheDocument();
    
    // Switch back to Sign In
    fireEvent.click(signInBtns[0]);
    expect(screen.getByText('Enter your credentials to access your isolated data sandbox.')).toBeInTheDocument();
  });
});
