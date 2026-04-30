export class Consumable {
  constructor(
    public name: string,
    public quantity: number,
    public companyId: string,
    public id?: string,
  ) {
    if (!name) throw new Error('O nome é obrigatório');
    if (quantity < 0) throw new Error('A quantidade não pode ser negativa');
    this.id = id || crypto.randomUUID();
  }

  checkout(amount: number) {
    if (this.quantity < amount) throw new Error('Quantidade insuficiente');
    this.quantity -= amount;
  }
}
