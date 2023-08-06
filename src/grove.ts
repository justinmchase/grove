import { Command, EnumType } from "../deps/cliffy.ts";
import { IContext } from "./context.ts";
import { NotImplementedError } from "./errors/notimplemented.error.ts";
import { IMode } from "./modes/mod.ts";
import { Type } from "./util/type.ts";

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

  private build(context: TContext, command: Command, modes: IMode<TContext>[]) {
    context.log.critical(
      "grove_modes_empty",
      "At least one mode must be configured",
    );

    for (const mode of modes) {
      const options = mode.getOptions();
      const subModes = mode.getModes();
      if (subModes.length) {
        command.command(
          mode.name,
          this.build(context, new Command(), subModes),
        );
      } else {
        command.command(mode.name);
      }
      command.description(mode.description);

      for (
        const {
          type,
          name,
          description,
          values,
          required = false,
          defaultValue,
        } of options
      ) {
        const flag = (() => {
          switch (type) {
            case Type.String:
              if (values) {
                command.type(name, new EnumType(values));
                return `--${name} [${name}:${name}]`;
              } else {
                return `--${name} [string]`;
              }
            case Type.Number:
              return `--${name} [number]`;
            case Type.Boolean:
              return `--${name}`;
            default:
              throw new NotImplementedError(
                `Option type ${type} for ${name} is not supported.`,
              );
          }
        })();
        command.option(flag, description, {
          required,
          default: defaultValue,
        });
      }
      command.action((args: unknown) => this.run(args, context, mode));
    }

    // The first command is the default command
    command.default(modes[0]?.name);
    return command;
  }

  public async start(args: string[]) {
    const context = await this.config.initContext();
    const command = new Command()
      .throwErrors()
      .name("grove")
      .action(function () {
        this.showHelp();
        try {
          Deno.exit(1);
        } catch (err) {
          // In Deno Deploy the exit function is not allowed
          // Just ignore the error in this case
          // any other error throw
          if (err.name !== "PermissionDenied") {
            throw err;
          }
        }
      });

    this.build(context, command, this.config.modes);
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

  private async run(args: unknown, context: TContext, mode: IMode<TContext>) {
    const { name } = mode;
    context.log.info("grove_run", `grove running mode ${name}`, {
      mode: name,
      args,
    });
    try {
      await mode.run(args, context);
    } catch (err) {
      context.log.error("grove_runtime_error", err.message, err, {
        mode: mode.name,
        args,
      });
    }
  }
}
