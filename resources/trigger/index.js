const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const bucketName = process.env.BUCKET;

exports.main = async function(event, _) {
  const object = await S3.getObject({

     }).promise()

  // extract zip

  // cdk synth

  // validate

  // zip

  // upload to s3

  // return s3 path
}
