import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";
import type { Logger } from "../logging/mod.ts";
import { SASProtocol } from "@azure/storage-blob";

export class StorageService {
  constructor(private readonly client: BlobServiceClient) {
  }

  public static async create(
    logger: Logger,
    args: { azureStorageConnectionString: string },
  ): Promise<StorageService> {
    const { azureStorageConnectionString } = args;
    const client = BlobServiceClient.fromConnectionString(
      azureStorageConnectionString,
    );
    const containerClient = client.getContainerClient("grove");
    await containerClient.createIfNotExists({
      metadata: { last: new Date().toISOString() },
    });
    logger.info(
      `connected to storage account ${client.accountName}`,
      { name: client.accountName },
    );
    return new StorageService(client);
  }

  public async readAllText(
    container: string,
    blob: string,
  ): Promise<string | undefined> {
    const containerClient = this.client.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);
    const downloadBlockBlobResponse = await blobClient.download();
    const body = await downloadBlockBlobResponse.blobBody;
    return await body?.text();
  }

  public async getUploadUrl(container: string, blob: string): Promise<string> {
    const containerClient = this.client.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);
    const tenMinutes = 10 * 60 * 1000;
    const start = new Date();
    const sasUrl = await blobClient.generateSasUrl({
      protocol: SASProtocol.Https,
      contentType: "application/octet-stream",
      permissions: BlobSASPermissions.from({
        write: true,
      }),
      startsOn: start,
      expiresOn: new Date(start.valueOf() + tenMinutes),
    });
    return sasUrl;
  }
}
