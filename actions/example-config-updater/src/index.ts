import * as core from "@actions/core";
import * as fs from "fs";
import { DefaultArtifactClient } from "@actions/artifact";

enum Mode {
  CREATE = "create",
  READ   = "read",
  WRITE  = "write"
};

export async function run() {
  try {
    const mode   = core.getInput("mode");
    const config = core.getInput("config");

    const artifactClient = new DefaultArtifactClient();
    const configFileName = "config.json";
    const artifactName   = "config";
    const rootDir        = './';
    let artID: number;
    
    ///////// CREATE ///////////////
    // create a config.json file
    if (mode == Mode.CREATE) {
      console.log("Creating config.json file");
      let content  = {};

      // if the config input is not null or not empty, use it
      // otherwise, use a default value
      if (config && config.length > 0) {
        content = JSON.parse(config);
      }
      else {
        content = {
          max: "cascone",
        };
      }
      console.log('content: ', content);

      // write the file to the filesystem
      fs.writeFileSync(configFileName, JSON.stringify(content, null, 2));

      // upload file 'config.json' as an artifact named 'config'
      const files = [configFileName];
      const { id, size } = await artifactClient.uploadArtifact(artifactName, files, rootDir);
      artID = id ?? 0;
      core.setOutput("artifactId", artID);
      console.log(`Created artifact with id: ${artID} (bytes: ${size})`);

      // set the json string as an env var
      core.exportVariable('CONFIG', JSON.stringify(content));

      // set the json string as an output
      core.setOutput('config', JSON.stringify(content));
    }

    ///////////// READ ///////////////////
    // READ the artifact into a file and create an object
    else if (mode == Mode.READ) {
      const id = core.getInput("artifactId");

      console.debug("reading config.json file, id: ", id);

      // download the artifact
      // parse the file into an object
      const downloadResponse = await artifactClient.downloadArtifact(Number(id));

      console.log('downloadResponse: ', downloadResponse);
      const file = downloadResponse.downloadPath;
      console.log('file: ', file);

      let data: string;
      
      // read the file
      if (file) {
        data = fs.readFileSync(file, 'utf8'); // Assign a value to the variable inside the if block
      } else {
        throw new Error("File path is undefined.");
      }
      
      // parse the file into an object
      const config = JSON.parse(data);

      console.log('config: ', config);


    }

    ///////////// WRITE ///////////////////
    else if (mode == Mode.WRITE) {
      console.log("writing config.json file");
    }
    else {
      throw new Error("Invalid mode: " + mode);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()