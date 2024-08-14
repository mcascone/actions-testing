import * as core from "@actions/core";
import * as fs from "fs";
import { DefaultArtifactClient } from "@actions/artifact";

enum Mode {
  CREATE = "create",
  READ = "read",
};

export async function run() {
  try {
    const mode = core.getInput("mode");
    const artifactClient = new DefaultArtifactClient();
    
    // create a config.json file
    if (mode == Mode.CREATE) {
      console.log("Creating config.json file");

      const configFileName = "config.json";
      const artifactName = "config";
      const rootDir = './';
      
      const content = {
        max: "cascone",
      };
      
      // write the file
      fs.writeFileSync(configFileName, JSON.stringify(content, null, 2));

      // upload file 'config.json' as an artifact named 'config'
      const files = [configFileName];
      const { id, size } = await artifactClient.uploadArtifact(artifactName, files, rootDir);

      console.log(`Created artifact with id: ${id} (bytes: ${size})`);
    }
    else if (mode == Mode.READ) {
      console.log("reading config.json file");
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()