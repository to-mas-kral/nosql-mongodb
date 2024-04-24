//
// Priklad 1 - Příkazy na údržbu (diagnostika) databáze 
//

mongosh mongodb://localhost:27600,localhost:27601/

db.hostInfo()

db.serverStatus()

db.stats()

db.version()

db.serverBuildInfo()

db.serverCmdLineOpts()

//
// Priklad 2 - Vytvoření databázi, kolekcí, printování databází a kolekcí 
//

show dbs

use new_db

db.createCollection("new_collection")

show collections

db.getCollectionInfos()

db.createCollection("capped", {"capped": true, size: 1024, max: 16})

db.createCollection("users", {
  validator: {
     $jsonSchema: {
        bsonType: "object",
        title: "user Object Validation",
        required: [ "name", "year_born" ],
        properties: {
           name: {
              bsonType: "string",
              description: "'name' must be a string and is required"
           },
           year_born: {
              bsonType: "int",
              minimum: 1900,
              maximum: 2024,
              description: "'year_born' must be an integer in [ 1900, 2024 ] and is required"
           },
        }
     }
  }
} )


db.createCollection(
  "pressure",
  {
     timeseries: {
        timeField: "timestamp",
        metaField: "sensor_id",
        granularity: "minutes"
     },
     expireAfterSeconds: 86400
  }
)

//
// Priklad 3 - Insertování dat, printování obsahu dokumentů 
//

use yelp-academic

db.user.insertOne({
  "user_id": "...application_generated...",
  "name": "Adam",
  "review_count": 0,
  "yelping_since": "2024-04-13 11:53:41",
  "useful": 0,
  "funny": 0,
  "cool": 0,
  "elite": "",
  "friends": [],
  "fans": 0,
  "average_stars": 0,
  "compliment_hot": 0,
  "compliment_more": 0,
  "compliment_profile": 0,
  "compliment_cute": 0,
  "compliment_list": 0,
  "compliment_note": 0,
  "compliment_plain": 0,
  "compliment_cool": 0,
  "compliment_funny": 0,
  "compliment_writer": 0,
  "compliment_photos": 0
});

db.user.insertOne(
  {
    "name": "Adam",
  },
  {
    "w": 0,
  }
);

db.user.insertOne(
  {
    _id: 16,
    "name": "Peter",
  },
);

db.user.insertMany(
  [
    { name: "Karl" },
    { name: "Alice" },
    { name: "Jay"  }
  ],
  { "ordered": true }
);

db.user.countDocuments({})

db.user.findOne({})

//
// Priklad 4 - Mazání a updatování dat 
//

db.user.insertOne(
  {
    _id: 16,
    "name": "Peter",
  },
);

db.user.deleteOne(
  { _id: 16, "name": "Peter" },
  {
    "writeConcern": { "w": "majority" }
  }
)

db.user.deleteMany({ "review_count": 10 })

db.user.updateMany(
  { "name": "Celeste" },
  [
     { $set: { fans: {$add: ["$fans",  1]}} },
     { $project: {"elite": 0}}
  ]
)

db.user.updateOne(
  { _id: 16 },
  [
     { $set: { name: {$concat: ["$name",  " ", "Čech"]}} },
  ]
)

db.user.replaceOne(
  { _id: 16 },
  {
    "name": "REDACTED",
    "redacted_date": new Date(),
  }
)

//
// Priklad 5 - Indexy
//

db.business.createIndex( {review_count: 1} )

db.business.createIndex( {review_count: 1, stars: 1} )

db.business.createIndex( {categories: 1} )

db.business.createIndex( {name: "hashed"} )

db.review.createIndex( {text: "text"} )

db.business.createIndex({location: "2dsphere"});

db.review.createIndex(
  {date: 1},
  {expireAfterSeconds: 10, partialFilterExpression: {useful: {$gt: 20}}}
)

db.review.getIndexes()

db.review.totalIndexSize()

db.review.dropIndex("date_1")

//
// Priklad 6 - replikační sety
//

rs.printReplicationInfo()

rs.status()

rs.conf()

rs.remove('shard-0-secondary:27017')

rs.add('shard-0-secondary:27017')

rs.stepDown()

//
// Priklad 7 - shardování
//

sh.enableSharding("yelp-academic")

sh.shardCollection("yelp-academic.business", { "name" : "hashed" } )
sh.shardCollection("yelp-academic.user", { "_id" : "hashed" } )

sh.status()

sh.getShardedDataDistribution()

sh.reshardCollection("yelp-academic.user", { "review_count" : 1 } )
sh.reshardCollection("yelp-academic.user", { "_id" : "hashed" } )

//
// Priklad 11
//

use yelp-academic

db.business.find({city: 'Nashville'})

db.business.find({city: 'Nashville', stars: {$gt: 4.5}})

db.business.find({city: 'Nashville', stars: {$gt: 4.5}, categories: {$all: ["Restaurants", "Mexican"]}})

db.business.find({city: 'Nashville', stars: {$gt: 4.5}, categories: {$all: ["Restaurants", "Mexican"]}}).sort({review_count: -1}).limit(3)

db.business.aggregate(
    [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [-86.75, 36.125],
            },
            distanceField: "calculated",
            spherical: true,
            query: {
              city: "Nashville",
              stars: {
                $gt: 4.5,
              },
              categories: {
                $all: ["Restaurants", "Mexican"],
              },
            },
            maxDistance: 1000,
          },
        },
        {
          $sort: { review_count: -1,},
        },
        {
          $limit: 1,
        },
      ]
)

//
// Priklad 12
//

db.user.aggregate(
    [
        {
          $match: {
            review_count: {
              $gt: 10,
            },
          },
        },
        {
          $lookup: {
            from: "review",
            localField: "user_id",
            foreignField: "user_id",
            as: "reviews",
          },
        },
        {
          $match: {
            "reviews.0": {
              $exists: true,
            },
          },
        },
        {
          $lookup: {
            from: "business",
            localField: "reviews.business_id",
            foreignField: "business_id",
            as: "businesses",
          },
        },
        {
          $unwind: {
            path: "$businesses",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $sortByCount: "$businesses.city",
        },
        {
          $limit: 5,
        },
        {
          $sample: {
            size: 1,
          },
        },
    ]
)
