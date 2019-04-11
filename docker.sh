#!/bin/bash

DOCKER_NAME='smartcourse-testing'

docker kill $DOCKER_NAME
docker rm $DOCKER_NAME

# bail out if any errors
set -ex

# start the container using compose config
SA_PASSWORD="$LOCAL_SQL_PASSWORD" docker-compose up -d

# initdb
docker exec -it $DOCKER_NAME sqlcmd \
   -S localhost,1433 \
   -U SA \
   -P "$LOCAL_SQL_PASSWORD" \
   -Q 'CREATE DATABASE testdb'
