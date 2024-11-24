-- create tables for normalized logs

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
    timestamp       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
