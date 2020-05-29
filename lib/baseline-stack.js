/**
 * Baseline Stack
 *
 * Creates API gateway with
 *  - webhook handler to process git hooks
 */
const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');
const { Gateway } = require('./gateway');
const CONSTANTS =  require('./const');

class BaselineStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    this.ArtifactStore = new s3.Bucket(this, 'ArtifactStore');

    this.Gateway = new Gateway(this, 'Gateway', {
      ArtifactStore: this.ArtifactStore,
    });

    new cdk.CfnOutput(this, 'GatewayOutput', {
      value: this.Gateway.HttpApi.httpApiId,
      description: 'Stateci gateway for UI and webhooks',
      exportName: CONSTANTS.gatewayExport,
    });


  }
}

module.exports = { BaselineStack }
