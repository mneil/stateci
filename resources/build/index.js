const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const bucketName = process.env.BUCKET;

exports.main = async function(event, _) {
  const object = await S3.getObject({

     }).promise()
}
