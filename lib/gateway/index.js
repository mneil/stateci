const apigwv2 = require('@aws-cdk/aws-apigatewayv2');
const cdk = require('@aws-cdk/core')

class Gateway extends cdk.Construct {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.HttpApi = new apigwv2.HttpApi(this, 'HTTPAPI', {
      createDefaultStage: false,
    });
  }
}
/**
 * Add a lambda to a route in a gateway
 * @param {*} gateway
 * @param {*} lambda
 * @param {*} props
 */
function addLambdaRoute(scope, gateway, lambda, props) {
  const name = `${lambda.id}-route`;
  const integration = new apigwv2.LambdaProxyIntegration({
    handler: lambda,
  });
  new apigwv2.HttpRoute(scope, name, {
    httpApi: gateway,
    integration,
    routeKey: apigwv2.HttpRouteKey.with(props.path, props.method),
  })

  // const booksDefaultFn = new lambda.Function(stack, 'BooksDefaultFn', { ... });
  // const booksDefaultIntegration = new LambdaProxyIntegration({
  //   handler: booksDefaultFn,
  // });

  // const httpApi = new HttpApi(stack, 'HttpApi');


  // httpApi.addRoutes({
  //   path: '/books',
  //   methods: [ HttpMethod.ANY ],
  //   integration: booksDefaultIntegration,
  // });
}

module.exports = { Gateway, addLambdaRoute };
