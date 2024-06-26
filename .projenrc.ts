import { MonorepoTsProject } from "@aws/pdk/monorepo";
import { InfrastructureTsProject } from "@aws/pdk/infrastructure";
import { Project } from "projen";

const project = new MonorepoTsProject({
  defaultReleaseBranch: "main",
  name: "video-search",
  description: "This repo is a sample video search app using AWS services.",
  deps: [],
  license: "MIT",
  copyrightOwner: "Amazon.com, Inc",
  tsconfig: {
    compilerOptions: {
      rootDir: undefined,
    },
  },
});
project.addGitIgnore(".idea");

const pipelineProject = new InfrastructureTsProject({
  parent: project,
  outdir: "packages/infra",
  defaultReleaseBranch: "main",
  name: "infra",
  cdkVersion: "2.1.0",
  license: "MIT",
  copyrightOwner: "Amazon.com, Inc",
  deps: [
    "@aws-cdk/aws-apigatewayv2-alpha",
    "@aws-cdk/aws-apigatewayv2-integrations-alpha",
    "@aws-cdk/aws-cognito-identitypool-alpha",
    "@aws-prototyping-sdk/identity",
  ],
  scripts: {
    ffmpeg: "cd layers/ffmpeg && make",
  },
});

const lambdaProject = new Project({
  parent: project,
  name: "lambda",
  outdir: "packages/lambda",
});
lambdaProject.addGitIgnore("target");
lambdaProject.addGitIgnore(".dist");
lambdaProject.tasks.tryFind("package")?.reset("make all");

const appProject = new Project({
  parent: project,
  name: "app",
  outdir: "packages/app",
});
appProject.addGitIgnore("target");
appProject.addGitIgnore(".dist");
appProject.tasks.tryFind("package")?.reset("make all");

project.addImplicitDependency(pipelineProject, lambdaProject);
project.addImplicitDependency(pipelineProject, appProject);

project.synth();
