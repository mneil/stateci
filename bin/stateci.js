#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { BaselineStack } = require('../lib/baseline-stack');
const { PipelineStack } = require('../lib/pipeline-stack');

const app = new cdk.App();
const baseline = new BaselineStack(app, 'StateciBaselineStack');
new PipelineStack(app, 'StateciPipelineFactory', {
  ArtifactBucket: baseline.ArtifactStore,
});
