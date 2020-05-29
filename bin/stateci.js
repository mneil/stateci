#!/usr/bin/env node

if (!process.env.STATECI_ENVIRONMENT) {
  process.env.STATECI_ENVIRONMENT = 'pr';
}

const cdk = require('@aws-cdk/core');
const { BaselineStack } = require('../lib/baseline-stack');
const { PipelineFactory } = require('../lib/pipeline-stack');

const app = new cdk.App();
const baseline = new BaselineStack(app, `${process.env.STATECI_ENVIRONMENT}-StateciBaselineStack`);


new PipelineFactory(app, `${process.env.STATECI_ENVIRONMENT}-StateciPipelineFactory`, {
  ArtifactBucket: baseline.ArtifactStore,
});
