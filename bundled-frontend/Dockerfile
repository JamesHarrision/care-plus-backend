FROM "nginx:alpine"


EXPOSE 80
COPY ./ /usr/share/nginx/html

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
