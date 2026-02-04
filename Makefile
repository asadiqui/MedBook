up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up --build -d

# Force rebuild without cache
rebuild:
	docker compose build --no-cache
	docker compose up -d

restart:
	docker compose restart

# View logs
logs:
	docker compose logs -f

logs-back:
	docker compose logs -f backend

logs-front:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

# Shell access
shell-back:
	docker compose exec backend sh

shell-front:
	docker compose exec frontend sh

shell-db:
	docker compose exec postgres psql -U postgres -d medbook_dev

clean:
	docker compose down -v

prune:
	docker system prune -af

.PHONY: up down build rebuild logs logs-back logs-front logs-db shell-back shell-front shell-db clean prune restart