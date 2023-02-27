import { State } from "../deps/oak.ts";
import { ILoggingService } from "./services/mod.ts";

export interface IServices {
  logging: ILoggingService;
}

export interface IContext<TServices extends IServices> {
  services: TServices;
}

export interface IState<
  TServices extends IServices,
  TContext extends IContext<TServices>,
> extends State {
  context: TContext;
  isHtml?: boolean;
}
