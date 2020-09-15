const fs = require('fs');
const path = require('path');
const cp = require('cp');

const buildArtifactsPath = path.join(__dirname, '.coverageArtifacts');
const targetArtifactPath = path.join(__dirname, '.coverage_artifacts');

function buildFiles(config) {
  if (!fs.existsSync(buildArtifactsPath)) {
    fs.mkdirSync(buildArtifactsPath);
  }

  if (fs.existsSync(targetArtifactPath)) {
    const buildFiles = fs.readdirSync(buildArtifactsPath);
    const targetFiles = fs.readdirSync(targetArtifactPath);

    if (buildFiles) {
      buildFiles.forEach((file) => {
        cp(path.join(buildArtifactsPath, file), path.join(targetArtifactPath, file), (err) => {
          if (err) throw err;
          console.log(`Copying ` + file);
        });
      });
    }
    if (targetFiles) {
      targetFiles.forEach((file) => {
        cp(path.join(targetArtifactPath, file), path.join(buildArtifactsPath, file), (err) => {
          if (err) throw err;
          console.log(`Copying ` + file);
        });
      });
    }
  }
}

module.exports = {
  providerOptions: {
    default_balance_ether: 100000000000000,
    total_accounts: 20,
  },
  skipFiles: ['mock/', 'zeppelin/'],
  istanbulReporter: ['html', 'json'],
  onCompileComplete: buildFiles,
};
