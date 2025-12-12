FROM node:22-alpine

WORKDIR /app

# No dependencies to install (no package-lock, no node_modules).
# We still copy package.json for metadata (type: module) and start script.
COPY --chown=node:node package.json /app/package.json
COPY --chown=node:node src /app/src
COPY --chown=node:node README.md /app/README.md
COPY --chown=node:node LAB_EXERCISES.md /app/LAB_EXERCISES.md

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

USER node

CMD ["node", "src/server.js"]


