import { describe, it, expect, mock, beforeEach } from 'bun:test';

import { PrismaUserRepository } from './PrismaUserRepository';
import { User, UserRole } from '../../domain/entities/User';

const mockCreate = mock();
const mockFindUnique = mock();
const mockFindMany = mock();
const mockUpdate = mock();

mock.module('../database/prisma', () => ({
  prisma: {
    user: {
      create: mockCreate,
      findUnique: mockFindUnique,
      findMany: mockFindMany,
      update: mockUpdate,
    }
  }
}));

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;

  beforeEach(() => {
    repository = new PrismaUserRepository();
    mockCreate.mockClear();
    mockFindUnique.mockClear();
    mockFindMany.mockClear();
    mockUpdate.mockClear();
  });

  it('should save a user', async () => {
    const user = new User({
      id: 'user1',
      name: 'John',
      email: 'john@example.com',
      passwordHash: 'hash',
        role: UserRole.ADMIN,
      companyId: 'comp1'
    });

    mockCreate.mockResolvedValue({});
    await repository.save(user);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'user1',
        name: 'John',
        email: 'john@example.com'
      })
    });
  });

  it('should find user by id', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'user1',
      name: 'John',
      email: 'john@example.com',
      passwordHash: 'hash',
        role: UserRole.ADMIN,
      companyId: 'comp1'
    });

    const user = await repository.findById('user1');
    expect(user?.name).toBe('John');
    expect(user?.role).toBe(UserRole.ADMIN);
  });

  it('should return null if not found by id', async () => {
    mockFindUnique.mockResolvedValue(null);
    const user = await repository.findById('user1');
    expect(user).toBeNull();
  });

  it('should find user by email', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'user1',
      name: 'John',
      email: 'john@example.com',
      passwordHash: 'hash',
        role: UserRole.ADMIN,
      companyId: 'comp1'
    });

    const user = await repository.findByEmail('john@example.com');
    expect(user?.id).toBe('user1');
  });

  it('should return null if not found by email', async () => {
    mockFindUnique.mockResolvedValue(null);
    const user = await repository.findByEmail('unknown@example.com');
    expect(user).toBeNull();
  });

  it('should find all users by companyId', async () => {
    mockFindMany.mockResolvedValue([{
      id: 'user1',
      name: 'John',
      email: 'john@example.com',
      passwordHash: 'hash',
        role: UserRole.ADMIN,
      companyId: 'comp1'
    }]);

    const users = await repository.findAllByCompanyId('comp1');
    expect(users.length).toBe(1);
    expect((users as any)[0].name).toBe('John');
  });

  it('should update user', async () => {
    const user = new User({
      id: 'user1',
      name: 'John Updated',
      email: 'john@example.com',
      passwordHash: 'hash',
        role: UserRole.ADMIN,
      companyId: 'comp1'
    });

    mockUpdate.mockResolvedValue({});
    await repository.update(user);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user1' },
      data: expect.objectContaining({ name: 'John Updated' })
    });
  });

  it('should soft delete user', async () => {
    mockUpdate.mockResolvedValue({});
    await repository.delete('user1');

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user1' },
      data: expect.objectContaining({ deletedAt: expect.any(Date) })
    });
  });
});
