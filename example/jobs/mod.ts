import { JobContext } from "../context.ts";
import { HelloJob } from "./hello.job.ts";

export function initJobs<TContext extends JobContext>() {
  return [
    new HelloJob<TContext>(),
  ];
}
