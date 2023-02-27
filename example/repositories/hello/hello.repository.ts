import { DbService, Collection } from "../../services/mod.ts";
import { Hello } from "./hello.ts";
import { Punctuation } from "./punctuation.ts";

export class HelloRepository {

  private readonly hellos: Collection<Hello>

  constructor(db: DbService) {
    this.hellos = db.collection<Hello>("hellos");
  }

  public async create(arg: { name: string, punctuation: Punctuation, greeting: string }) {
    const { name, punctuation, greeting } = arg;
    return await this.hellos.insertOne({
      name,
      punctuation,
      greeting,
      createdAt: new Date()
    })
  }
}