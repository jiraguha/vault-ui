Procfile.PHONY: pack-run pack-push

# Local development commands
d-run:
	docker build -t vault-ui . && \
	docker run --rm \
	  -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
	  -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
      -e AWS_DEFAULT_REGION=eu-west-3 \
      -p 5500:5500 vault-ui


p-run:
	podman build -t vault-ui . && \
	podman run --rm \
	  -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
	  -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
      -e AWS_DEFAULT_REGION=eu-west-3 \
      -p 5500:5500 vault-ui


d-push:
	$(eval VERSION := $(if $(version),$(version),latest))
		docker build -t vault-ui . && \
		docker tag vault-ui:latest jpiraguha/vault-ui:$(VERSION) && \
		docker push jpiraguha/vault-ui:$(VERSION)

d-push:
	$(eval VERSION := $(if $(version),$(version),latest))
	    npm install && npm run build && \
		docker build -t vault-ui . && \
		docker tag vault-ui:latest jpiraguha/vault-ui:$(VERSION) && \
		docker push jpiraguha/vault-ui:$(VERSION)