import { credentials, GitHubClient } from "@justinmchase/github-api";
import type { GitHubCredentialProvider } from "@justinmchase/github-api";
import { SignatureError } from "../errors/signature.error.ts";
import { hmacCreateKey, hmacVerify } from "../util/hmac.ts";
import { MemoryCache } from "../util/cache.ts";
import type { Request } from "@oak/oak/request";
import type { ILogger } from "../logging/mod.ts";

type GitHubConfig = {
  githubAppId?: number;
  githubPrivateKey?: string;
  githubPat?: string;
  githubWebhookSecret?: string;
};

export class GitHubService {
  private readonly cache = new MemoryCache();
  constructor(
    private readonly credentialProvider: GitHubCredentialProvider,
    private readonly webhookKey?: CryptoKey,
  ) {
  }

  public static async create(
    log: ILogger,
    config: GitHubConfig,
  ): Promise<GitHubService> {
    const { githubAppId, githubPrivateKey, githubWebhookSecret } = config;

    log.debug(
      "github_service",
      "github service initializing",
      {
        githubAppId,
        githubPrivateKey: !!githubPrivateKey,
        githubWebhookSecret: !!githubWebhookSecret,
      },
    );
    const credentialProvider = credentials(config);
    const secret = githubWebhookSecret
      ? await hmacCreateKey(githubWebhookSecret)
      : undefined;
    return new GitHubService(
      credentialProvider,
      secret,
    );
  }

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

  public async token(installationId: number): Promise<string> {
    return await this.cache.get(
      `installation_token_${installationId}`,
      async () =>
        await this.credentialProvider.installationToken(installationId),
    );
  }

  public async client(installationId: number): Promise<GitHubClient> {
    const accessToken = await this.token(installationId);
    return new GitHubClient({
      accessToken,
    });
  }
}
