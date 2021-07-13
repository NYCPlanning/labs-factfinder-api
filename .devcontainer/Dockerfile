# [Choice] Node.js version: 16, 14, 12
ARG VARIANT="10.21.0"
FROM node:${VARIANT}-stretch-slim

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client-common git

RUN adduser --disabled-password --gecos '' vscode

USER vscode