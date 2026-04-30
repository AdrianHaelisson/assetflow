export class Location {
  constructor(
    public name: string,
    public companyId: string,
    public id?: string,
  ) {
    this.id = id || crypto.randomUUID();
  }
}
