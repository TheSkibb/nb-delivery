## Oppgave X - Vulns in Worm || Worms in Vulns

Lag et program som finner sårbare pakker i debian bookworm ved hjelp av Open Source Vulnerabilities sin
database (https://osv.dev). For å snevre inn antall pakker noe er det ønskelig å kun undersøke
[main pakke listen for amd64](http://http.us.debian.org/debian/dists/bookworm/main/binary-amd64/Packages.gz),
en kopi av denne filen finnes i dette repositoryet med navn `Packages` i mappen `ressurser/oppgavex`.
Ønsket output fra programmet er en oversikt over alle sårbare pakker funnet med annen nødvendig infromasjon
for å kunne gjøre videre undersøkelser av sårbarheten.

### Eksterne avhengigheter

- Pakkeliste for debian bookworm amd64 main http://http.us.debian.org/debian/dists/bookworm/main/binary-amd64/Packages.gz
- Sårbarhetsinformasjon fra https://osv.dev

# mine generelle mål

Øve på golang, sqlite og bash

# Fremgangsmåte

Finne osv.dev apiet
Finne ut av formatet på package-liste

Parse package liste

to find out if i had understood the API, i tested it out with a rough bash script to get some results

to create the bash script i though that i could just do two greps for "package" and "version" and put them together
i had to do a little bit of regexing

point was to get some example outputs, so when i was done, i let the script run for a little bit, and looked at the responses

looking at the responses i found a couple of examples 

## tanker

ecosystem - think using debian would be right in this case
package entries are not all the same length
first two lines are always package and version, which is all i need in my case
    above is incorrect, sometimes the second line is source, what is the difference between version and source?

packages are newline divided

next steps: 
    batch queries: get result for multiple packages at the same time
    presentation: what and how to show the vulnerabilities?

ordered by severety
    use the score: higher gets presented first

show: 
    name, 
    version, 
    cve id,
    cve score,
    description,
    link? (kan hente med https://google.github.io/osv.dev/get-v1-vulns/)

