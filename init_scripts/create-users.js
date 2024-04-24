db.getSiblingDB("admin").createUser(
  {
    user: "totalAdmin",
    pwd:  "password",
    roles: [
      { role: "dbOwner", db: "admin" },
    ]
  }
);

db.getSiblingDB("admin").auth("totalAdmin", "password");

db.getSiblingDB("admin").grantRolesToUser("totalAdmin", ["clusterManager", "userAdminAnyDatabase"])

db.getSiblingDB("yelp-academic").createRole(
{
    role: "dataScientist",
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
    user: "tom",
    pwd:  "password",
    roles: [ { role: "dataScientist", db: "yelp-academic" } ]
  }
);

db.getSiblingDB("yelp-academic").createUser(
  {
    user: "dataAdmin",
    pwd:  "password",
    roles: [ { role: "dbOwner", db: "yelp-academic" } ]
  }
);
