import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
} from "@azure/storage-blob";
import type { Logger } from "../logging/mod.ts";
import type { Buffer } from "node:buffer";

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
   * Ensures that a container exists in Azure Blob Storage.
   * @param container The name of the container to ensure.
   */
  public async ensureContainer(container: string) {
    const containerClient = this.client.getContainerClient(container);
    await containerClient.createIfNotExists({
      metadata: { last: new Date().toISOString() },
    });
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
    await containerClient.createIfNotExists();

    const blobClient = containerClient.getBlobClient(blob);
    const tenMinutes = 10 * 60 * 1000;
    const start = new Date();
    const sasUrl = await blobClient.generateSasUrl({
      protocol: SASProtocol.HttpsAndHttp,
      contentType: "application/octet-stream",
      permissions: BlobSASPermissions.from({
        write: true,
      }),
      startsOn: start,
      expiresOn: new Date(start.valueOf() + tenMinutes),
    });
    return sasUrl;
  }

  /**
   * Get a buffer containing the contents of a blob.
   * @param container The name of the container the blob is in.
   * @param blob The name of the blob to read.
   * @returns The contents of the blob as a Buffer.
   */
  public async getBlob(container: string, blob: string): Promise<Buffer> {
    const containerClient = this.client.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);
    const blockClient = await blobClient.getBlockBlobClient();
    return await blockClient.downloadToBuffer();
  }

  /**
   * Get a stream containing the contents of a blob.
   * @param container The name of the container the blob is in.
   * @param blob The name of the blob to read.
   * @returns The contents of the blob as a stream.
   */
  public async getBlobStream(
    container: string,
    blob: string,
  ): Promise<NodeJS.ReadableStream> {
    const containerClient = this.client.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);
    const blockClient = await blobClient.getBlockBlobClient();
    const download = await blockClient.download();
    return download.readableStreamBody!;
  }

  /**
   * Uploads a BufferSource to a blob with the given content type.
   * @param container The name of the container to upload to.
   * @param blob The name of the blob to upload.
   * @param data The data to upload as the contents of the blob.
   * @param contentType The content type of the blob.
   */
  public async putBlob(
    container: string,
    blob: string,
    data: BufferSource,
    contentType: string,
  ) {
    const containerClient = this.client.getContainerClient(container);
    await containerClient.createIfNotExists();

    const blobClient = containerClient.getBlobClient(blob);
    const blockClient = await blobClient.getBlockBlobClient();
    await blockClient.uploadData(data, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });
  }

  /**
   * Deletes a blob from storage
   * @param container The name of the container to delete from.
   * @param blob The name of the blob to delete.
   */
  public async deleteBlob(container: string, blob: string) {
    const containerClient = this.client.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);
    await blobClient.deleteIfExists();
  }
}
