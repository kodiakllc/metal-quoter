#!/bin/bash

npm run prisma:format && \
  npm run prisma:generate && \
  npm run prisma:push && \
  npm run prisma:seed
