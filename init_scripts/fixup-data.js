db.getSiblingDB("yelp-academic").auth("dataAdmin", "password")

db = db.getSiblingDB("yelp-academic")

db.user.updateMany(
    {},
    [
      {
        "$set": {
          "friends": {
            $filter: {
              input: {
                $split: [
                  "$friends",
                  ", "
                ]
              },
              cond: {
                $gt: [
                  {
                    $strLenCP: "$$this"
                  },
                  0
                ]
              }
            }
          }
        }
      }
    ]
);

db.business.updateMany(
  {},
  [
    {
      "$set": {
        "categories": {
          $filter: {
            input: {
              $split: [
                "$categories",
                ", "
              ]
            },
            cond: {
              $gt: [
                {
                  $strLenCP: "$$this"
                },
                0
              ]
            }
          }
        }
      }
    }
  ]
);

db.business.updateMany(
  {},
[
  {
    $addFields:
      {
        location: {
          type: "Point",
          coordinates: [
            "$longitude",
            "$latitude",
          ],
        },
      },
  },
]);

db.business.createIndex({location: "2dsphere"});

// need to to this BEFORE enabling sharding on the date
db.review.updateMany(
  { date: { $ne: "",} },
  [
    {
      $set:{
          date: {
            $toDate: "$date",
          },
        },
    },
  ]
)

db.review.createIndex({date: "hashed"})

db.getSiblingDB("admin").auth("totalAdmin", "password")

sh.shardCollection("yelp-academic.review", { "date" : "hashed" } )
