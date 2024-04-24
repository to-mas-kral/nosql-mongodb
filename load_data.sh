docker-compose exec mongos-0 mongoimport --username tom --password password --authenticationDatabase yelp-academic --jsonArray -d yelp-academic -c business mongodb://localhost:27017/ data/business.json
docker-compose exec mongos-0 mongoimport --username tom --password password --authenticationDatabase yelp-academic --jsonArray -d yelp-academic -c user mongodb://localhost:27017/ data/user.json
docker-compose exec mongos-0 mongoimport --username tom --password password --authenticationDatabase yelp-academic --jsonArray -d yelp-academic -c review mongodb://localhost:27017/ data/review.json

docker-compose exec mongos-0 mongosh --file /scripts/fixup-data.js
