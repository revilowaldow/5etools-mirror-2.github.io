#!/bin/bash

set -e

if [[ $# -eq 0 ]]; then
    echo "No arguments provided. Usage: set-deployed-flag.sh <version>"
    exit 1
fi

version=$1

# Set the IS_DEPLOYED variable for production.
sed -i 's/IS_DEPLOYED\s*=\s*undefined/IS_DEPLOYED='"\"${version}\""'/g' js/utils.js

sed -i 's#DEPLOYED_IMG_ROOT\s*=\s*undefined#DEPLOYED_IMG_ROOT='"\"https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/\""'#g' js/utils.js
