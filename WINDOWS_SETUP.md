# 🪟 Guia de Instalação para Windows

## Pré-requisitos

### 1. Instalar Node.js
1. Baixe o Node.js 18+ em: https://nodejs.org/
2. Execute o instalador
3. Verifique a instalação:
   \`\`\`powershell
   node --version
   npm --version
   \`\`\`

### 2. Instalar PostgreSQL
1. Baixe o PostgreSQL em: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Durante a instalação:
   - Anote a senha do usuário postgres
   - Porta padrão: 5432
4. Verifique se está rodando:
   - Abra "Services" (Win + R → services.msc)
   - Procure por "postgresql" - deve estar "Running"

### 3. (Opcional) Instalar Git
- Baixe em: https://git-scm.com/download/win

---

## 🚀 Instalação Rápida

### Opção 1: Script PowerShell (Recomendado)

1. Abra o PowerShell como Administrador:
   - Clique com botão direito no menu Iniciar
   - Selecione "Windows PowerShell (Admin)"

2. Navegue até a pasta do projeto:
   \`\`\`powershell
   cd "C:\\Users\\lucas\\Desktop\\Painel Surebets"
   \`\`\`

3. Execute o script:
   \`\`\`powershell
   .\\scripts.ps1
   \`\`\`

4. Escolha a opção "1 - Setup completo"

### Opção 2: Manual

1. Abra o PowerShell na pasta do projeto

2. Copie o arquivo de configuração:
   \`\`\`powershell
   Copy-Item .env.example .env
   \`\`\`

3. Edite o .env:
   \`\`\`powershell
   notepad .env
   \`\`\`

4. Configure o DATABASE_URL:
   \`\`\`
   DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/surebet_db"
   \`\`\`

5. Instale as dependências:
   \`\`\`powershell
   npm install
   \`\`\`

6. Configure o banco:
   \`\`\`powershell
   npx prisma generate
   npx prisma db push
   npm run seed
   \`\`\`

7. Inicie o servidor:
   \`\`\`powershell
   npm run server
   \`\`\`

---

## 🐛 Problemas Comuns no Windows

### Erro: "Execution of scripts is disabled"
**Solução:**
\`\`\`powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

### Erro: "ENOENT: no such file or directory"
**Solução:**
- Use aspas duplas nos caminhos
- Use barras duplas: \`C:\\\\Users\\\\\`

### PostgreSQL não inicia
**Solução:**
1. Abra Services (Win + R → services.msc)
2. Procure "postgresql-x64-15"
3. Clique com botão direito → "Start"

### Porta 3000 já em uso
**Solução:**
\`\`\`powershell
# Encontrar processo na porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Ou mude a porta no .env
# PORT=3001
\`\`\`

### Erro de conexão com banco
**Solução:**
1. Verifique se PostgreSQL está rodando
2. Teste a conexão:
   \`\`\`powershell
   psql -U postgres -h localhost
   \`\`\`
3. Crie o banco manualmente:
   \`\`\`sql
   CREATE DATABASE surebet_db;
   \`\`\`

### Erro ao instalar dependências
**Solução:**
\`\`\`powershell
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
Remove-Item -Recurse -Force node_modules
npm install
\`\`\`

---

## 📊 Criar Banco de Dados Manualmente

Se precisar criar o banco manualmente:

1. Abra o pgAdmin ou psql
2. Conecte ao PostgreSQL
3. Execute:
   \`\`\`sql
   CREATE DATABASE surebet_db;
   \`\`\`

---

## 🔧 Comandos Úteis do PowerShell

### Navegação
\`\`\`powershell
cd "C:\\Users\\lucas\\Desktop\\Painel Surebets"   # Ir para pasta
dir                                                 # Listar arquivos
Get-Location                                        # Pasta atual
\`\`\`

### Node.js
\`\`\`powershell
node --version                    # Versão do Node
npm --version                     # Versão do npm
npm list                          # Pacotes instalados
npm run                           # Ver scripts disponíveis
\`\`\`

### Processos
\`\`\`powershell
Get-Process -Name node            # Ver processos Node
Stop-Process -Name node -Force    # Parar todos Node.js
netstat -ano                      # Ver portas em uso
\`\`\`

### Arquivos
\`\`\`powershell
Get-Content .env                  # Ver conteúdo do .env
notepad .env                      # Editar .env
Remove-Item -Recurse node_modules # Deletar pasta
\`\`\`

---

## 🚀 Iniciar o Servidor

### Desenvolvimento (sem WebSocket completo)
\`\`\`powershell
npm run dev
\`\`\`

### Produção (com WebSocket - RECOMENDADO)
\`\`\`powershell
npm run server
\`\`\`

### Como serviço permanente (PM2)
\`\`\`powershell
npm install -g pm2
pm2 start server.js --name surebet
pm2 list
pm2 logs surebet
pm2 stop surebet
\`\`\`

---

## 🌐 Acessar o Sistema

Após iniciar o servidor, abra no navegador:
- **URL**: http://localhost:3000
- **Admin**: admin@surebet.com / Admin@123

---

## 📝 Variáveis de Ambiente (.env)

Exemplo completo:
\`\`\`env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/surebet_db"
JWT_SECRET="chave-super-secreta-aqui"
API_SECRET="chave-api-para-enviar-sinais"
ADMIN_EMAIL="admin@surebet.com"
ADMIN_PASSWORD="Admin@123"
NODE_ENV="development"
PORT="3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

---

## 🔐 Gerar Chaves Seguras

### No PowerShell:
\`\`\`powershell
# Gerar JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Gerar API_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
\`\`\`

### Ou use o script:
\`\`\`powershell
.\\scripts.ps1
# Escolha opção 8
\`\`\`

---

## 📱 Testando o Sistema

1. **Registrar usuário**:
   - Acesse http://localhost:3000/register
   - Crie uma conta (ganha 5 dias de trial)

2. **Enviar sinal de teste**:
   \`\`\`powershell
   curl -X POST http://localhost:3000/api/signals/create ^
     -H "x-api-secret: sua-chave-api-secreta" ^
     -H "Content-Type: application/json" ^
     -d "{\"sport\":\"Futebol\",\"event\":\"Teste\",\"market\":\"1x2\",\"roi\":5.5,\"odds\":[{\"selection\":\"Casa\",\"value\":\"2.10\"}],\"bookmakers\":[{\"name\":\"Bet365\",\"url\":\"https://bet365.com\"}]}"
   \`\`\`

3. **Ver no dashboard**:
   - O sinal deve aparecer automaticamente

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se PostgreSQL está rodando
2. Verifique se o .env está configurado corretamente
3. Veja os logs no terminal onde iniciou o servidor
4. Execute: \`npm run server\` para ver erros detalhados

---

## 📚 Documentação Adicional

- [README.md](README.md) - Documentação completa
- [QUICKSTART.md](QUICKSTART.md) - Guia rápido
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Status do projeto
