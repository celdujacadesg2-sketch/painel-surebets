# Deploy Painel Surebets na VPS Hostinger (Ubuntu 22.04)

## 1. Pré-requisitos
- VPS Ubuntu 22.04 com acesso root
- Docker e Docker Compose instalados
- Domínio configurado para o IP da VPS
- (Opcional) Firewall liberando portas 80, 443, 3002

## 2. Clonar o repositório
```sh
git clone <repo_url>
cd Painel\ Surebets
```

## 3. Configurar variáveis de ambiente
- Copie `.env.production.example` para `.env.production` e preencha.
- Copie `.env.bot.production.example` para `.env.bot.production` e preencha.

## 4. Build e subir containers
```sh
docker compose -f docker-compose.prod.yml up -d --build
```

## 5. Rodar migrações manualmente (se necessário)
```sh
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma generate
```

## 6. Testar health-check
- No servidor:
  ```sh
  curl http://localhost:3002/api/health
  ```
- Externo (após nginx/ssl):
  ```sh
  curl https://<seu_dominio>/api/health
  ```

## 7. Atualizar código
```sh
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 8. Logs e manutenção
```sh
docker compose logs -f app
docker compose logs -f bot
docker compose restart app
docker compose restart bot
```

## 9. Nginx + SSL (recomendado)
- Instale nginx:
  ```sh
  sudo apt update && sudo apt install nginx
  ```
- Exemplo de configuração:
  ```
  server {
    listen 80;
    server_name <seu_dominio>;

    location / {
      proxy_pass http://localhost:3002;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
  ```
- (Opcional) Instale SSL com certbot:
  ```sh
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d <seu_dominio>
  ```

---
