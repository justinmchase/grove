import { Punctuation, HelloRepository } from "../repositories/mod.ts";

export class HelloManager {
  constructor(private readonly hellos: HelloRepository) {}

  public async create(arg: { name: string, punctuation: Punctuation}) {
    const { name, punctuation } = arg;
    const p = this.getPunctuation(punctuation);
    const greeting = `Hello ${name}${p}`;
    return await this.hellos.create({
      name,
      punctuation,
      greeting
    });
  }

  private getPunctuation(punctuation: Punctuation) {
    switch (punctuation) {
      case Punctuation.Exclamation:
        return "!";
      case Punctuation.Question:
        return "?";
      case Punctuation.ExclamationQuestion:
        return "!?";
    }
  }
}