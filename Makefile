build-push:
	docker buildx build --platform linux/amd64,linux/arm64 -t zpaceway/fileship-webapp:latest --push .

run:
	npm run dev
