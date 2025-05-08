import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";
import type { Logger } from "../logging/mod.ts";
import { SASProtocol } from "@azure/storage-blob";

/**
 * StorageService is a service that provides access to Azure Blob Storage.
 */
export class StorageService {
  constructor(private readonly client: BlobServiceClient) {
  }

  /**
   * Creates a new instance of the StorageService asynchronously.
   * @param logger The logger to use for logging.
   * @param args The configuration object containing the Azure Storage connection string.
   * @returns A new instance of the StorageService.
   */
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

  /**
   * Reads a blob from Azure Blob Storage and returns its content as a string.
   * @param container The name of the container the blob is in.
   * @param blob The name of the blob to read.
   * @returns The content of the blob as a string, or undefined if the blob does not exist.
   */
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

  /**
   * Gets a SAS URL for uploading a blob to Azure Blob Storage which lasts for 10 minutes.
   * @param container The name of the container to upload to.
   * @param blob The name of the blob to upload.
   * @returns A SAS URL that can be used to upload the blob.
   */
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
