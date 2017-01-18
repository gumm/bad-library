#!/bin/bash

LINT_TARGET=$1

echo "-----------------------------------------------------"

figlet Lint

echo "LINT_TARGET: ${LINT_TARGET}"
echo "-----------------------------------------------------"
echo ""
echo "Now formatting with Clang..."
shopt -s globstar
~/.local/lib/clang/bin/clang-format -i -style=Google ${LINT_TARGET}/**/*.js

echo "Finished"
