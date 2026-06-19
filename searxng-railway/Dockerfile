FROM docker.io/searxng/searxng:latest

ENV TZ=Asia/Ho_Chi_Minh
ENV GRANIAN_HOST=0.0.0.0
ENV GRANIAN_PORT=8080
ENV SEARXNG_SETTINGS_PATH=/etc/searxng/settings.yml

COPY settings.template.yml /etc/searxng/settings.template.yml
COPY entrypoint.sh /usr/local/bin/searxng-railway-entrypoint
RUN chmod +x /usr/local/bin/searxng-railway-entrypoint

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/searxng-railway-entrypoint"]
