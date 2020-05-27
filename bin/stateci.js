#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { BaselineStack } = require('../lib/baseline-stack');

const app = new cdk.App();
new BaselineStack(app, 'StateciBaselineStack');
