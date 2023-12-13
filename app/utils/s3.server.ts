import { type PutObjectCommandInput, S3, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { UploadHandler } from '@remix-run/node';

const uploadStreamToS3 = async (data: AsyncIterable<Uint8Array>, key: string, contentType: string) => {

  const client = new S3({
    region: "us-west-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  const params: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: await convertToBuffer(data),
    ContentType: contentType,
  };

  await client.send(new PutObjectCommand(params));

  let url = await getSignedUrl(client, new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  }), { expiresIn: 60 * 60 * 24 * 7 });

  return url;
}

export const deleteObject = async (key: string) => {
  try {
    const client = new S3({
      region: "us-west-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    const params: DeleteObjectCommandInput = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    };


    const data = await client.send(new DeleteObjectCommand(params));
    console.log("Success. Object deleted.", data);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}

// The UploadHandler gives us an AsyncIterable<Uint8Array>, so we need to convert that to something the aws-sdk can use. 
// Here, we are going to convert that to a buffer to be consumed by the aws-sdk.
async function convertToBuffer(a: AsyncIterable<Uint8Array>) {
  const result = [];
  for await (const chunk of a) {
    result.push(chunk);
  }
  return Buffer.concat(result);
}

export const s3UploaderHandler: UploadHandler = async ({ filename, data, contentType }) => {
  return await uploadStreamToS3(data, filename!, contentType);
}

