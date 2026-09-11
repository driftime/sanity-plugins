#!/bin/bash

formatter="./node_modules/.bin/oxfmt"
input=$(cat)
file_path=$(jq -r '.tool_input.file_path' <<< "$input")
session_id=$(jq -r '.session_id' <<< "$input")

"$formatter" "$file_path" > /dev/null 2>&1

# Recorded per session_id so concurrent agents sharing this working directory
# each build their own file list, not a mix of everyone's in-progress edits.
echo "$file_path" >> "/tmp/claude-check-$session_id"

exit 0
