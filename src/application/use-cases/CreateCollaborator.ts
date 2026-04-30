import { User, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export interface CreateCollaboratorDTO {
  name: string;
  email: string;
  companyId: string;
}

export class CreateCollaborator {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: CreateCollaboratorDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    
    if (existingUser) {
      throw new Error('Já existe um usuário com este e-mail');
    }

    const collaborator = new User({
      name: dto.name,
      email: dto.email,
      passwordHash: 'default-mock-hash-12345', // In real life, send to auth service/hash random
      companyId: dto.companyId,
      role: UserRole.CLIENT // Represents an employee/collaborator
    });

    await this.userRepository.save(collaborator);

    return collaborator;
  }
}
