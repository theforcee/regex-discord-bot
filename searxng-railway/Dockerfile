FROM docker.io/searxng/searxng:latest

ENV TZ=Asia/Ho_Chi_Minh
ENV GRANIAN_HOST=0.0.0.0
ENV GRANIAN_PORT=8080
ENV SEARXNG_SETTINGS_PATH=/etc/searxng/settings.yml

COPY settings.yml /etc/searxng/settings.yml

EXPOSE 8080
