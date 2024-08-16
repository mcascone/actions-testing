import * as core from "@actions/core";
import * as fs from "fs";
import { DefaultArtifactClient } from "@actions/artifact";

enum Mode {
  CREATE = "create",
  READ   = "read",
  UPDATE = "update",
  WRITE  = "write",
};

export async function run() {
  try {
    const mode   = core.getInput("mode");
    const config = core.getInput("config");
    const id     = core.getInput("artifactId");

    const artifactClient = new DefaultArtifactClient();
    const artifactName   = "config";
    const configFileName = artifactName + ".json";
    const rootDir        = './';

    let artID: number;
    let content  = {};
    
    ///////// CREATE ///////////////
    // create a config.json file
    if (mode == Mode.CREATE) {
      console.log("Creating config.json file");
      
      // if the config input is not null or not empty, use it
      // otherwise, use a default value
      if (config && config.length > 0) {
        content = JSON.parse(config);
      }
      else {
        content = {
          "keanu": "reeves",
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

      // set artifact id as an output
      core.setOutput("artifactId", artID);

      // set the json string as an output
      core.setOutput('config', JSON.stringify(content));

      // set the json string as an env var
      core.exportVariable('CONFIG', JSON.stringify(content));      
    }

    ///////////// READ/WRITE/UPDATE ////////////////////////////
    // first, READ the artifact into a file and create an object
    else if ([Mode.READ, Mode.WRITE, Mode.UPDATE].includes(mode as Mode)) {

      // download the artifact
      // parse the file into an object
      // downloadResponse is the downloadPath (the parent path, not the file itself)
      const downloadResponse = await artifactClient.downloadArtifact(Number(id));
      const file = downloadResponse.downloadPath + '/' + configFileName;
      console.log('file path: ', file);

      // read the file
      let data: string;
      if (file) {
        data = fs.readFileSync(file, 'utf8');
      } else {
        throw new Error("File path is undefined.");
      }
      
      // parse the file into an object
      const content    = JSON.parse(data);
      const contentStr = JSON.stringify(content, null, 2);
      console.log('config from file: ', contentStr);

      // set the json string as an output
      core.setOutput('content', contentStr);

      // set the json string as an env var
      core.exportVariable('CONFIG', contentStr);

      ///////////// WRITE/UPDATE ///////////////////
      // if mode is write or update
      if (mode == Mode.WRITE || mode == Mode.UPDATE) {
        console.log("updating and writing config");

        // create an object with the contents of the input config
        const newContent = JSON.parse(config);

        // update the existing object with the new inputs
        const updatedContent = { ...content, ...newContent };

        // write the file to the filesystem
        fs.writeFileSync(configFileName, JSON.stringify(updatedContent, null, 2));

        // upload file 'config.json' as an artifact named 'config'
        const files = [configFileName];
        const { id, size } = await artifactClient.uploadArtifact(artifactName, files, rootDir);
        artID = id ?? 0;
        core.setOutput("artifactId", artID);
        console.log(`Created artifact with id: ${artID} (bytes: ${size})`);

        // set artifact id as an output
        core.setOutput("artifactId", artID);

        // set the json string as an output
        core.setOutput('config', JSON.stringify(updatedContent));

        // set the json string as an env var
        core.exportVariable('CONFIG', JSON.stringify(updatedContent));
      }
    }
    else {
      throw new Error("Invalid mode: " + mode);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()