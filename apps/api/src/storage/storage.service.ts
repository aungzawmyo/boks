import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client;
  private coversBucket: string;
  private ebooksBucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    const endpoint = this.config.get('S3_ENDPOINT') ?? 'http://localhost:9000';
    this.coversBucket =
      this.config.get('S3_BUCKET_COVERS') ?? 'boks-covers';
    this.ebooksBucket =
      this.config.get('S3_BUCKET_EBOOKS') ?? 'boks-ebooks';
    this.publicUrl = this.config.get('S3_PUBLIC_URL') ?? endpoint;
    this.client = new S3Client({
      region: this.config.get('S3_REGION') ?? 'us-east-1',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get('S3_ACCESS_KEY') ?? 'minioadmin',
        secretAccessKey: this.config.get('S3_SECRET_KEY') ?? 'minioadmin',
      },
    });
  }

  async onModuleInit() {
    try {
      await this.ensureBucket(this.coversBucket, true);
      await this.ensureBucket(this.ebooksBucket, false);
    } catch (err) {
      this.logger.warn(
        `S3/MinIO not ready yet: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  private async ensureBucket(bucket: string, publicRead: boolean) {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
      this.logger.log(`Created bucket ${bucket}`);
    }
    if (publicRead) {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      };
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: bucket,
          Policy: JSON.stringify(policy),
        }),
      );
    }
  }

  async uploadCover(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `covers/${randomUUID()}.${ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.coversBucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return {
      key,
      url: `${this.publicUrl}/${this.coversBucket}/${key}`,
    };
  }
}
