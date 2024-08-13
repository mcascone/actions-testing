import * as core from "@actions/core";
import { DefaultArtifactClient } from "@actions/artifact";

async function run() {
  try {

    // create a sample config.json file
    const fs = require("fs");
    const config = {
      max: "cascone",
    };

    fs.writeFileSync("config.json", JSON.stringify(config, null, 2));

    // upload file 'config.json' as an artifact
    const artifactClient = new DefaultArtifactClient();
    const artifactName = "config";
    const files = ["config.json"];

    const {id, size} = await artifactClient.uploadArtifact(artifactName, files, './')

    console.log(`Created artifact with id: ${id} (bytes: ${size})`)

    console.log('config: ', config)

    core.setOutput("artifactId", id)

    core.setOutput("config", JSON.stringify(config))

    core.setOutput("test", "this is a test")

    core.exportVariable("ARTIFACT_ID", id)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()