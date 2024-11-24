#! /bin/bash

plist=./Packages

#get the package names and versions (and cut the "Version: "/"Package: " part) and put them into arrays
readarray -t pnames < <(grep "^Package:\s" $plist | cut -c 10-)
readarray -t pversions < <(grep "^Version:\s" $plist | cut -c 10-)

#get the length of the arrays
pnameslength=${#pnames[@]}
pversionslength=${#pversions[@]}

# check if length of arrays match
if [ $pnameslength -ne $pversionslength ]; then
    echo "length do not match: package list may be malformed"
    exit 1
fi

output=./result.txt
echo "" > $output

#for i in $(seq 0 10)
for i in $(seq 0 $pnameslength); 
do

    name=${pnames[i]}
    version=${pversions[i]}

    echo $name $version >> $output

    curl -d \
    "{\"version\": \"$version\", \"package\": {\"name\": \"$name\", \"ecosystem\": \"Debian:12\"}}" \
    "https://api.osv.dev/v1/query" >> $output
    echo "\n" >> $output
done



#curl -d \
#'{"version": "0.0.26-3", "package": {"name": "0ad", "ecosystem": "Debian:12"}}' \
#"https://api.osv.dev/v1/query"

