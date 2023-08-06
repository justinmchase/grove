import {
  Application,
  Request,
  Response,
  Router,
  Status,
} from "../../deps/oak.ts";
import {
GitHubDeploymentProtectionRuleEvent,
  GitHubEvent,
  GitHubEventName,
  GitHubInstallationEvent,
  GitHubPingEvent,
} from "../../deps/github.ts";
import { GitHubService } from "../services/github/mod.ts";
import { IContext, IState } from "../context.ts";
import { Controller } from "./controller.ts";
import { ILogger } from "../logging/mod.ts";

export interface IGitHubWebhookConfig {
  githubWebhookPath: string;
}

export abstract class GithubWebhookController<
  TContext extends IContext,
  TState extends IState<TContext>,
> implements Controller<TContext, TState> {
  private readonly githubWebhookPath: string;
  constructor(
    config: IGitHubWebhookConfig,
    private readonly github: GitHubService,
  ) {
    this.githubWebhookPath = config.githubWebhookPath;
  }

  public async use(app: Application<TState>): Promise<void> {
    const router = new Router<TState>();
    router.post(
      this.githubWebhookPath,
      async (context, _next) =>
        await this.handler(
          context.state.context.log,
          context.request,
          context.response,
        ),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async handler(log: ILogger, req: Request, res: Response) {
    const githubEvent = req.headers.get("X-GitHub-Event") as GitHubEventName | "ping" | "installation";
    await this.github.verify(req);
    const body = await req.body({ type: "json" }).value;

    const event = body as GitHubEvent | GitHubDeploymentProtectionRuleEvent;
    const { action, sender, repository } = event;
    log.info(
      "github_webhook",
      `github event ${githubEvent}`,
      {
        githubEvent,
        action,
        senderLogin: sender?.login,
        // organization: organization?.name // todo: use this once modeled
        repositoryName: repository?.name,
      },
    );

    switch (githubEvent) {
      case "ping":
        return await this.handlePingEvent(log, res, event as GitHubPingEvent);
      case "installation":
        return await this.handleInstallationEvent(
          log,
          res,
          event as GitHubInstallationEvent,
        );
      case "deployment_protection_rule":
        return await this.handleDeploymentProtectionRuleEvent(
          log,
          res,
          event as GitHubDeploymentProtectionRuleEvent
        );
      default:
        return await this.unsupportedEvent(log, githubEvent, res, body);
    }
  }

  protected async unsupportedEvent(
    log: ILogger,
    githubEvent: string | null,
    res: Response,
    // deno-lint-ignore no-explicit-any
    body: any,
  ) {
    log.warn(
      "github_unsupported_event",
      `The event ${githubEvent} was recieved but is not supported`,
      { body },
    );
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    await undefined;
  }

  protected async handlePingEvent(
    log: ILogger,
    res: Response,
    event: GitHubPingEvent,
  ) {
    log.debug("github_event_ping", `The ping event was received`, { event });
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    await undefined;
  }

  protected async handleInstallationEvent(
    log: ILogger,
    res: Response,
    event: GitHubInstallationEvent,
  ) {
    const { action, installation: { id, app_slug, account: { login } } } =
      event;
    log.debug(
      "github_event_installation",
      `${app_slug} installation ${id} ${action} for ${login}`,
      { 
        action,
        installationId: id,
        app_slug,
        login
      },
    );
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    await undefined;
  }
  
  protected async handleDeploymentProtectionRuleEvent(
    log: ILogger,
    res: Response,
    event: GitHubDeploymentProtectionRuleEvent,
  ) {
    const {
      action,
      event: workflowEvent,
      installation: { id: installationId },
      deployment: { id: deploymentId },
      environment,
      repository: { id: repositoryId, full_name },
      sender: { id: senderId, login },
    } = event;
    log.debug(
      "github_event_deployment_protection_rule",
      `deployment protection rule ${action} for ${deploymentId}:${full_name}/${environment} by ${senderId}:${login}`,
      { 
        action,
        workflowEvent,
        installationId,
        deploymentId,
        environment,
        repositoryId,
        full_name,
        senderId,
        login,
      },
    );
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    await undefined;
  }
}
