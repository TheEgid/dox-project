
include .env
export

LOCAL_DUMP_PATH=my_backup.zip


all: build test migrate stop run
#all: build run

build:
	@rm -f ./backend/.env
	@echo $(DB_NAME_PROD);
	@cat .env > ./backend/.env
	@docker-compose build

migrate:
	@docker exec -i backend_container yarn migration_prod

test:
	@echo $(DB_NAME_TEST);
	@docker-compose up -d
	@docker exec -i backend_container yarn test:e2e

run:
	@echo $(DB_NAME_PROD);
	#sudo docker-compose up
	@docker-compose up -d
	@docker ps

stop:
	@docker-compose down


backup:
	@docker exec -i full_db_postgres bash pg_dump --username $(DB_USER_PROD) $(DB_NAME_PROD) | gzip > $(LOCAL_DUMP_PATH);


#restore--
#psql -d database1 -f '/opt/my_backup.sql'

#cat $(LOCAL_DUMP_PATH) | docker exec -i $(DB_CONTAINER) pg_restore -U $(DB_USER) -d $(DB_NAME);

#logs:
#	sudo chmod 777 /opt;
#	sudo docker-compose logs | tee | grep -E 'GET|POST' | grep -E 'nginx' | sed 's/^.\{,15\}//' > /opt/nginx_logs.csv;
#	sleep 1;
#	@echo 'sep=^' | cat - /opt/nginx_logs.csv > /opt/temp && mv /opt/temp /opt/nginx_logs.csv


dockerclean:
	docker system prune -f
	docker system prune -f --volumes	

#sudo docker run --rm -it  dox-project_backend 