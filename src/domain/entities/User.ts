export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  EMPLOYEE = 'EMPLOYEE',
  CLIENT = 'CLIENT',
}

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  companyId: string;
  locationId?: string | null;
  departmentId?: string | null;
  depreciationMonths?: number | null;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('O nome é obrigatório');
    }

    if (!props.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      throw new Error('É necessário um e-mail válido');
    }

    if (!props.passwordHash) {
      throw new Error('A senha é obrigatória');
    }

    if (!props.companyId) {
      throw new Error('O ID da empresa é obrigatório');
    }

    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(),
    };
  }

  get id(): string { return this.props.id as string; }
  get name(): string { return this.props.name; }
  get email(): string { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get role(): UserRole { return this.props.role; }
  get companyId(): string { return this.props.companyId; }
  get locationId(): string | undefined { return this.props.locationId || undefined; }
  get departmentId(): string | undefined { return this.props.departmentId || undefined; }
  get depreciationMonths(): number { return this.props.depreciationMonths || 36; }

  toJSON() {
    return this.props;
  }
}
