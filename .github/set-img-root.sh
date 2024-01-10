#!/bin/bash

set -e

sed -i 's#DEPLOYED_IMG_ROOT\s*=\s*undefined#DEPLOYED_IMG_ROOT='"\"https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/\""'#g' js/utils.js
