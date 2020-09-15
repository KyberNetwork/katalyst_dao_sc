#!/bin/sh
while getopts "f:" arg; do
  case $arg in
    f) FILE=$OPTARG;;
  esac
done

if [ -n "$FILE" ]; then
  yarn buidler test $FILE
else
  yarn buidler test --config ./buidler.config.js
fi
