import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

interface AuthDTO {
  email: string;
  password: string;
}

interface UserRepository {
  findByEmail: (email: string) => Promise<any | null>;
}

export class AuthenticateUser {
  constructor(private repo: UserRepository) {}

  async execute(dto: AuthDTO) {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) throw new Error('Credenciais inválidas');

    const passwordMatch = await Bun.password.verify(dto.password, user.passwordHash);
    if (!passwordMatch) throw new Error('Credenciais inválidas');

    const token = jwt.sign(
      { id: user.id, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
    };
  }
}
