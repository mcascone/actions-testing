import * as fs from 'fs';
import * as core from '@actions/core';
import { DefaultArtifactClient } from '@actions/artifact';
import { run } from '../index'; // Assuming the function is exported from index.ts

jest.mock('fs');
jest.mock('@actions/core');
jest.mock('@actions/artifact');

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write config to file and upload artifact', async () => {
    const mockWriteFileSync = fs.writeFileSync as jest.Mock;
    const mockUploadArtifact = jest.fn().mockResolvedValue({ id: '123', size: 456 });
    const mockSetOutput = core.setOutput as jest.Mock;
    const mockExportVariable = core.exportVariable as jest.Mock;
    const mockInfo = core.info as jest.Mock;
    const mockSetFailed = core.setFailed as jest.Mock;

    DefaultArtifactClient.prototype.uploadArtifact = mockUploadArtifact;

    await run();

    expect(mockWriteFileSync).toHaveBeenCalledWith('config.json', JSON.stringify({ max: 'cascone' }, null, 2));
    expect(mockUploadArtifact).toHaveBeenCalledWith('config', ['config.json'], './');
    expect(mockSetOutput).toHaveBeenCalledWith('artifactId', '123');
    expect(mockSetOutput).toHaveBeenCalledWith('config', JSON.stringify({ max: 'cascone' }));
    expect(mockSetOutput).toHaveBeenCalledWith('test', 'this is a test');
    expect(mockExportVariable).toHaveBeenCalledWith('ARTIFACT_ID', '123');
    expect(mockInfo).toHaveBeenCalledWith('this is coming from core.info');
    expect(mockSetFailed).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const mockSetFailed = core.setFailed as jest.Mock;
    const mockUploadArtifact = jest.fn().mockRejectedValue(new Error('upload failed'));

    DefaultArtifactClient.prototype.uploadArtifact = mockUploadArtifact;

    await run();

    expect(mockSetFailed).toHaveBeenCalledWith('upload failed');
  });
});