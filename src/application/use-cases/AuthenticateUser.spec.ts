import { describe, it, expect, mock, spyOn } from 'bun:test';
import { AuthenticateUser } from './AuthenticateUser';

const mockUser = {
  id: 'u1',
  name: 'Admin',
  email: 'admin@test.com',
  role: 'ADMIN',
  companyId: 'comp1',
  passwordHash: 'hashed_password',
};

mock.module('jsonwebtoken', () => ({
  default: { sign: mock().mockReturnValue('jwt.token.signed') },
}));

spyOn(Bun.password, 'verify').mockResolvedValue(true);

describe('AuthenticateUser Use Case', () => {
  const mockRepo = {
    findByEmail: mock(),
  };

  it('should return token and user when credentials are valid', async () => {
    mockRepo.findByEmail.mockResolvedValue(mockUser);
    const useCase = new AuthenticateUser(mockRepo as any);
    const result = await useCase.execute({ email: 'admin@test.com', password: 'correctPassword' });
    expect(result.token).toBe('jwt.token.signed');
    expect(result.user.email).toBe('admin@test.com');
  });

  it('should throw error when email is not found', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    const useCase = new AuthenticateUser(mockRepo as any);
    await expect(useCase.execute({ email: 'wrong@test.com', password: 'any' }))
      .rejects.toThrow('Credenciais inválidas');
  });

  it('should throw error when password is incorrect', async () => {
    spyOn(Bun.password, 'verify').mockResolvedValueOnce(false as never);
    mockRepo.findByEmail.mockResolvedValue(mockUser);
    const useCase = new AuthenticateUser(mockRepo as any);
    await expect(useCase.execute({ email: 'admin@test.com', password: 'wrongPass' }))
      .rejects.toThrow('Credenciais inválidas');
  });
});
