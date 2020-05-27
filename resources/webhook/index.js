/**
 * Handle webhooks from source control
 */
const { Webhooks } = require('@octokit/webhooks');

exports.main = async function(event, _) {
  console.log(event);
  // get secret from db
  const webhooks = new Webhooks({
    secret: 'mysecret',
  });
  // verify the request
  webhooks
    .verifyAndReceive({
      id: webhookEvent['x-request-id'],
      name: webhookEvent['x-github-event'],
      signature: webhookEvent['x-hub-signature'],
      // doesn't support url encode - I can coerce.
      payload: webhookEvent.body,
    })
  // download source
  // place on s3
  // invoke state machine
  return {}
}
