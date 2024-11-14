import { ExpectedError } from "../../errors/expected.error.ts";
import type { IContext } from "../../context.ts";
import type { IMode, IModeOption } from "../mode.interface.ts";
import type { IJob } from "./job.interface.ts";
import type { IJobContext } from "./job.context.ts";

export interface IJobModeConfig<TContext extends IContext> {
  initJobs: () => IJob<TContext>[];
}

export class JobMode<TContext extends IJobContext> implements IMode<TContext> {
  public name = "job";
  public description = "Runs a single operation then exits.";

  public readonly jobs: IJob<TContext>[];

  constructor(
    private readonly config: IJobModeConfig<TContext>,
  ) {
    const { initJobs } = config;
    this.jobs = initJobs();
  }

  public getOptions(): IModeOption[] {
    return [];
  }

  public getModes(): IMode<TContext>[] {
    return this.jobs.map((job) => ({
      name: job.name,
      description: job.description,
      getOptions: () => job.getOptions(),
      getModes: () => [],
      run: (args: unknown, context: TContext) =>
        this.run(args, { ...context, name: job.name }),
    }));
  }

  public async run(args: unknown, context: TContext) {
    const { name } = context;
    const job = this.jobs.find((job) => job.name === name);
    if (!job) {
      throw new ExpectedError("name", name, this.jobs.map((job) => job.name));
    }

    try {
      await job.run(args, context);
    } catch (err) {
      context.log.error("job mode error", err, { name });
    }
  }
}
