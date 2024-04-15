rs.initiate( {
    _id : "config-servers",
    configsvr: true,
    members: [
       { _id: 0, host: "config-server-primary:27017" },
       { _id: 1, host: "config-server-secondary:27017" },
    ]
 })
