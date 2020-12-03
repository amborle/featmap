#!/bin/bash
scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd "$scriptDir"

echo "build webapp"
./build_webapp.sh

echo "generate static assets"
./generate.sh

echo "main build"
./build_all_arch.sh