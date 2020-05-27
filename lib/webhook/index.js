const apigwv2 = require('@aws-cdk/aws-apigatewayv2');
const cdk = require('@aws-cdk/core')
const lambda = require('@aws-cdk/aws-lambda')
const s3 = require('@aws-cdk/aws-s3')

class WebhookLambda extends lambda.Function {
  constructor(scope, id, props) {
    super(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/webhook/resources'),
      handler: 'lambda.main',
      environment: {
        BUCKET: props.bucket.bucketName,
      },
    });
    props.bucket.grantReadWrite(this);
  }
}

class Gateway extends cdk.Construct {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.HttpApi = new apigwv2.HttpApi(this, 'HTTPAPI', {
      createDefaultStage: false,
    });

    this.ArtifactStore = new s3.Bucket(this, "ArtifactStore");

    this.WebhookLambda = new WebhookLambda(this, 'WebhookLambda', {
      bucket: this.ArtifactStore,
    });

    this.WebhookIntegration = new apigwv2.LambdaProxyIntegration({
      handler: this.WebhookLambda,
    });

    this.HttpApi.addRoutes({
      path: '/hooks',
      methods: [ apigwv2.HttpMethod.POST ],
      integration: this.WebhookIntegration,
    });

  }
}

module.exports = { Gateway }
