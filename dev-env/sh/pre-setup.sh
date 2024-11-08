#!/bin/bash
# sudo chown -R kartal:kartal api/database
 docker compose down -v
 rm -rf client/.next client/node-modules api/dist api/node-modules