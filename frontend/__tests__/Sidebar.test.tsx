import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../app/components/Sidebar';

describe('Sidebar Component', () => {
  const mockSetActiveTab = jest.fn();
  const mockHandleSignOut = jest.fn();
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the branding correctly', () => {
    render(
      <Sidebar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        email={mockEmail}
        handleSignOut={mockHandleSignOut}
      />
    );
    expect(screen.getByText('HyperMindZ')).toBeInTheDocument();
    expect(screen.getByText('Analytics Engine v1.0')).toBeInTheDocument();
  });

  it('renders all navigation tabs', () => {
    render(
      <Sidebar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        email={mockEmail}
        handleSignOut={mockHandleSignOut}
      />
    );
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Playground/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Data Catalog/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Settings/i).length).toBeGreaterThan(0);
  });

  it('calls setActiveTab when a navigation button is clicked', () => {
    render(
      <Sidebar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        email={mockEmail}
        handleSignOut={mockHandleSignOut}
      />
    );
    const playgroundBtns = screen.getAllByText(/Playground/i);
    fireEvent.click(playgroundBtns[0]);
    expect(mockSetActiveTab).toHaveBeenCalledWith('playground');
  });

  it('displays the user email and handles logout', () => {
    render(
      <Sidebar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        email={mockEmail}
        handleSignOut={mockHandleSignOut}
      />
    );
    expect(screen.getByText(mockEmail)).toBeInTheDocument();
    const logoutBtns = screen.getAllByTitle('Log Out');
    fireEvent.click(logoutBtns[0]);
    expect(mockHandleSignOut).toHaveBeenCalledTimes(1);
  });
});
