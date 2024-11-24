# normalisering av logger

## kjøre prosjektet

~~~
go run main.go
~~~

## forklaring

programmet går igjennom en liste med filer. så linje for linje i filen og parser linjen basert på hvilken type loggfil det er.
for å finne ut hvilke felter jeg skulle beholde i de normaliserte loggene, så jeg på hva de hadde til felles.
Jeg tok utgangspunkt i eksempelet som ble gitt i oppgaven, og fant disse feltene som det som er til felles for loggene.

- timestamp
- source_ip
- dest_ip
- source_port
- dest_port
- protocol

Programmet leser det inn i en struct og legges i en liste som kan brukes videre for søking

~~~go
type normalizedLog struct {
	timestamp        string
	src_ip           string
	dst_ip           string
	src_port         string
	dst_port         string
	protocol         string
	sourceType       string
	sourceFile       string
	sourceLineNumber int
}
~~~

I tillegg la jeg til felter for hvilke fil loggen kom fra og linjenummeret, sånn at det er mulig å referere tilbake til den originale loggen.

Hovedutfordringen her for meg var å forstå hva som burde være med fra tcp-dump loggene.
tcpdump gir veldig granulær innsikt i traffikken. Inntrykket mitt for hva som egentlig er interresant her,
er kilde/destinasjon ip/port og protokollen trafikken ble gjort gjennom
Jeg valgte å bare beholde logger som gikk over IP protokollen (alså ikke stp), jeg gjorde dette fordi det jeg så mest av i de andre loggene var tcp og udp trafikk

# forbedringer

Jeg er ikke helt fornøyd med hvordan tcpdump biten av programmet ble, hvis jeg skulle jobbet lenger med programmet, så ville jeg jobbet med
å forbedre forståelsen av hva som er interresant i disse loggene.
Jeg ville også jobbet mer med hvilke felter som er med i de normaliserte loggene, slik at den har med all informasjonen som er interresant.
For å finne det ut, så ville jeg hørt med brukerne av programmet, for å se hva de var ute etter å søke etter. I min implementasjon antok jeg
bare at de var mest interresert i hvilke ip-er som har kommunisert.
