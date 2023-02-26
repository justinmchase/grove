import { State } from "../deps/oak.ts";
import { IServices } from "./services/mod.ts";

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
