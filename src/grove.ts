import { Command } from "../deps/cliffy.ts";
import { IContext } from "./context.ts";
import { IMode } from "./modes/mod.ts";

type InitApplicationContext<
  TContext extends IContext,
> = () => Promise<TContext>;

export interface IGroveConfig<TContext extends IContext> {
  initContext: InitApplicationContext<TContext>;
  modes: IMode<TContext>[];
}

export class Grove<TContext extends IContext> {
  constructor(
    private readonly config: IGroveConfig<TContext>,
  ) {
  }

  public async start(args: string[]) {
    const context = await this.config.initContext();
    const command = new Command()
      .throwErrors()
      .name("grove")
      .action(function () {
        this.showHelp();
        Deno.exit(1);
      });

    for (const mode of this.config.modes) {
      command
        .command(mode.name)
        .action(() => this.run(context, mode));
    }

    await command
      .error((err) =>
        context.log.error(
          "grove_parse_error",
          "Command line args were unable to be parsed",
          err,
        )
      )
      .help({})
      .meta("deno", Deno.version.deno)
      .meta("v8", Deno.version.v8)
      .meta("typescript", Deno.version.typescript)
      .parse(args);
  }

  private async run(context: TContext, mode: IMode<TContext>) {
    const { name } = mode;
    context.log.info("grove_run", `grove running mode ${name}`, { name });
    try {
      await mode.run(context);
    } catch (err) {
      context.log.error("grove_runtime_error", err.message, err, {
        mode: mode.name,
      });
    }
  }
}
