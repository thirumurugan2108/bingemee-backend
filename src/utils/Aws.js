const fs = require("fs");
const AWS = require("aws-sdk");

class Aws {
  static async savePhoto(userId, filename, fileContent, extname) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.get("S3_ACCESS_ID"),
      secretAccessKey: process.env.get("S3_SECRET_KEY"),
    });

    const par = {
      Bucket: process.env.get("S3_BUCKET_NAME"),
      Key: `uploads/tmp/${filename}`, // File name you want to save as in S3
      ACL: "public-read",
      Body: fileContent,
    };

    await s3.upload(par, async (err, data) => {
      if (err) {
        // err = true;
        console.log("error");
        console.log(err);
        console.log(err.stack);

        throw err;
      }

      console.log(`File uploaded successfully. ${data.Location}`);
    });

   
  }

  static async savePhotoinInviteUser(
    photoName,
    filename,
    fileContent,
    extname,
  ) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.get("S3_ACCESS_ID"),
      secretAccessKey: process.env.get("S3_SECRET_KEY"),
    });

    const par = {
      Bucket: process.env.get("S3_BUCKET_NAME"),
      Key: `uploads/tmp/${filename}`, // File name you want to save as in S3
      ACL: "public-read",
      Body: fileContent,
    };

    await s3.upload(par, async (err, data) => {
      if (err) {
        err = true;
        throw err;
      }

    //   await Aws.invalidateCacheAtCloudFront({
    //     path: [`/uploads/profile/${photoName}/*`],
    //   });
      console.log(`File uploaded successfully. ${data.Location}`);
    });
    return true;
  }

  static async pushNotification(payload) {
    const SQS = new AWS.SQS({
      apiVersion: "2012-11-05",
      region: process.env.get("AWS_SQS_REGION"),
      accessKeyId: process.env.get("AWS_SQS_ACCESS_KEY"),
      secretAccessKey: process.env.get("AWS_SQS_SECRET_KEY"),
    });
    const response = await SQS.sendMessage({
      QueueUrl: process.env.get("AWS_SQS_QUEUE_URL"),
      MessageBody: JSON.stringify(payload),
    }).promise();

    console.log({
      QueueUrl: process.env.get("AWS_SQS_QUEUE_URL"),
      MessageBody: JSON.stringify(payload),
    });
  }

  static async invalidateCacheAtCloudFront(payload) {
    const config = {
      accessKeyId: process.env.get("AWS_CLOUDFRONT_ACCESS_KEY"),
      secretAccessKey: process.env.get("AWS_CLOUDFRONT_SECRET_KEY"),
    };
    const cloudFront = new AWS.CloudFront(config);
    const invalidationParams = {
      DistributionId: process.env.get("CLOUD_FRONT_DISTRIBUTION_ID"),
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: payload.path.length,
          Items: payload.path,
        },
      },
    };
    await cloudFront.createInvalidation(invalidationParams).promise();
  }
}

module.exports = Aws;
