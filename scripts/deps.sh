#!/bin/bash

WORKSPACE=$1
JS_PATH=${WORKSPACE}/bad
GOOG_LIB_ROOT=${WORKSPACE}/node_modules/google-closure-library
GOOG_BIN_PATH=${GOOG_LIB_ROOT}/closure/bin/build

# Just start somewhere.
cd ${WORKSPACE}

chmod +x ${GOOG_BIN_PATH}/*.py

${GOOG_BIN_PATH}/depswriter.py \
   --root_with_prefix="bad ../../../../bad/"> ${JS_PATH}/deps.js
