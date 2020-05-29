/**
 * State Machine "pipeline factory"
 *
 * Creates a state stack that will receive all webhooks
 * and perform state self-healing before invoking the target
 * "pipeline" state machine.
 */
const cdk = require('@aws-cdk/core');
const apigwv2 = require('@aws-cdk/aws-apigatewayv2');
const sfn = require('@aws-cdk/aws-stepfunctions');
const tasks = require('@aws-cdk/aws-stepfunctions-tasks');
const lambda = require('@aws-cdk/aws-lambda');
const CONSTANTS =  require('./const');
const { addLambdaRoute } = require('./gateway');

/**
 * Lambda to process incoming webhooks
 */
class WebhookLambda extends lambda.Function {
  constructor(scope, id, props) {
    super(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('resources/webhook'),
      handler: 'index.main',
      environment: {
        BUCKET: props.bucket.bucketName,
      },
    });
    props.bucket.grantReadWrite(this);
  }
}

/**
 * Lambda to synth your pipeline and
 * verify it before we try to deploy
 * it to cfn.
 */
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
/**
 * Create and execute change set
 * of synthesized CDK
 */
class DeployLambda extends lambda.Function {
  constructor(scope, id, props) {
    super(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('resources/deploy'),
      handler: 'lambda.main',
      environment: {
        BUCKET: props.bucket.bucketName,
      },
    });
    props.bucket.grantReadWrite(this);
  }
}
/**
 * Triggers your state machine once it's
 * been updated for this run
 */
class TriggerLambda extends lambda.Function {
  constructor(scope, id, props) {
    super(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('resources/deploy'),
      handler: 'lambda.main',
      environment: {
      },
    });
  }
}



/**
 * A state machine pipeline that
 * creates state machine pipelines
 * for self healing / auto updating
 */
class PipelineFactory extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // webhook lambda
    this.Gateway = apigwv2.HttpApi.fromApiId(this, 'Gateway', cdk.Fn.importValue(CONSTANTS.gatewayExport));
    this.WebhookLambda = new WebhookLambda(this, 'WebhookLambda', {
      bucket: props.ArtifactBucket,
    });
    addLambdaRoute(this, this.Gateway, this.WebhookLambda, {
      path: '/hooks',
      method: apigwv2.HttpMethod.POST,
    });

    const buildLambda = new BuildLambda(this, 'BuildLambda', {
      bucket: props.ArtifactBucket,
    });

    const deployLambda = new DeployLambda(this, 'DeployLambda', {
      bucket: props.ArtifactBucket,
    });

    const triggerLambda = new TriggerLambda(this, 'TriggerLambda', {
    });

    const submitJob = new tasks.LambdaInvoke(this, 'Build', {
      lambdaFunction: buildLambda,
      outputPath: '$.Artifact',
      resultPath: '$.Artifact',
    });

    const deployJob = new tasks.LambdaInvoke(this, 'Deploy', {
      lambdaFunction: deployLambda,
      inputPath: '$.Artifact',
      resultPath: '$.Artifact',
    });

    const triggerJob = new tasks.LambdaInvoke(this, 'Trigger', {
      lambdaFunction: triggerLambda,
      resultPath: 'DISCARD',
    });

    const definition = submitJob
      .next(deployJob)
      .next(triggerJob)

    this.StateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definition,
      timeout: cdk.Duration.minutes(30),
    });
  }
}

module.exports = { PipelineFactory }
