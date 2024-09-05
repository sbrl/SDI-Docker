FROM alpine

COPY index.mjs /srv/index.mjs
COPY package.json /srv/package.json
COPY package-lock.json /srv/package.json

RUN apk add nodejs-current npm && \
	cd /srv && npm install


# USER 10000:10000
ENTRYPOINT [ "/usr/bin/env", "node", "/srv/index.mjs" ]

# EXPOSE doesn't actually expose the port, ref https://docs.docker.com/reference/dockerfile/#expose
EXPOSE 3000/tcp