rs.initiate( {
    _id : "shard-0",
    members: [
       { _id: 0, host: "shard-0-primary:27017" },
       //{ _id: 1, host: "shard-0-secondary:27017" },
    ]
 })

sleep(10000)

admin = db.getSiblingDB("admin")
admin.createUser(
  {
    user: "localAdmin",
    pwd: "password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

admin.auth("localAdmin", "password")

admin.grantRolesToUser("localAdmin", ["clusterAdmin"])

rs.add('shard-0-secondary:27017')
