#!/bin/sh
export NODE_OPTIONS=--max-old-space-size=4096
yarn buidler compile &&
node contractSizeReport.js