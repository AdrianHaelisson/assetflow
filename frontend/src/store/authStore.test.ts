import { describe, it, expect, beforeEach } from 'bun:test';
import { useAuthStore } from '../store/authStore';

const mockUser = { id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN', companyId: 'comp1' };

describe('authStore', () => {
  beforeEach(() => useAuthStore.setState({ token: null, user: null }));

  it('should start unauthenticated', () => {
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('should store token and user on login', () => {
    useAuthStore.getState().login('jwt-token-123', mockUser);
    expect(useAuthStore.getState().token).toBe('jwt-token-123');
    expect(useAuthStore.getState().user?.email).toBe('admin@test.com');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('should clear token and user on logout', () => {
    useAuthStore.getState().login('some-token', mockUser);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });
});
