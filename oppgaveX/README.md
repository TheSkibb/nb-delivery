# Oppgave X - Vulns in Worm || Worms in Vulns

## hvordan kjøre prosjektet 

kjør en skann:

~~~
go run main.go -s
~~~

vis info fra forrige skann:

~~~
go run main.go -l
~~~

## forklaring

programmet går linje for linje, sjekker om linjen starter med "Package: " eller "Version: ".
programmet bruker batch-endepunktet til osv.dev for å kunne finne sårbarheter i flere pakker samtidig.
Jeg satte batchSize til å være 1000 pakker per batch request.
Batch requesten gir en liste over id-er for sårbarheter i pakkene, jeg må så kjøre et kall for hver sårbarhet for å finne detaljer som score og detaljer.
Jeg brukte goroutines for å speede opp api kallene ved å kjøre dem samtidig i separate threads.


En liten utfordring jeg støtte på når jeg utførte oppgaven var at bufio sin scanner ikke klarer å takle lange linjer. 
fra [dokumentasjon på nettet](https://github.com/golang/go/issues/26466), fant jeg ut at det bare er lettere å skrive sin egen linje-parser
med de mer primitive bufio funksjonene.

Når programmet leser av pakkenavn og versjonsnummer så ser det bare på første 255 karakterer, 
utifra [dokumentasjon](https://www.debian.org/doc/manuals/maint-guide/first.en.html#namever), 
så fant jeg ut at lite sannsynlig at noen pakker som brukes i debian har lenger navn enn det. 

Jeg valgte å skrive dette programmet i golang fordi det er et språk jeg er interresert i å lære mer. Jeg har skrevet et par småting i det før
og likt det godt. Jeg så også muligheten til å prøve meg på goroutines, som jeg synes er spennende, og ikke hadde prøvd før.

## forbedringer

Noen forbedringer jeg ville gjort hvis jeg skulle ha jobbet lenger med denne oppgaven er:
1. automatiserte tester
2. bedre displaying av resultatene, med summary og detaljer for de som har det

