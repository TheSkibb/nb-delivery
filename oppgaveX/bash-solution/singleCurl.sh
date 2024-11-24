version="2.3.1+dfsg1-1"
name="389-ds-base"

curl -d \
    "{\"version\": \"$version\", \"package\": {\"name\": \"$name\", \"ecosystem\": \"Debian:12\"}}" \
    "https://api.osv.dev/v1/query" 
 
