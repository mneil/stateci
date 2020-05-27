/**
 * State Machine "pipeline factory"
 *
 * Creates a state stack that will receive all webhooks
 * and perform state self-healing before invoking the target
 * "pipeline" state machine.
 */
const sfn = require('@aws-cdk/aws-stepfunctions');
const tasks = require('@aws-cdk/aws-stepfunctions-tasks');
const lambda = require('@aws-cdk/aws-lambda');


class BuildLambda extends lambda.Function {
  constructor(scope, id, props) {
    super(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('resources/build'),
      handler: 'lambda.main',
      environment: {
        BUCKET: props.bucket.bucketName,
      },
    });
    props.bucket.grantReadWrite(this);
  }
}

class PipelineFactory extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const buildLambda = new BuildLambda(this, 'BuildLambda', {
      bucket: props.ArtifactBucket,
    });
    props.ArtifactBucket.grandtRead(this, {objectsKeyPattern: '*'});
    // const getStatusLambda = new lambda.Function(this, 'CheckLambda', {  });

    const submitJob = new tasks.LambdaInvoke(this, 'Build', {
      lambdaFunction: buildLambda,
      outputPath: '$.Payload',
    });

    const waitX = new sfn.Wait(this, 'Wait X Seconds', {
        time: sfn.WaitTime.secondsPath('$.waitSeconds'),
    });

    // const getStatus = new tasks.LambdaInvoke(this, 'Get Job Status', {
    //   lambdaFunction: getStatusLambda,
    //   // Pass just the field named "guid" into the Lambda, put the
    //   // Lambda's result in a field called "status" in the response
    //   inputPath: '$.guid',
    //   outputPath: '$.Payload',
    // });

    const jobFailed = new sfn.Fail(this, 'Job Failed', {
        cause: 'AWS Batch Job Failed',
        error: 'DescribeJob returned FAILED',
    });

    const finalStatus = new tasks.LambdaInvoke(this, 'Get Final Job Status', {
      lambdaFunction: getStatusLambda,
      // Use "guid" field as input
      inputPath: '$.guid',
      outputPath: '$.Payload',
    });

    const definition = buildLambda
      .next(waitX)
      // .next(getStatus)
      .next(new sfn.Choice(this, 'Job Complete?')
        // Look at the "status" field
        .when(sfn.Condition.stringEquals('$.status', 'FAILED'), jobFailed)
        .when(sfn.Condition.stringEquals('$.status', 'SUCCEEDED'), finalStatus)
        .otherwise(waitX));

    this.StateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definition,
      timeout: Duration.minutes(30)
    });
  }
}

module.exports = { PipelineFactory }
