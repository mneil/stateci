#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { StateciStack } = require('../lib/stateci-stack');

const app = new cdk.App();
new StateciStack(app, 'StateciStack');
