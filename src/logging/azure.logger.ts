import { snakeCase } from "@wok/case";
import { encodeBase64 } from "@std/encoding/base64";
import { toSerializable } from "@justinmchase/serializable";
import { Status } from "@oak/oak";
import { Logger } from "./logger.ts";
import { UnexpectedStatusError } from "../errors/mod.ts";
import { readOptionalString, readRequiredString } from "../util/config.ts";
import { hmacCreateKey, hmacSign } from "../util/hmac.ts";
import type { LogLevel } from "./logLevel.ts";

export class AzureLogger extends Logger {
  constructor(
    private readonly workspaceId: string,
    private readonly cryptoKey: CryptoKey,
    private readonly logType: string,
  ) {
    super();
  }

  public static async create(
    env: Record<string, string>,
  ): Promise<AzureLogger> {
    const workspaceId = readRequiredString(env, "AZURE_ANALYTICS_WORKSPACE_ID");
    const secret = readRequiredString(env, "AZURE_ANALYTICS_WORKSPACE_SECRET");
    const logType = readOptionalString(env, "AZURE_ANALYTICS_LOGTYPE") ??
      "Grove";
    const key = await hmacCreateKey(secret);
    return new AzureLogger(workspaceId, key, logType);
  }

  public async log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    const n = snakeCase(name);
    const m = JSON.stringify(message.replace(/"/g, "'"));
    const d = JSON.stringify(toSerializable(data));
    const line = `${level} ${n} ${m} ${d}`;
    const json = JSON.stringify([{
      level,
      name: n,
      message: m,
      data: d,
      line,
    }]);
    const content = new TextEncoder().encode(json);
    const xMsDate = new Date().toUTCString();

    // e.g. POST\n1024\napplication/json\nx-ms-date:Mon, 04 Apr 2016 08:00:00 GMT\n/api/logs
    const stringToSign = [
      "POST",
      content.length,
      "application/json",
      `x-ms-date:${xMsDate}`,
      "/api/logs",
    ].join("\n");

    // Signature=Base64(HMAC-SHA256(UTF8(StringToSign)))
    const signature = await hmacSign(this.cryptoKey, stringToSign);
    const encodedSignature = encodeBase64(signature);
    const headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": `SharedKey ${this.workspaceId}:${encodedSignature}`,
      "Log-Type": this.logType,
      "x-ms-date": xMsDate,
      "time-generated-field": xMsDate,
    });

    const url =
      `https://${this.workspaceId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`;
    const res = await fetch(
      url,
      {
        method: "POST",
        headers,
        body: content,
      },
    );

    const { ok, status } = res;
    if (!ok || status !== Status.OK) {
      throw new UnexpectedStatusError(url, Status.OK, status);
    }
  }
}
