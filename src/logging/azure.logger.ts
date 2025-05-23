import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import { type Serializable, toSerializable } from "@justinmchase/serializable";
import { Status } from "@oak/oak";
import { BaseLogger } from "./base.logger.ts";
import { UnexpectedStatusError } from "../errors/mod.ts";
import { hmacCreateKey, hmacSign } from "../util/hmac.ts";
import type { LogLevel } from "./logLevel.ts";

/**
 * This module provides the AzureLogger class, which is used to log messages to Azure Log Analytics.
 * @module
 */

type AzureLoggerParams = {
  azureAnalyticsWorkspaceId: string;
  azureAnalyticsWorkspaceSecret: string;
  azureAnalyticsLogType?: string;
};

/**
 * AzureLogger is a logger that sends logs to Azure Log Analytics.
 */
export class AzureLogger extends BaseLogger {
  constructor(
    private readonly workspaceId: string,
    private readonly cryptoKey: CryptoKey,
    private readonly logType: string,
    private readonly meta?: Serializable,
  ) {
    super();
  }

  /**
   * Asynchronously creates a new AzureLogger instance.
   * @param params - The parameters for the logger.
   * @param meta - Optional metadata to include with each log entry.
   * @returns A promise that resolves to a new AzureLogger instance.
   */
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

  /**
   * Logs a message to Azure Log Analytics.
   * @param level - The log level.
   * @param message - The log message.
   * @param data - Additional data to include with the log entry.
   */
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
