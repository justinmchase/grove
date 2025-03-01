import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import { type Serializable, toSerializable } from "@justinmchase/serializable";
import { Status } from "@oak/oak";
import { BaseLogger } from "./base.logger.ts";
import { UnexpectedStatusError } from "../errors/mod.ts";
import { hmacCreateKey, hmacSign } from "../util/hmac.ts";
import type { LogLevel } from "./logLevel.ts";

type AzureLoggerParams = {
  azureAnalyticsWorkspaceId: string;
  azureAnalyticsWorkspaceSecret: string;
  azureAnalyticsLogType?: string;
};

export class AzureLogger extends BaseLogger {
  constructor(
    private readonly workspaceId: string,
    private readonly cryptoKey: CryptoKey,
    private readonly logType: string,
    private readonly meta?: Serializable,
  ) {
    super();
  }

  public static async create(
    params: AzureLoggerParams,
    meta?: Serializable,
  ): Promise<AzureLogger> {
    const {
      azureAnalyticsWorkspaceId,
      azureAnalyticsWorkspaceSecret,
      azureAnalyticsLogType = "Grove",
    } = params;
    const keyData = decodeBase64(azureAnalyticsWorkspaceSecret);
    const hmacKey = await hmacCreateKey({ keyData });
    return new AzureLogger(
      azureAnalyticsWorkspaceId,
      hmacKey,
      azureAnalyticsLogType,
      meta,
    );
  }

  public async log(
    level: LogLevel,
    message: string,
    data: Record<keyof unknown, unknown>,
  ) {
    const m = JSON.stringify(message.replace(/"/g, "'"));
    const d = JSON.stringify(toSerializable(data));
    const line = `${level} ${m} ${d}`;
    const meta = this.meta;
    const json = JSON.stringify([{
      level,
      message: m,
      data: d,
      meta,
      line,
    }]);
    const content = new TextEncoder().encode(json);
    const timeGenerated = new Date();
    const xMsDate = timeGenerated.toUTCString();

    // e.g. POST\n1024\napplication/json\nx-ms-date:Mon, 04 Apr 2016 08:00:00 GMT\n/api/logs
    const stringToSign = [
      "POST",
      content.length,
      "application/json",
      `x-ms-date:${xMsDate}`,
      "/api/logs",
    ].join("\n");

    // Signature=Base64(HMAC-SHA256(UTF8(StringToSign)))
    const workspaceId = this.workspaceId;
    const signature = await hmacSign(this.cryptoKey, stringToSign);
    const encodedSignature = encodeBase64(signature);

    const headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": `SharedKey ${workspaceId}:${encodedSignature}`,
      "Log-Type": this.logType,
      "x-ms-date": xMsDate,
      "time-generated-field": timeGenerated.toISOString(),
    });

    // documentation url:
    // https://learn.microsoft.com/en-us/rest/api/loganalytics/create-request
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
