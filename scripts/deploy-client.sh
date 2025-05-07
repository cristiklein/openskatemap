#!/bin/bash

set -ex

npm run predeploy
npx release-it minor
npm run deploy
