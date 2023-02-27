export class Collection<T extends { _id: number }> {
  private next = 0;
  private readonly data = new Map<number, T>();

  constructor(public readonly name: string) {
  }

  public insertOne(model: Omit<T, "_id">) {
    const _id = this.next++;
    const modelWithId = {
      ...model,
      _id,
    } as T;
    this.data.set(_id, modelWithId);
    return modelWithId;
  }
}
