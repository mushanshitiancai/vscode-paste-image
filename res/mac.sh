#!/bin/sh

# require xclip(see http://stackoverflow.com/questions/592620/check-if-a-program-exists-from-a-bash-script/677212#677212)
command -v pngpaste >/dev/null 2>&1 || { echo >&1 "no pngpaste"; exit 1; }

# write image in clipboard to file (see http://unix.stackexchange.com/questions/145131/copy-image-from-clipboard-to-file)
if
pngpaste - >/dev/null 2>&1
then
pngpaste - >$1 2>/dev/null
echo -n $1 | base64
else
echo "no image"
fi