tableFile=create_table.sql

docker cp ./dump.sql postgres:/docker-entrypoint-initdb.d/dump.sql
#docker exec -u postgres pg_test psql postgres postgres -f docker-entrypoint-initdb.d/dump.sql
