import { Router, Status } from "@oak/oak";
import type { Application, Request, Response } from "@oak/oak";
import type {
  GitHubDeploymentProtectionRuleEvent,
  GitHubEvent,
  GitHubEventName,
  GitHubInstallationEvent,
  GitHubPingEvent,
} from "@justinmchase/github-api";
import type { GitHubService } from "../services/github.service.ts";
import type { IContext, IState } from "../context.ts";
import type { Controller } from "./controller.ts";
import type { Logger } from "../logging/mod.ts";

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
    protected readonly github: GitHubService,
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

  private async handler(log: Logger, req: Request, res: Response) {
    const githubEvent = req.headers.get("X-GitHub-Event") as
      | GitHubEventName
      | "ping"
      | "installation";
    await this.github.verify(req);
    const event = await req.body.json() as
      | GitHubEvent
      | GitHubDeploymentProtectionRuleEvent;
    const { action, sender, repository } = event;
    log.info(
      `github webhook event ${githubEvent}`,
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
          event as GitHubDeploymentProtectionRuleEvent,
        );
      default:
        return await this.unsupportedEvent(log, githubEvent, res, event);
    }
  }

  protected async unsupportedEvent(
    log: Logger,
    githubEvent: string | null,
    res: Response,
    body: unknown,
  ) {
    log.warn(
      `The github webhook event ${githubEvent} was recieved but is not supported`,
      { body },
    );
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    await undefined;
  }

  protected async handlePingEvent(
    log: Logger,
    res: Response,
    event: GitHubPingEvent,
  ) {
    log.debug(`A ping event was received`, { event });
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    await undefined;
  }

  protected async handleInstallationEvent(
    log: Logger,
    res: Response,
    event: GitHubInstallationEvent,
  ) {
    const { action, installation: { id, app_slug, account: { login } } } =
      event;
    log.debug(
      `${app_slug} installation ${id} ${action} for ${login}`,
      {
        action,
        installationId: id,
        app_slug,
        login,
      },
    );
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    await undefined;
  }

  protected async handleDeploymentProtectionRuleEvent(
    log: Logger,
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
