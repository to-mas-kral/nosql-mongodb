echo Starting docker-compose
docker-compose up -d

echo Waiting for the config servers and shard servers to initialize
sleep 5s # delay chosen empirically...

echo Initializing replica sets
./init_replicasets.sh

echo Waiting for the mongos instance to initialize
sleep 20s # delay chosen empirically...

echo Configuring mongos
./init_mongos.sh

echo Configuring sharding
./configure_sharding.sh

echo Uploading data
./load_data.sh
