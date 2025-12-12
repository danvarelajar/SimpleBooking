FROM node:22-alpine

WORKDIR /app

# No dependencies to install (no package-lock, no node_modules).
# We still copy package.json for metadata (type: module) and start script.
COPY --chown=node:node package.json /app/package.json
COPY --chown=node:node src /app/src
COPY --chown=node:node README.md /app/README.md
# Lab docs are useful in-repo but not required at runtime; avoid failing builds if excluded from build context.

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

USER node

CMD ["node", "src/server.js"]


