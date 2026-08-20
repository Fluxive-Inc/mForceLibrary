# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache git build-base
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled Angular site
COPY --from=builder /app/dist/library-app/browser /usr/share/nginx/html

# Expose port 8080 (standard for Cloud Run)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
