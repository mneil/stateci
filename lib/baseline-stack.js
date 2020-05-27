const cdk = require('@aws-cdk/core');
const { Gateway } = require('./webhook')

class BaselineStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new Gateway(this, 'WebhookGateway')
  }
}

module.exports = { BaselineStack }
