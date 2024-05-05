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

db.getSiblingDB("admin").grantRolesToUser("totalAdmin", ["clusterAdmin", "userAdminAnyDatabase"])

db.getSiblingDB("admin").createRole(
{
    role: "admin_new_db",
    privileges: [
      { resource: { db: "new_db", collection: "" }, actions: [ "find", "update", "insert", "remove" ] },
    ],
    roles: [
      { role: "readWrite", db: "new_db" }
    ]
  }
);

db.getSiblingDB("admin").grantRolesToUser("totalAdmin", ["admin_new_db"])

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
