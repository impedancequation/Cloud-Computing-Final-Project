FROM node:18-alpine
WORKDIR /app
# Menyalin package.json yang ada di folder yang sama dengan Dockerfile
COPY package.json ./
RUN npm install
COPY . .
# Ganti EXPOSE sesuai port service (5000 atau 5001)
EXPOSE 5000
CMD ["node", "index.js"]