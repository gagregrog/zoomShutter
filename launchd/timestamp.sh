#!/bin/bash
# Strips color codes and prefixes each line with a timestamp.
# Ignores stop signals so the app's shutdown output still reaches the log.
trap '' INT TERM
exec perl -MPOSIX -ne '$| = 1; s/\e\[[0-9;]*m//g; print strftime("%Y-%m-%d %H:%M:%S ", localtime), $_'
