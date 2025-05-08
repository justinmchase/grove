import { credentials, GitHubClient } from "@justinmchase/github-api";
import type { GitHubCredentialProvider } from "@justinmchase/github-api";
import { SignatureError } from "../errors/signature.error.ts";
import { hmacCreateKey, hmacVerify } from "../util/hmac.ts";
import { MemoryCache } from "../util/cache.ts";
import type { Request } from "@oak/oak/request";
import type { Logger } from "../logging/mod.ts";

type GitHubConfig = {
  githubAppId?: number;
  githubPrivateKey?: string;
  githubPat?: string;
  githubWebhookSecret?: string;
};

/**
 * GitHubService is a service that provides access to the GitHub API.
 * It uses the GitHubCredentialProvider to authenticate requests.
 * It also provides a cache for storing tokens and a method for verifying webhooks.
 * @param credentialProvider The GitHubCredentialProvider to use for authentication.
 * @param webhookKey The key to use for verifying webhooks.
 */
export class GitHubService {
  private readonly cache = new MemoryCache();
  constructor(
    private readonly credentialProvider: GitHubCredentialProvider,
    private readonly webhookKey?: CryptoKey,
  ) {
  }

  /**
   * Creates a new instance of the GitHubService asynchronously, including the credential provider and webhook key.
   * @param logger The logger to use for logging.
   * @param config The configuration object containing the GitHub credentials.
   * @returns A new instance of the GitHubService.
   */
  public static async create(
    logger: Logger,
    config: GitHubConfig,
  ): Promise<GitHubService> {
    const { githubAppId, githubPrivateKey, githubPat, githubWebhookSecret } =
      config;
    logger.debug(
      "github service initializing",
      {
        githubAppId,
        githubPrivateKey: !!githubPrivateKey,
        githubPat: !!githubPat,
        githubWebhookSecret: !!githubWebhookSecret,
      },
    );
    const credentialProvider = credentials(config);
    const secret = githubWebhookSecret
      ? await hmacCreateKey({ secret: githubWebhookSecret })
      : undefined;
    return new GitHubService(
      credentialProvider,
      secret,
    );
  }

  /**
   * Checks if the GitHubCredentialProvider is valid and can be used for authentication.
   * @returns The GitHubCredentialProvider used for authentication.
   */
  public async check(): Promise<void> {
    return await this.credentialProvider.check();
  }

  /**
   * Verifies the webhook signature using the provided request object and the webhook key.
   * @param req The request object to verify the webhook signature.
   */
  public async verify(req: Request) {
    if (this.webhookKey) {
      const signature = req.headers.get("X-Hub-Signature-256");
      if (!signature) {
        throw new SignatureError("invalid signature");
      }
      const [, sig] = signature.split("=");
      const bytes = await req.body.arrayBuffer();
      const verified = await hmacVerify(
        this.webhookKey,
        sig,
        bytes,
      );
      if (!verified) {
        throw new SignatureError("signature does not match body");
      }
    }
  }

  /**
   * Gets a github token for the given installation ID.
   * @param installationId The installation ID to use for authentication.
   * @returns A valid GitHub token which can be used to call the github API.
   */
  public async token(installationId: number): Promise<string> {
    return await this.cache.get(
      `installation_token_${installationId}`,
      async () =>
        await this.credentialProvider.installationToken(installationId),
    );
  }

  /**
   * Creates a new GitHubClient instance using the provided installation ID
   * and the token obtained from the credential provider.
   * @param installationId The installation ID to use for authentication.
   * @returns A new instance of the GitHubClient.
   */
  public async client(installationId: number): Promise<GitHubClient> {
    const accessToken = await this.token(installationId);
    return new GitHubClient({
      accessToken,
    });
  }
}
