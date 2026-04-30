export interface AssignmentProps {
  id?: string;
  assetId: string;
  userId: string;
  assignedAt?: Date;
  returnedAt?: Date | null;
}

export class Assignment {
  private props: AssignmentProps;

  constructor(props: AssignmentProps) {
    if (!props.assetId) {
      throw new Error('ID do ativo é obrigatório');
    }

    if (!props.userId) {
      throw new Error('O ID do usuário é obrigatório');
    }

    if (props.returnedAt && props.assignedAt && props.returnedAt < props.assignedAt) {
      throw new Error('A data de devolução não pode ser anterior à data de atribuição');
    }

    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(),
      assignedAt: props.assignedAt || new Date(),
      returnedAt: props.returnedAt || null,
    };
  }

  get id(): string { return this.props.id as string; }
  get assetId(): string { return this.props.assetId; }
  get userId(): string { return this.props.userId; }
  get assignedAt(): Date { return this.props.assignedAt as Date; }
  get returnedAt(): Date | null { return this.props.returnedAt as Date | null; }

  returnAsset(returnDate: Date = new Date()) {
    if (this.props.returnedAt) {
      throw new Error('O ativo já foi devolvido');
    }
    
    if (returnDate < this.props.assignedAt!) {
      throw new Error('A data de devolução não pode ser anterior à data de atribuição');
    }

    this.props.returnedAt = returnDate;
  }
}
