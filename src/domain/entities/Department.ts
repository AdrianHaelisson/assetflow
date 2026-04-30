export interface DepartmentProps {
  id?: string;
  name: string;
  companyId: string;
  locationId?: string | null;
}

export class Department {
  private props: DepartmentProps;

  constructor(props: DepartmentProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('O nome do setor é obrigatório');
    }
    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(),
    };
  }

  get id(): string { return this.props.id as string; }
  get name(): string { return this.props.name; }
  get companyId(): string { return this.props.companyId; }
  get locationId(): string | undefined { return this.props.locationId || undefined; }
}
