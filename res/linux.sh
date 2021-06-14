#!/bin/sh

display_env=`loginctl show-session $(awk '/tty/ {print $1}' <(loginctl)) -p Type | awk -F= '{print $2}'`

if [ "$display_env" = "wayland" ];then
	command -v wl-paste >/dev/null 2>&1 || { echo >&1 "no wl-paste"; exit 1; }

	if
		wl-paste --type image/png >/dev/null 2>&1
	then
		wl-paste --type image/png >$1 2>/dev/null
		echo $1
	else
		echo "no image"
	fi
else
	# require xclip(see http://stackoverflow.com/questions/592620/check-if-a-program-exists-from-a-bash-script/677212#677212)
	command -v xclip >/dev/null 2>&1 || { echo >&1 "no xclip"; exit 1; }

	# write image in clipboard to file (see http://unix.stackexchange.com/questions/145131/copy-image-from-clipboard-to-file)
	if
		xclip -selection clipboard -target image/png -o >/dev/null 2>&1
	then
		xclip -selection clipboard -target image/png -o >$1 2>/dev/null
		echo $1
	else
		echo "no image"
	fi
fi

