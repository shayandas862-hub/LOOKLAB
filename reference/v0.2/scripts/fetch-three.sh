#!/bin/sh
# three.js r128 UMD build, the exact version the page loads from cdnjs. Used only by the e2e test (routes the CDN request to this file).
set -e
mkdir -p "$(dirname "$0")/../vendor"
curl -fsSL https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js -o "$(dirname "$0")/../vendor/three.min.js"
echo "vendor/three.min.js: $(wc -c < "$(dirname "$0")/../vendor/three.min.js") bytes"
