const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const Stateci = require('../../lib/baseline-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Stateci.BaselineStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
