import { CNPJValidator } from '../value-objects/CNPJValidator';

export interface CompanyProps {
  id?: string;
  name: string;
  cnpj: string;
  address: string;
  createdAt?: Date;
}

export class Company {
  private props: CompanyProps;

  constructor(props: CompanyProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('O nome é obrigatório');
    }

    if (!props.cnpj || props.cnpj.trim().length === 0) {
      throw new Error('O CNPJ é obrigatório');
    }

    if (!CNPJValidator.isValid(props.cnpj)) {
      throw new Error('CNPJ inválido');
    }

    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(),
      createdAt: props.createdAt || new Date(),
    };
  }

  get id(): string {
    return this.props.id as string;
  }

  get name(): string {
    return this.props.name;
  }

  get cnpj(): string {
      return this.props.cnpj;
  }
  
  get address(): string {
      return this.props.address;
  }
  
  get createdAt(): Date {
      return this.props.createdAt as Date;
  }
}
