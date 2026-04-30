export enum AssetType {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

export interface AssetProps {
  id?: string;
  type: AssetType;
  tagNumber: string;
  model: string;
  serial: string;
  purchaseDate: Date;
  value: number;
  status: AssetStatus;
  companyId: string;
  locationId?: string | null;
  departmentId?: string | null;
  depreciationMonths?: number | null;
}

export class Asset {
  private props: AssetProps;

  constructor(props: AssetProps) {
    if (!props.serial || props.serial.trim().length === 0) {
      throw new Error('O número de série é obrigatório');
    }

    if (!props.tagNumber || props.tagNumber.trim().length === 0) {
      throw new Error('A etiqueta (Tag) é obrigatória');
    }

    if (!props.companyId || props.companyId.trim().length === 0) {
      throw new Error('O ID da empresa é obrigatório');
    }

    if (props.value < 0) {
      throw new Error('O valor não pode ser negativo');
    }

    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(),
    };
  }

  get id(): string { return this.props.id as string; }
  get type(): AssetType { return this.props.type; }
  get tagNumber(): string { return this.props.tagNumber; }
  get model(): string { return this.props.model; }
  get serial(): string { return this.props.serial; }
  get purchaseDate(): Date { return this.props.purchaseDate; }
  get value(): number { return this.props.value; }
  get status(): AssetStatus { return this.props.status; }
  get companyId(): string { return this.props.companyId; }
  get locationId(): string | undefined { return this.props.locationId || undefined; }
  get departmentId(): string | undefined { return this.props.departmentId || undefined; }
  get depreciationMonths(): number { return this.props.depreciationMonths || 36; }

  updateStatus(newStatus: AssetStatus) {
    this.props.status = newStatus;
  }

  currentValue(): number {
    const monthsPassed = (new Date().getTime() - this.props.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (monthsPassed < 0) return this.props.value; // bought in future?
    
    const dpMonths = this.depreciationMonths;
    if (monthsPassed >= dpMonths) return 0;

    const depreciationRatio = monthsPassed / dpMonths;
    const depreciatedValue = this.props.value - (this.props.value * depreciationRatio);
    return Math.max(0, parseFloat(depreciatedValue.toFixed(2)));
  }
}
