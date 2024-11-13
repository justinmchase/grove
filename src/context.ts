import type { State } from "@oak/oak";
import type { ILogger } from "./logging/mod.ts";

export interface IContext {
  log: ILogger;
}

export interface IState<
  TContext extends IContext,
> extends State {
  context: TContext;
  isHtml?: boolean;
}
