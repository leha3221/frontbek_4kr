FROM node:18-alpine

WORKDIR /app

# Сначала копируем только манифест зависимостей — кэширование слоя
COPY package*.json ./
RUN npm install

# Копируем остальной код
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
