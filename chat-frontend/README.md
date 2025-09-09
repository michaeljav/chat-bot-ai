# Run locally (optional)

`npm run dev`

# Build image

`docker build -t chat-frontend .`

# Create container

```
docker run -d --name chat-frontend \
 -p 5173:80 \
 -e API_ORIGIN=http://host.docker.internal:3000 \
 chat-frontend
```
