import { base64Encode } from "../../../deps/std.ts";
import { Request } from "../../../deps/oak.ts";
import { SignatureError } from "../../errors/signature.error.ts";
import { ILogger } from "../../logging/mod.ts";
import { hmacCreateKey, hmacVerify } from "../../util/hmac.ts";
import { GitHubClient, appJwt, createInstallationToken } from "../../../deps/github.ts";

export interface IGitHubConfig {
  githubAppId: number;
  githubPrivateKey: string;
  githubWebhookSecret?: string;
}

export class GitHubService {
  constructor(
    private readonly appId: number,
    private readonly privateKey: string,
    private readonly secret?: CryptoKey,
  ) {
  }

  public static async create(log: ILogger, config: IGitHubConfig) {
    const { githubAppId, githubPrivateKey, githubWebhookSecret } = config;
    const secret = githubWebhookSecret
      ? await hmacCreateKey(base64Encode(githubWebhookSecret))
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
      const bytes = await req.body({ type: "bytes" }).value;
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

  
  private async token(installationId: number) {
    if (!this.appId) {
      throw new Error(`invalid appId ${this.appId}`);
    }

    if (!this.privateKey) {
      throw new Error(`invalid privateKey`);
    }

    // todo: cache the token for a minute at least to reduce calls to this api
    const jwt = await appJwt(`${this.appId}`, this.privateKey);
    const { token } = await createInstallationToken(
      jwt,
      `${installationId}`,
    );
    if (!token) {
      throw new Error(
        `inavlid token ${installationId} ${this.appId} ${this.privateKey}`,
      );
    }
    return token;
  }


  public async client(installationId: number) {
    const accessToken = await this.token(installationId)
    return new GitHubClient({
      accessToken,
    })
  }
}