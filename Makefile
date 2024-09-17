build:
	# make pre-setup
	docker compose build --parallel
build-no-cache:
	make pre-setup
	docker compose build --parallel --no-cache
build-api:
	docker compose build api
build-client:
	docker compose build client
build-daemon:
	docker compose up -d --build
dev:
	docker compose up
dev-daemon:
	docker compose up -d
down:
	docker compose down
api-setup:
	make api-install && \
	make api-migrate-refresh
api-install:
	docker exec -it api npm install
api-debug:
	docker exec -it api npm run start:debug --host 0.0.0.0 --port 4000
api-dev:
	docker exec -it api npm run start:dev --host 0.0.0.0 --port 4000
api-ssh:
	docker exec -it api /bin/bash
api-restart:
	docker compose restart api --no-deps
client-dev:
	docker exec -it client npm run dev
client-analyze:
	cd ./client && npm run analyze
client-ssh:
	docker exec -it client /bin/bash
# migrate:
# 	docker exec -it api php artisan migrate
# api-migrate:
# 	docker exec -it api php artisan migrate
api-migrate-refresh:
	docker exec -it api npm run migration:run && \
	make api-seed
api-seed: 
	docker exec -it api npm run seed:run
pre-setup:
	dev-env/sh/pre-setup.sh
setup:
	make build
	make dev-daemon
	make post-setup
post-setup:
	dev-env/sh/setup.sh
# build-deploy-api:
# 	docker build -f ./php.deploy.dockerfile -t isatis:1.0.0 .
# run-deploy-api:
# 	docker run --name php-deploy -p 8000:8000 isatis:1.0.0
# test-api:
# 	docker exec docker-swoole-php /usr/src/api/vendor/bin/phpunit \
# 	--configuration /usr/src/api/phpunit.xml \
# 	--colors=auto
test-cypress:
	docker compose -f docker-compose.test.yml -p tese-cypress up