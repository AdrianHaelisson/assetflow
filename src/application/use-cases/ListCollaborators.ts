import { User, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export interface ListCollaboratorsDTO {
  companyId: string;
}

export class ListCollaborators {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: ListCollaboratorsDTO): Promise<User[]> {
    return await this.userRepository.findAllByCompanyId(dto.companyId);
  }
}
