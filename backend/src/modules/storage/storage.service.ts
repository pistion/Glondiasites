import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

export interface ArtifactObjectDescriptor {
  bucket: string;
  objectKey: string;
  publicUrl: string | null;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly artifactsBucket: string;
  private readonly assetsBucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID', 'glondia_minio');
    const secretAccessKey = this.config.get<string>('S3_SECRET_ACCESS_KEY', 'glondia_minio_secret');

    this.artifactsBucket = this.config.get<string>('S3_ARTIFACTS_BUCKET', 'glondia-artifacts');
    this.assetsBucket = this.config.get<string>('S3_ASSETS_BUCKET', 'glondia-assets');
    this.publicUrl = this.config.get<string>('S3_PUBLIC_URL', 'http://localhost:9000');

    this.client = new S3Client({
      endpoint,
      region: 'us-east-1', // MinIO ignores this; AWS uses the actual region
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true // required for MinIO
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists(this.artifactsBucket);
    await this.ensureBucketExists(this.assetsBucket);
  }

  // ─── Artifacts ───────────────────────────────────────────────────────────────

  createDeploymentArtifactObject(input: {
    organizationId: string;
    projectId: string;
    deploymentId: string;
  }): ArtifactObjectDescriptor {
    const objectKey = [
      'organizations',
      input.organizationId,
      'projects',
      input.projectId,
      'deployments',
      input.deploymentId,
      'artifact.zip'
    ].join('/');

    return {
      bucket: this.artifactsBucket,
      objectKey,
      publicUrl: null
    };
  }

  async uploadArtifact(input: {
    organizationId: string;
    projectId: string;
    deploymentId: string;
    body: Buffer | Readable;
    contentType?: string;
    sizeBytes?: number;
  }): Promise<ArtifactObjectDescriptor> {
    const descriptor = this.createDeploymentArtifactObject(input);
    await this.client.send(
      new PutObjectCommand({
        Bucket: descriptor.bucket,
        Key: descriptor.objectKey,
        Body: input.body,
        ContentType: input.contentType ?? 'application/zip',
        ContentLength: input.sizeBytes
      })
    );
    return descriptor;
  }

  async getArtifactSignedUrl(descriptor: ArtifactObjectDescriptor, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: descriptor.bucket,
      Key: descriptor.objectKey
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  // ─── Assets ──────────────────────────────────────────────────────────────────

  buildAssetKey(input: { organizationId: string; filename: string }): string {
    return `organizations/${input.organizationId}/assets/${input.filename}`;
  }

  async uploadAsset(input: {
    organizationId: string;
    filename: string;
    body: Buffer;
    contentType: string;
  }): Promise<{ objectKey: string; publicUrl: string }> {
    const objectKey = this.buildAssetKey(input);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.assetsBucket,
        Key: objectKey,
        Body: input.body,
        ContentType: input.contentType,
        ContentLength: input.body.byteLength
      })
    );
    const publicUrl = `${this.publicUrl}/${this.assetsBucket}/${objectKey}`;
    return { objectKey, publicUrl };
  }

  async deleteAsset(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.assetsBucket,
        Key: objectKey
      })
    );
  }

  async getAssetSignedUrl(objectKey: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.assetsBucket,
      Key: objectKey
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  // ─── Generic put (for builder pages, etc.) ───────────────────────────────────

  async putObject(input: {
    bucket: 'artifacts' | 'assets';
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    const bucketName = input.bucket === 'artifacts' ? this.artifactsBucket : this.assetsBucket;
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType
      })
    );
  }

  // ─── Internal ────────────────────────────────────────────────────────────────

  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: bucketName }));
        this.logger.log(`Created S3 bucket: ${bucketName}`);
      } catch (createErr) {
        this.logger.warn(`Could not create S3 bucket "${bucketName}": ${(createErr as Error).message}`);
      }
    }
  }
}
