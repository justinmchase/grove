import { Command, EnumType } from "@cliffy/command";
import { Type } from "@justinmchase/type";
import { NotImplementedError } from "./errors/notimplemented.error.ts";
import type { IContext } from "./context.ts";
import type { IMode } from "./modes/mod.ts";

type InitApplicationContext<
  TContext extends IContext,
> = () => Promise<TContext>;

/**
 * GroveConfig is the configuration object for the Grove class.
 */
export interface IGroveConfig<TContext extends IContext> {
  /**
   * The function that will be called to initialize the application context.
   * This function should return a promise that resolves to the application context.
   */
  initContext: InitApplicationContext<TContext>;
  /**
   * The modes that will be available in the CLI.
   * Each mode is a command that can be executed.
   */
  modes: IMode<TContext>[];
}

/**
 * Grove is the main class that will be used to create the CLI.
 * It will use the configuration object to create the CLI commands and options.
 */
export class Grove<TContext extends IContext> {
  constructor(
    private readonly config: IGroveConfig<TContext>,
  ) {
  }

  private build(context: TContext, command: Command, modes: IMode<TContext>[]) {
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

    return command;
  }

  /**
   * The start function is the main entry point for the CLI.
   * It will initialize the application context and parse the command line arguments.
   * @param args The command line arguments.
   */
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
          if (err instanceof Deno.errors.PermissionDenied) {
            return;
          } else {
            throw err;
          }
        }
      });

    if (!this.config.modes.length) {
      context.logger.critical(
        "grove_modes_empty",
        "At least one mode must be configured",
      );
    } else {
      this.build(context, command, this.config.modes);
    }
    if (!args.length && this.config.modes.length) {
      // In deno deploy you can't specify args so you must setup a default mode
      // Cliffy supports default commands but it doesn't seem to work so for now we will hack it for now
      // todo: use after https://github.com/c4spar/deno-cliffy/issues/655 is resolved
      const defaultMode = this.config.modes[0].name;
      context.logger.info(
        `no mode specified, using default mode ${defaultMode}`,
        { mode: defaultMode, args },
      );
      args = [defaultMode];
    }
    await command
      .error((err) =>
        context.logger.error(
          "grove_parse_error",
          "Command line args were unable to be parsed",
          err,
        )
      )
      .help({})
      .meta("deno", Deno.version.deno)
      .meta("v8", Deno.version.v8)
      .meta("typescript", Deno.version.typescript)
      // todo: use after https://github.com/c4spar/deno-cliffy/issues/655 is resolved
      // .default(this.config.modes[0].name)
      .parse(args);
  }

  private async run(args: unknown, context: TContext, mode: IMode<TContext>) {
    const { name } = mode;
    context.logger.info(`grove running mode ${name}`, {
      mode: name,
      args,
    });
    try {
      await mode.run(args, context);
    } catch (err) {
      context.logger.error("grove error", err, {
        mode: mode.name,
        args,
      });
    }
  }
}
