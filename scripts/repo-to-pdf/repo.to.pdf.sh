#!/bin/bash

npx repo-to-pdf ../../components/ && \
    npx repo-to-pdf ../../cf-worker/src/ && \
    npx repo-to-pdf ../../hooks/ && \
    npx repo-to-pdf ../../lib/ && \
    npx repo-to-pdf ../../pages/ && \
    npx repo-to-pdf ../../prisma/ && \
    npx repo-to-pdf ../../public/ && \
    npx repo-to-pdf ../../styles/ && \
    npx repo-to-pdf ../../types/ && \
    npx repo-to-pdf ../../utils/

# remove all the html files
rm -rf ./*.html

# move all the pdf files to the output folder
rm -rf output && mkdir -p output && mv ./*.pdf output/
