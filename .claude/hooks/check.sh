#!/bin/bash

linter="./node_modules/.bin/oxlint"
input=$(cat)
session_id=$(jq -r '.session_id' <<< "$input")
list="/tmp/claude-check-$session_id"

# No files were edited this session.
[ -f "$list" ] || exit 0

# Skip files deleted since they were edited. format.sh has already formatted
# the rest, so they only need linting.
files=$(sort -u "$list" | while read -r file; do [ -f "$file" ] && echo "$file"; done)

[ -z "$files" ] && exit 0

output=$("$linter" $files 2>&1)
status=$?

# oxlint fails when every file is ignored, which isn't a lint error. The list
# only holds this session's files, so blocking never stalls another agent.
if [ $status -ne 0 ] && [[ "$output" != *"No files found to lint"* ]]; then
  jq -n --arg output "$output" '{decision: "block", reason: $output}'
fi

exit 0
