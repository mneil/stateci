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
const CONSTANTS =  require('./const');
const { LambdaStage } = require('./pipeline/stage');
const { addLambdaRoute } = require('./gateway');

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
    this.WebhookLambda = new LambdaStage(this, 'WebhookLambda', {
      bucket: props.ArtifactBucket,
      assetPath: 'resources/webhook',
    })
    addLambdaRoute(this, this.Gateway, this.WebhookLambda, {
      path: '/hooks',
      method: apigwv2.HttpMethod.POST,
    });

    // build
    const buildLambda = new LambdaStage(this, 'BuildLambda', {
      bucket: props.ArtifactBucket,
      assetPath: 'resources/build',
    });
    const submitJob = buildLambda.asTask('Build');

    // deploy
    const deployLambda = new LambdaStage(this, 'DeployLambda', {
      bucket: props.ArtifactBucket,
      assetPath: 'resources/deploy',
    });
    const deployJob = deployLambda.asTask('Deploy')

    // trigger users pipeline
    const triggerLambda = new LambdaStage(this, 'TriggerLambda', {
      bucket: props.ArtifactBucket,
      assetPath: 'resources/trigger',
    });
    const triggerJob = triggerLambda.asTask('Trigger');

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
