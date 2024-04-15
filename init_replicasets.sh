docker-compose exec config-server-primary mongosh --file /scripts/init-repl-config-servers.js
docker-compose exec shard-0-primary mongosh --file /scripts/init-repl-shard-0.js
docker-compose exec shard-1-primary mongosh --file /scripts/init-repl-shard-1.js
