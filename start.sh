#!/bin/bash

docker run -p 4000:4000 -p 35729:35729 --rm --volume="$PWD:/srv/jekyll" -it jekyll/minimal jekyll serve --livereload
