# a walk in the graph

Til denne oppgaven valgte jeg å lage en liten nettside, slik at det er lett å få et visuelt inntrykk.

Problemet i seg selv er, som navnet hinter til, graph traversal.
Jeg valgte å bruke en DFS algoritme for å først finne ut hvilke noder som kan bli funnet fra hver node.
Etter å ha funnet dette er neste steget å ta par med noder og kalkulere alle måtene man kan komme seg mellom dem med et DFS søk.
mens DFS søket pågår, så validerer den stien, for å passe på at den kan avslutte tidlig, om stien ikke er gyldig

# Utfordringer

En av hovedutfordringene her synes jeg var input validering.
vanilla js var kanskje ikke det beste språket for å løse dette, på grunn av mangelen på typing, 
Men det var en morsom utfordring å prøve å passe på at input-filen stemte overens.

En annen utfordring var at dette var en veldig ny type oppgave for meg. Jeg har knapt jobbet med eller tenkt over
grafer før, og måtte derfor bruke en del av tiden på å ble kjent med konseptet.

Jeg er også litt usikker på siste delen av oppgaven, hvor det står at 10.13.0.2/32 er i rangen til 10.12.0.0/22
Etter min forståelse av ranger så er ikke det korrekt, ettersom 10.12.0.0/22 stopper på 10.12.3.255.

test med et python script:

~~~py
from netaddr import IPNetwork

if IPNetwork("10.13.0.2/32") in IPNetwork("10.12.0.0/22"):
    print("overlapper")
else:
    print("overlapper ikke")
~~~

gir resultat: overlapper ikke.

Usikker på om dette er fordi jeg ikke forso oppgaveteksten, eller om det kan være en feil i oppgaven her...


## forbedringer

Jeg er ikke helt fornøyd med sikkerhet og testing av koden. Jeg startet ganske bra, med sjekking av alle verdier, men mot slutten så fikk jeg litt 
dårlig tid og måtte senke kravene litt til testing og slikt. Tiden rakk ikke helt til for å sette opp automatisk testing slik som i nodes.js
for graphWalk.js funksjonene. Jeg rakk heller ikke å teste det manuelt så nærme som jeg ville heller.

Stisøket har mange potensielle forbedringer på effektiviteten. Jeg tror ikke at det egentlig trengs to separate steg for å finne alle
målnodene for å så finne alle stiene.

Programmet tar heller ikke hensyn til at grafen er urettet, så den viser alle pathene to ganger, utifra hvilken node den kommer fra.

Jeg rakk heller ikke ta grafikken helt dit jeg hadde lyst til. Jeg hadde egentlig planer om å kunne hovre over noder, for å så se hvilke
alle de mulige stiene til de andre "" nodene.

Hvis jeg skulle gjort det igjen, så ville jeg nok ha skrevet det som et CLI program i python. 
