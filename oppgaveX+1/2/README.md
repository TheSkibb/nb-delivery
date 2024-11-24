# (oppgaveX+1)^2

I filen create_table.sql har jeg laget en create table spørring for de normaliserte loggene.

~~~sql
CREATE TABLE file (
    Id serial PRIMARY KEY,
    fileName varchar(4096)
);

create table protocol (
    Id serial primary key,
    name varchar(255)
);

create table ipAddress (
    Id serial primary key,
    address varchar(12)
);

create table log (
    Id              serial primary key,
    timestamp       TIMESTAMP NOT NULL,
    src_ipId          int,
    CONSTRAINT fk_src_ip
            FOREIGN KEY(src_ipId) 
            REFERENCES ipAddress(id) 
            ON DELETE SET NULL
            ON UPDATE CASCADE,
	dst_ipID          int,
    CONSTRAINT fk_dst_ip
            FOREIGN KEY(dst_ipID)
            REFERENCES file(id) 
            ON DELETE SET NULL
            ON UPDATE CASCADE,
	src_port        int,
	dst_port        int,
    sourceFileId      int,
    CONSTRAINT fk_sourceFile
            FOREIGN KEY(sourceFileId) 
            REFERENCES file(id) 
            ON DELETE SET NULL
            ON UPDATE CASCADE,
    protocolId    int,
    CONSTRAINT fk_protocol
            FOREIGN KEY(protocolId) 
            REFERENCES protocol(id) 
            ON DELETE SET NULL
            ON UPDATE CASCADE
);
~~~

Tanken her var at for å spare plass, så kan man separere ut det som er likt på tvers av radene ut i separate tabeller.
For eksempel IP-addresser og filnavn vil repeteres mange ganger i logg-tabellen. Ved å putte dem i sin egen tabell sparer vi mye plass,
fordi man slipper å lagre samme strengen mange ganger. I stedet kan man lagre en fremmednøkkel som tar mye mindre plass.

Å søke etter en fremmednøkker er også raskere enn å søke etter en streng.
