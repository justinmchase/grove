import { HelloJob } from "./hello.job.ts";
import type { JobContext } from "../context.ts";

export function initJobs<TContext extends JobContext>() {
  return [
    new HelloJob<TContext>(),
  ];
}
