rs.initiate( {
    _id : "shard-1",
    members: [
       { _id: 0, host: "shard-1-primary:27017" },
       { _id: 1, host: "shard-1-secondary:27017" },
    ]
 })
