import { Punctuation } from "./punctuation.ts";

export type Hello = {
  _id: number;
  name: string;
  punctuation: Punctuation;
  greeting: string;
  createdAt: Date;
}
