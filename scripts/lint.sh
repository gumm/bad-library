#!/bin/bash

LINT_TARGET=$1
BASE_NAME=$(basename "${LINT_TARGET}")


command -v ~/.local/bin/fixjsstyle >/dev/null 2>&1 || { echo >&2 "I require fixjsstyle and can not find it. Run buildout to install it"; exit 1; }
command -v ~/.local/bin/gjslint >/dev/null 2>&1 || { echo >&2 "I require gjslint and can not find it. Run buildout to install it"; exit 1; }

~/.local/bin/fixjsstyle --nojsdoc -r ${LINT_TARGET}/
~/.local/bin/gjslint \
    --nojsdoc -r ${LINT_TARGET}/ \
    --multiprocess \
    --summary \
    --time \
    --closurized_namespaces goog,bad,app
