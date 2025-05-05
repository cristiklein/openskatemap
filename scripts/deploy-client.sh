#!/bin/bash

set -ex

npm run predeploy
npm version minor
npm run deploy

git push origin main --tags
