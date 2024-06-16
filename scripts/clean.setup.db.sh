#!/bin/bash

npm run prisma:generate && \
  npm run prisma:push && \
  npm run prisma:seed
