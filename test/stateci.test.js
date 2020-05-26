const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const Stateci = require('../lib/stateci-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Stateci.StateciStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
