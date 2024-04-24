db.getSiblingDB("admin").auth("totalAdmin", "password")

sh.enableSharding("yelp-academic")
sh.shardCollection("yelp-academic.business", { "name" : "hashed" } )
sh.shardCollection("yelp-academic.user", { "_id" : "hashed" } )
