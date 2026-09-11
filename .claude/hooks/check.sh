#!/bin/bash

linter="./node_modules/.bin/oxlint"
input=$(cat)
session_id=$(jq -r '.session_id' <<< "$input")
list="/tmp/claude-check-$session_id"

# Nothing was written or edited this session, so there's nothing to check.
[ -f "$list" ] || exit 0

# A listed file may have since been deleted; oxfmt already runs on every
# edit in format.sh, so only linting is left to do here.
files=$(sort -u "$list" | while read -r file; do [ -f "$file" ] && echo "$file"; done)

[ -z "$files" ] && exit 0

output=$("$linter" $files 2>&1)
status=$?

# oxlint errors when it has nothing to check, which isn't a real failure.
# Blocking is otherwise safe: this list only ever holds this session's own
# files, so it can't hold up another agent's work.
if [ $status -ne 0 ] && [[ "$output" != *"No files found to lint"* ]]; then
  jq -n --arg output "$output" '{decision: "block", reason: $output}'
fi

exit 0
