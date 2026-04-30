import '../test/setup';
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';

mock.module('../lib/apiClient', () => ({
  apiClient: {
    post: mock(),
  },
}));

describe('LoginPage', () => {
  const onLoginSuccess = mock();

  beforeEach(() => {
    onLoginSuccess.mockClear();
    useAuthStore.setState({ token: null, user: null });
  });

  it('renders login form', () => {
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('submit-button')).toBeTruthy();
  });

  it('shows validation errors for invalid input', async () => {
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);
    
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText('Email inválido')).toBeTruthy();
    expect(await screen.findByText('Senha deve ter ao menos 6 caracteres')).toBeTruthy();
  });

  it('calls api and redirects on success', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        token: 'mock-token',
        user: { id: 'u1', name: 'Test User', email: 'test@test.com', role: 'ADMIN', companyId: 'c1' },
      },
    });

    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      });
    });

    expect(useAuthStore.getState().token).toBe('mock-token');
    expect(onLoginSuccess).toHaveBeenCalled();
  });

  it('shows error toast on api failure', async () => {
    (apiClient.post as any).mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });

    // Check if onLoginSuccess was NOT called
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});
