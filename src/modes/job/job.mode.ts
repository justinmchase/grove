import { ExpectedError } from "../../errors/expected.error.ts";
import type { IContext } from "../../context.ts";
import type { IMode, IModeOption } from "../mode.interface.ts";
import type { IJob } from "./job.interface.ts";
import type { IJobContext } from "./job.context.ts";

/**
 * This module provides the job mode for the application.
 * @module
 */

/**
 * IJobModeConfig is the interface that will be used to create the job mode.
 * This mode will run a single operation then exit.
 */
export interface IJobModeConfig<TContext extends IContext> {
  /**
   * The function that will be called to initialize the jobs.
   * This function should return a promise that resolves when the jobs are done.
   */
  initJobs: () => IJob<TContext>[];
}

/**
 * JobMode is the class that will be used to create the job mode.
 * This mode will run a single operation then exit.
 */
export class JobMode<TContext extends IJobContext> implements IMode<TContext> {
  /**
   * The name of the mode "job".
   */
  public name = "job";
  /**
   * The description of the mode "Runs a single operation then exits.".
   */
  public description = "Runs a single operation then exits.";

  /**
   * The list of available jobs. Only one job will be run by name per execution of job mod.
   */
  public readonly jobs: IJob<TContext>[];

  constructor(
    config: IJobModeConfig<TContext>,
  ) {
    const { initJobs } = config;
    this.jobs = initJobs();
  }

  /**
   * The options that will be used to run the mode. This is the list of options that will be
   * available to the user when running the mode.
   * @returns {IModeOption[]} empty array
   */
  public getOptions(): IModeOption[] {
    return [];
  }

  /**
   * The sub modes that will be available in the mode. This is the list of sub modes that will be
   * available to the user when running the mode.
   * @returns {IMode<TContext>[]} all jobs are listed as sub modes
   */
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

  /**
   * Runs a single job by name then exits.
   * @param args The arguments that will be passed to the job.
   * @param context The context that will be passed to the job.
   * @throws {ExpectedError} If the job is not found.
   */
  public async run(args: unknown, context: TContext) {
    const { name } = context;
    const job = this.jobs.find((job) => job.name === name);
    if (!job) {
      throw new ExpectedError("name", name, this.jobs.map((job) => job.name));
    }

    try {
      await job.run(args, context);
    } catch (err) {
      context.logger.error("job mode error", err, { name });
    }
  }
}
