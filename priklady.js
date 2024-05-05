//
// Priklad 1 - Příkazy na údržbu (diagnostika) databáze 
//

mongosh mongodb://localhost:27600,localhost:27601/

use admin
db.auth("totalAdmin", "password")

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

db.auth("tom", "password")

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

db.auth("dataAdmin", "password")

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

// je potřeba se připojit přímo na replikační set...
// mongosh localhost:27800

use admin
db.auth("localAdmin", "password")

rs.printReplicationInfo()

rs.status()

rs.conf()

rs.remove('shard-0-secondary:27017')

rs.add('shard-0-secondary:27017')

rs.stepDown()

//
// Priklad 7 - shardování
//

use admin
db.auth("totalAdmin", "password")

sh.enableSharding("yelp-academic")

sh.shardCollection("yelp-academic.business", { "name" : "hashed" } )
sh.shardCollection("yelp-academic.user", { "_id" : "hashed" } )

sh.status()

sh.getShardedDataDistribution()

sh.reshardCollection("yelp-academic.user", { "review_count" : 1 } )
sh.reshardCollection("yelp-academic.user", { "_id" : "hashed" } )

//
// Priklad 8 - Práce s uživateli
//

db.getSiblingDB("admin").createUser(
  {
    user: "totalAdmin2",
    pwd:  "password",
    roles: [
      { role: "dbOwner", db: "admin" },
    ]
  }
);

db.getSiblingDB("admin").auth("totalAdmin2", "password");

db.getSiblingDB("admin").grantRolesToUser("totalAdmin2", ["clusterManager", "userAdminAnyDatabase"])

db.getSiblingDB("yelp-academic").createRole(
{
    role: "dataScientist2",
    privileges: [
      { resource: { db: "yelp-academic", collection: "" }, actions: [ "find", "update", "insert", "remove" ] },
    ],
    roles: [
      { role: "read", db: "yelp-academic" }
    ]
  }
);

db.getSiblingDB("yelp-academic").createUser(
  {
    user: "tom2",
    pwd:  "password",
    roles: [ { role: "dataScientist2", db: "yelp-academic" } ]
  }
);

db.getSiblingDB("yelp-academic").getUser("tom2")

db.getSiblingDB("yelp-academic").revokeRolesFromUser( "tom2", [ "dataScientist" ])

//
// Priklad 9
//

use yelp-academic
db.auth("tom", "password")

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

db.business.find({ "attributes.WiFi": { $exists: true }})

db.business.find({"categories": { $size: 1 }})

//
// Priklad 10
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

db.review.aggregate(
  [
    {
      $project: {
        day: {
          $dayOfWeek: "$date",
        },
      },
    },
    {
      $project: {
        day: {
          $arrayElemAt: [
            [
              "",
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            "$day",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$day",
        count: {
          $count: {},
        },
      },
    },
  ]
)

db.business.aggregate(
  [
    {
      $unwind: "$categories",
    },
    {
      $group: {
        _id: "$categories",
        averageRating: {
          $avg: "$stars",
        },
      },
    },
    {
      $sort: {
        averageRating: 1,
      },
    },
    {
      $limit: 10
    }
  ]
)

db.business.aggregate(
  [
    {
      $facet: {
        tokio: [
          {
            $match: {
              name: "Little Tokyo Small Plates & Noodle Bar",
              city: "New Orleans",
            },
          },
        ],
        good_bars: [
          {
            $match: {
              city: "New Orleans",
              categories: {
                $all: ["Bars"],
              },
              stars: {
                $gte: 4,
              },
            },
          },
        ],
      },
    },
    {
      $set: {
        tokio: {
          $arrayElemAt: ["$tokio", 0],
        },
      },
    },
    {
      $set: {
        "tokio.good_bars": "$good_bars",
      },
    },
    {
      $unset: "good_bars",
    },
    {
      $unwind: {
        path: "$tokio.good_bars",
      },
    },
    {
      $set: {
        diff_attrs: {
          $setDifference: [
            "$tokio.good_bars.categories",
            "$tokio.categories",
          ],
        },
      },
    },
    {
      $unset: "tokio",
    },
    {
      $unwind: {
        path: "$diff_attrs",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $group: {
        _id: "$diff_attrs",
        count: {
          $count: {},
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]
)

db.user.aggregate(
  [
    {
      $group: {
        _id: null,
        min: { $min: "$review_count", },
        max: { $max: "$review_count", },
        median: {
          $median: {
            input: "$review_count",
            method: "approximate",
          },
        },
        percentile: {
          $percentile: {
            input: "$review_count",
            p: [0.25, 0.5, 0.75],
            method: "approximate",
          },
        },
      },
    },
    {
      $set: {
        percentile_25: {$arrayElemAt: ["$percentile", 0],},
        percentile_50: {$arrayElemAt: ["$percentile", 1],},
        percentile_75: {$arrayElemAt: ["$percentile", 2],},
      },
    },
    {
      $set: {
        iqr: {
          $subtract: ["$percentile_75", "$percentile_25",],
        },
      },
    },
    {
      $unset: ["percentile", "_id"],
    },
  ]
)
