const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const tasks = require('@aws-cdk/aws-stepfunctions-tasks');

class LambdaStage extends lambda.Function {
  tasks = {}
  /**
   *
   * @param {*} scope
   * @param {*} id
   * @param {*} props {assetsPath|code, bucket}
   */
  constructor(scope, id, props) {
    const bucket = props.bucket;
    delete props.bucket;

    const defaults = {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.main',
      timeout: cdk.Duration.seconds(30),
    };
    super(scope, id, {
      ...defaults,
      ...props,
      code: props.code || lambda.Code.asset(props.assetPath),
      environment: {
        ...props.environment,
        STAGECI_BUCKET: bucket.bucketName,
        STAGECI_ENVIRONMENT: process.env.STAGECI_ENVIRONMENT,
      },
    });
    bucket.grantReadWrite(this);
  }

  asTask(name, props = {}) {
    if (this.tasks[name]) {
      return this.tasks[name];
    }
    const defaults = {
      outputPath: '$.Artifact',
      resultPath: '$.Artifact',
    };
    const task = new tasks.LambdaInvoke(this.stack, name, {
      ...defaults,
      ...props,
      lambdaFunction: this,
    });
    this.tasks[name] = task;
    return task;
  }
}

module.exports = { LambdaStage };
