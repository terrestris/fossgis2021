#!/bin/bash

URL="https://terrestris.github.io/fossgis2021/workshops/geoserver-styling/geostyler_jars.tar.gz"
OUTPUT_PATH=/tmp/geostyler_jars.tar.gz
GS_PATH=/usr/local/lib/geoserver-2.18.1/webapps/geoserver/WEB-INF/lib

wget -v -O $OUTPUT_PATH $URL 

sudo tar --overwrite -xvzf $OUTPUT_PATH -C $GS_PATH

