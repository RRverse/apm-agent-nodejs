#!/usr/bin/env bash

set -exo pipefail


npm_cache="$HOME/.npm"
docker_npm_cache="/home/node/.npm"
nyc_output=`pwd`"/.nyc_output"
docker_nyc_output="/app/.nyc_output"

NODE_VERSION=14
  TAV_MODULES=`echo "mariadb" | sed -e 's/\+/,/g'`
  CMD='npm run test:tav'

NODE_VERSION=14 docker-compose --no-ansi --log-level ERROR -f ./test/docker-compose.yml -f ./test/docker-compose.ci.yml run \
  -e NODE_VERSION=${NODE_VERSION} \
  -e TAV=${TAV_MODULES} \
  -e CI=true \
  -v ${npm_cache}:${docker_npm_cache} \
  -v ${nyc_output}:${docker_nyc_output} \
  -v "$(pwd)":/app \
  -w /app \
  --rm node_tests \
  /bin/bash \
  -c "npm config set cache ${docker_npm_cache} --global
      npm install
      node --version
      npm --version
      ${CMD}"

NODE_VERSION=${1} docker-compose --no-ansi --log-level ERROR -f ./test/docker-compose.yml -f ./test/docker-compose.ci.yml down -v
