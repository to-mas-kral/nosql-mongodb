db.getSiblingDB("admin").auth("totalAdmin", "password")

sh.addShard("shard-0/shard-0-primary:27017")
sh.addShard("shard-0/shard-0-secondary:27017")
sh.addShard("shard-1/shard-1-primary:27017")
sh.addShard("shard-1/shard-1-secondary:27017")
