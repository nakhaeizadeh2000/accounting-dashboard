#!/bin/sh

docker exec api php artisan migrate:fresh --seed --seeder=TestDatabaseSeeder
