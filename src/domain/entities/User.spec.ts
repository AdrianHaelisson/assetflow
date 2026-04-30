import { describe, it, expect } from 'bun:test';
import { User, UserRole } from './User';

describe('User Entity', () => {
  const validProps = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    passwordHash: 'hashed_password_123',
    role: UserRole.ADMIN,
    companyId: 'company-uuid-123',
  };

  it('should create a valid user', () => {
    const user = new User(validProps);
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it('should throw an error if email is invalid', () => {
    expect(() => {
      new User({ ...validProps, email: 'invalid-email' });
    }).toThrow('É necessário um e-mail válido');
  });

  it('should throw an error if name is empty', () => {
    expect(() => {
      new User({ ...validProps, name: '' });
    }).toThrow('O nome é obrigatório');
  });
});
