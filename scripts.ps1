# ============================================
# Scripts PowerShell - Surebet SaaS
# ============================================

Write-Host "🚀 Surebet SaaS - Scripts Utilitários" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Menu principal
Write-Host "Escolha uma opção:" -ForegroundColor Yellow
Write-Host "1. Setup completo (primeira instalação)"
Write-Host "2. Iniciar servidor (desenvolvimento)"
Write-Host "3. Iniciar servidor com WebSocket (recomendado)"
Write-Host "4. Resetar banco de dados"
Write-Host "5. Criar usuário admin"
Write-Host "6. Abrir Prisma Studio"
Write-Host "7. Build para produção"
Write-Host "8. Gerar nova API_SECRET"
Write-Host "9. Sair"
Write-Host ""

$option = Read-Host "Digite o número da opção"

switch ($option) {
    "1" {
        Write-Host "🔧 Executando setup completo..." -ForegroundColor Green
        
        # Verificar Node.js
        if (-not (Test-Command node)) {
            Write-Host "❌ Node.js não encontrado! Por favor, instale Node.js primeiro." -ForegroundColor Red
            exit 1
        }
        
        # Verificar PostgreSQL
        Write-Host "⚠️  Certifique-se de que o PostgreSQL está rodando!" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        # Criar .env se não existir
        if (-not (Test-Path ".env")) {
            Write-Host "📋 Criando arquivo .env..." -ForegroundColor Cyan
            Copy-Item ".env.example" ".env"
            Write-Host "✅ Arquivo .env criado. Configure suas variáveis!" -ForegroundColor Green
            notepad .env
        }
        
        # Instalar dependências
        Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
        npm install
        
        # Prisma
        Write-Host "🔧 Gerando Prisma Client..." -ForegroundColor Cyan
        npx prisma generate
        
        Write-Host "📊 Aplicando schema ao banco..." -ForegroundColor Cyan
        npx prisma db push
        
        # Seed
        Write-Host "👤 Criando usuário admin..." -ForegroundColor Cyan
        npm run seed
        
        Write-Host ""
        Write-Host "✅ Setup concluído com sucesso!" -ForegroundColor Green
        Write-Host "🚀 Execute: npm run server" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
        npm run dev
    }
    
    "3" {
        Write-Host "🚀 Iniciando servidor com WebSocket..." -ForegroundColor Green
        npm run server
    }
    
    "4" {
        Write-Host "⚠️  ATENÇÃO: Isso irá APAGAR todos os dados!" -ForegroundColor Red
        $confirm = Read-Host "Digite 'SIM' para confirmar"
        
        if ($confirm -eq "SIM") {
            Write-Host "🗑️  Resetando banco de dados..." -ForegroundColor Yellow
            npx prisma db push --force-reset
            npm run seed
            Write-Host "✅ Banco resetado!" -ForegroundColor Green
        } else {
            Write-Host "❌ Operação cancelada." -ForegroundColor Yellow
        }
    }
    
    "5" {
        Write-Host "👤 Criando usuário admin..." -ForegroundColor Cyan
        npm run seed
        Write-Host "✅ Admin criado/atualizado!" -ForegroundColor Green
    }
    
    "6" {
        Write-Host "📊 Abrindo Prisma Studio..." -ForegroundColor Cyan
        npm run db:studio
    }
    
    "7" {
        Write-Host "🏗️  Fazendo build para produção..." -ForegroundColor Cyan
        npm run build
        Write-Host "✅ Build concluído!" -ForegroundColor Green
        Write-Host "🚀 Execute: npm start" -ForegroundColor Cyan
    }
    
    "8" {
        Write-Host "🔐 Gerando nova API_SECRET..." -ForegroundColor Cyan
        $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        Write-Host ""
        Write-Host "Nova API_SECRET:" -ForegroundColor Green
        Write-Host $secret -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Adicione esta chave ao arquivo .env:" -ForegroundColor Cyan
        Write-Host "API_SECRET=`"$secret`"" -ForegroundColor White
        
        $update = Read-Host "Deseja atualizar o .env automaticamente? (S/N)"
        if ($update -eq "S" -or $update -eq "s") {
            if (Test-Path ".env") {
                (Get-Content ".env") -replace 'API_SECRET=".*"', "API_SECRET=`"$secret`"" | Set-Content ".env"
                Write-Host "✅ .env atualizado!" -ForegroundColor Green
            }
        }
    }
    
    "9" {
        Write-Host "👋 Até logo!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host "❌ Opção inválida!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
