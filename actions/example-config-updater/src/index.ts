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
    const rootDirectory = ".";

    const uploadResponse = await artifactClient.uploadArtifact(
      artifactName,
      files,
      rootDirectory,
    );

    console.log(
      `Created artifact with id: ${uploadResponse.id} (bytes: ${uploadResponse.size}`,
    );

    console.log('config: ', config)

    core.setOutput("artifactId", uploadResponse.id);

  } catch (error) {
    core.setFailed(error.message);
  }
}
