#!/bin/bash

formatter="./node_modules/.bin/oxfmt"
input=$(cat)
file_path=$(jq -r '.tool_input.file_path' <<< "$input")
session_id=$(jq -r '.session_id' <<< "$input")

"$formatter" "$file_path" > /dev/null 2>&1

# One list per session, so agents sharing this directory only check their own
# edits.
echo "$file_path" >> "/tmp/claude-check-$session_id"

exit 0
