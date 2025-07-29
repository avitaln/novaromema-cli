#!/bin/bash

# Increment version in constants.ts
perl -pi -e 's/(WIDGET_VERSION = .)([0-9]+)(.)/$1.($2+1).$3/e' src/site/widgets/constants.ts

# Get the new version
VERSION=$(grep -o "'[^']*'" src/site/widgets/constants.ts | tr -d "'")

# Build the app
npm run build

# Release with version as comment
npx wix app release --version-type minor -c "$VERSION" 