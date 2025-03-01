import type { State } from "@oak/oak";
import type { Logger } from "./logging/mod.ts";

export interface IContext {
  logger: Logger;
}

export interface IState<
  TContext extends IContext,
> extends State {
  context: TContext;
  isHtml?: boolean;
}
