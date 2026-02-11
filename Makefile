up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up --build -d

rebuild:
	docker compose build --no-cache
	docker compose up -d

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-back:
	docker compose logs -f backend

logs-front:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

shell-back:
	docker compose exec backend sh

shell-front:
	docker compose exec frontend sh

shell-db:
	docker compose exec postgres psql -U postgres -d medbook_dev

prune:
	docker system prune -af

.PHONY: up down build rebuild restart prod-up prod-down prod-build prod-rebuild prod-logs logs logs-back logs-front logs-db shell-back shell-front shell-db clean prune