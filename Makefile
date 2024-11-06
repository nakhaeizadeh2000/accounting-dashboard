# dev command 
build-dev:
	# make pre-setup
	docker compose -f docker-compose.dev.yml build --parallel
build-dev-no-cache:
	make pre-setup
	docker compose -f docker-compose.dev.yml build --parallel --no-cache
build-dev-api:
	docker compose -f docker-compose.dev.yml build api
build-dev-client:
	docker compose -f docker-compose.dev.yml build client
build-daemon-dev:
	docker compose -f docker-compose.dev.yml up -d --build
dev:
	docker compose -f docker-compose.dev.yml up
dev-daemon:
	docker compose -f docker-compose.dev.yml up -d
api-dev:
	docker exec -it api npm run start:dev --host 0.0.0.0 --port 4000
client-dev:
	docker exec -it client npm run dev


# prod command 
build-prod:
	# make pre-setup
	docker compose -f docker-compose.prod.yml build --parallel
build-prod-no-cache:
	make pre-setup
	docker compose -f docker-compose.prod.yml build --parallel --no-cache
build-prod-api:
	docker compose -f docker-compose.prod.yml build api
build-prod-client:
	docker compose -f docker-compose.prod.yml build client
build-daemon-prod:
	docker compose -f docker-compose.prod.yml up -d --build
prod:
	docker compose -f docker-compose.prod.yml up
prod-daemon:
	docker compose -f docker-compose.prod.yml up -d


# stop & down command 
down:
	docker compose down
down-volume:
	docker compose down -v
stop:
	docker compose stop

# api related
api-setup:
	make api-install && \
	make api-migrate-refresh
api-install:
	docker exec -it api npm install
api-debug:
	docker exec -it api npm run start:debug --host 0.0.0.0 --port 4000
api-ssh:
	docker exec -it api /bin/bash
api-restart:
	docker compose restart api --no-deps
api-migrate-refresh:
	docker exec -it api npm run migration:run && \
	make api-seed 
api-seed: 
	docker exec -it api npm run seed:run


# client related
client-analyze:
	cd ./client && npm run analyze
client-ssh:
	docker exec -it client /bin/bash


# bash command & etc..
pre-setup:
	dev-env/sh/pre-setup.sh
setup:
	make build
	make dev-daemon
	make post-setup
post-setup:
	dev-env/sh/setup.sh
  


# test related
test-cypress:
	docker compose -f docker-compose.test.yml -p tese-cypress up