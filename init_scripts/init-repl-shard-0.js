rs.initiate( {
    _id : "shard-0",
    members: [
       { _id: 0, host: "shard-0-primary:27017" },
       { _id: 1, host: "shard-0-secondary:27017" },
    ]
 })
