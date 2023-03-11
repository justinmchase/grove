import { IJob } from "../../src/modes/job/job.interface.ts";
import { IModeOption } from "../../src/modes/mode.interface.ts";
import { Type } from "../../src/util/type.ts";
import { JobContext } from "../context.ts";
import { Punctuation } from "../repositories/hello/punctuation.ts";

type HelloArgs = {
  name?: string;
  punctuation?: Punctuation;
};

export class HelloJob<TContext extends JobContext> implements IJob<TContext> {
  public readonly name = "hello";
  public readonly description = "Creates a greeting";
  public getOptions(): IModeOption[] {
    return [
      {
        type: Type.String,
        name: "name",
        description: "The name of whom to greet",
      },
      {
        type: Type.String,
        name: "punctuation",
        description: "The type of punctation for the greeting",
        values: [
          Punctuation.Exclamation,
          Punctuation.ExclamationQuestion,
          Punctuation.Question,
        ],
      },
    ];
  }

  public async run(args: HelloArgs, context: TContext): Promise<void> {
    const {
      name = "World",
      punctuation = Punctuation.Exclamation,
    } = args;
    const hello = await context.managers.hellos.create({
      name,
      punctuation,
    });
    context.log.info("hello", hello.greeting, { _id: hello._id });
  }
}
