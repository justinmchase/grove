import { api, GitHubApplication, GitHubClient } from "@justinmchase/github-api";
import { SignatureError } from "../../errors/signature.error.ts";
import { hmacCreateKey, hmacVerify } from "../../util/hmac.ts";
import { MemoryCache } from "../../util/cache.ts";
import type { Request } from "@oak/oak/request";
import type { ILogger } from "../../logging/mod.ts";

export interface IGitHubConfig {
  githubAppId: number;
  githubPrivateKey: string;
  githubWebhookSecret?: string;
}

export class GitHubService {
  private readonly app: GitHubApplication;
  private readonly cache = new MemoryCache();
  constructor(
    appId: number,
    privateKey: string,
    private readonly secret?: CryptoKey,
  ) {
    this.app = new GitHubApplication(
      appId,
      privateKey,
    );
  }

  public static async create(
    log: ILogger,
    config: IGitHubConfig,
  ): Promise<GitHubService> {
    const { githubAppId, githubPrivateKey, githubWebhookSecret } = config;
    const secret = githubWebhookSecret
      ? await hmacCreateKey(githubWebhookSecret)
      : undefined;

    log.debug(
      "github_service",
      "github service initializing",
      {
        githubAppId,
        githubPrivateKey: !!githubPrivateKey,
        githubWebhookSecret: !!githubWebhookSecret,
      },
    );
    return new GitHubService(
      githubAppId,
      githubPrivateKey,
      secret,
    );
  }

  public async verify(req: Request) {
    if (this.secret) {
      const signature = req.headers.get("X-Hub-Signature-256");
      if (!signature) {
        throw new SignatureError("invalid signature");
      }
      const [, sig] = signature.split("=");
      const bytes = await req.body.arrayBuffer();
      const verified = await hmacVerify(
        this.secret,
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
      async () => {
        const jwt = await this.app.jwt();
        const client = new GitHubClient({
          accessToken: jwt,
        });
        const result = await api.app.installations.accessTokens({
          installationId,
          client,
        });
        const { token } = result;
        return token;
      },
    );
  }

  public async client(installationId: number): Promise<GitHubClient> {
    const accessToken = await this.token(installationId);
    return new GitHubClient({
      accessToken,
    });
  }
}
