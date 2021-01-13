#!/bin/sh
export NODE_OPTIONS=--max-old-space-size=4096

yarn hardhat clean
rm -r ./.coverageArtifacts

yarn hardhat coverage --testfiles "" --solcoverjs ".solcover.js" --temp ""
