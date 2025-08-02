docker run -d --name clickhouse-server -p 8123:8123 -p 9000:9000 -e CLICKHOUSE_HTTP_DEFAULT_HOST='0.0.0.0' -e CLICKHOUSE_PASSWORD='123456' clickhouse/clickhouse-server

docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=123456 --name pgsql postgres
