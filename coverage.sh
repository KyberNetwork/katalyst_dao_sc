#!/bin/sh
export NODE_OPTIONS=--max-old-space-size=4096

yarn buidler clean
rm -r ./.coverageArtifacts

yarn buidler coverage --config ./buidler.config.js --testfiles "" --solcoverjs ".solcover.js" --temp ""
