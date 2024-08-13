import * as core from "@actions/core";
import { DefaultArtifactClient } from "@actions/artifact";

export async function run() {
  try {
    // create a sample config.json file
    const configFileName = "config.json";
    const artifactName = "config";
    const rootDir = './';

    const fs = require("fs");

    const config = {
      max: "cascone",
    };

    fs.writeFileSync(configFileName, JSON.stringify(config, null, 2));

    // upload file 'config.json' as an artifact named 'config'
    const artifactClient = new DefaultArtifactClient();
    const files = [configFileName];
    const { id, size } = await artifactClient.uploadArtifact(artifactName, files, rootDir);

    console.log(`Created artifact with id: ${id} (bytes: ${size})`);

    console.log('config: ', config);

    core.setOutput("artifactId", id);

    core.setOutput("config", JSON.stringify(config));

    core.setOutput("test", "this is a test");

    core.exportVariable("ARTIFACT_ID", id);

    core.info('this is coming from core.info');
    core.notice('this is coming from core.notice');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()