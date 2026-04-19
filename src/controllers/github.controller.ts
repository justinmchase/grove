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
import type { GroveApp, GroveRequestContext } from "./controller.ts";
import type { Logger } from "../logging/mod.ts";

/**
 * This module provides the GitHubWebhookController class, which is used to handle GitHub webhooks.
 * It includes methods for handling different types of GitHub events.
 * @module
 */
/**
 * IGitHubWebhookConfig is the interface that will be used to create the GitHub webhook configuration.
 * It contains the path for the GitHub webhook.
 */
export interface IGitHubWebhookConfig {
  githubWebhookPath: string;
}

/**
 * GithubWebhookController is an abstract class that provides methods for handling GitHub webhooks.
 * It extends the Controller class and implements the use method to setup routes for handling webhooks.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 */
export abstract class GithubWebhookController implements Controller {
  private readonly githubWebhookPath: string;
  constructor(
    config: IGitHubWebhookConfig,
    protected readonly github: GitHubService,
  ) {
    this.githubWebhookPath = config.githubWebhookPath;
  }

  public async use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void> {
    app.post(
      this.githubWebhookPath,
      async (ctx) => await this.handler(ctx),
    );
    await undefined;
  }

  private async handler<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(ctx: GroveRequestContext<TContext, TState>) {
    const logger = ctx.get("state").context.logger;
    const githubEvent = ctx.req.header("X-GitHub-Event") as
      | GitHubEventName
      | "ping"
      | "installation";
    const bytes = await ctx.req.raw.arrayBuffer();
    await this.github.verify(ctx.req.raw.headers, bytes);
    const event = JSON.parse(new TextDecoder().decode(bytes)) as
      | GitHubEvent
      | GitHubDeploymentProtectionRuleEvent;
    const { action, sender, repository } = event;
    logger.info(
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
        return await this.handlePingEvent(
          logger,
          ctx,
          event as GitHubPingEvent,
        );
      case "installation":
        return await this.handleInstallationEvent(
          logger,
          ctx,
          event as GitHubInstallationEvent,
        );
      case "deployment_protection_rule":
        return await this.handleDeploymentProtectionRuleEvent(
          logger,
          ctx,
          event as GitHubDeploymentProtectionRuleEvent,
        );
      default:
        return await this.unsupportedEvent(logger, githubEvent, ctx, event);
    }
  }

  protected unsupportedEvent<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(
    logger: Logger,
    githubEvent: string | null,
    ctx: GroveRequestContext<TContext, TState>,
    body: unknown,
  ): Response {
    logger.warn(
      `The github webhook event ${githubEvent} was recieved but is not supported`,
      { body },
    );
    return ctx.json({
      ok: true,
    }, 200);
  }

  protected handlePingEvent<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(
    logger: Logger,
    ctx: GroveRequestContext<TContext, TState>,
    event: GitHubPingEvent,
  ): Response {
    logger.debug(`A ping event was received`, { event });
    return ctx.json({
      ok: true,
    }, 200);
  }

  protected handleInstallationEvent<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(
    logger: Logger,
    ctx: GroveRequestContext<TContext, TState>,
    event: GitHubInstallationEvent,
  ): Response {
    const { action, installation: { id, app_slug, account: { login } } } =
      event;
    logger.debug(
      `${app_slug} installation ${id} ${action} for ${login}`,
      {
        action,
        installationId: id,
        app_slug,
        login,
      },
    );
    return ctx.json({
      ok: true,
    }, 200);
  }

  protected handleDeploymentProtectionRuleEvent<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(
    logger: Logger,
    ctx: GroveRequestContext<TContext, TState>,
    event: GitHubDeploymentProtectionRuleEvent,
  ): Response {
    const {
      action,
      event: workflowEvent,
      installation: { id: installationId },
      deployment: { id: deploymentId },
      environment,
      repository: { id: repositoryId, full_name },
      sender: { id: senderId, login },
    } = event;
    logger.debug(
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
    return ctx.json({
      ok: true,
    }, 200);
  }
}
