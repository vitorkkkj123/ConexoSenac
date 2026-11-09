# Co.Nexo — MVP SENAC

> Sistema integrado de gestão, mentoria e formalização para Microempreendedores Individuais (MEIs) e negócios informais da Rede de Inovação SENAC.

---

## 🚀 Visão Geral da Solução

O **Co.Nexo** substitui planilhas locais em Excel, formulários manuais no WhatsApp e arquivos dispersos no OneDrive por uma plataforma centralizada, segura e em nuvem, estruturada em **4 Sprints**:

1. **Sprint 1 (Fundação e Segurança):** Ficha única do empreendedor no MongoDB Atlas com importação via Webhook do RD Station e histórico consolidado.
2. **Sprint 2 (Motor de Agendamento):** Grade de horários com gerador de blocos de 4 horas, regras de assiduidade (< 24h vira falta, limite de 2 faltas/reagendamentos) e link autônomo enviado pelo WhatsApp para o mentorado.
3. **Sprint 3 (Ambiente de Mentoria):** Diário de bordo digital integrado nos 5 encontros da metodologia Co.Nexo com diagnósticos, planos de metas e central de entregáveis (PDFs).
4. **Sprint 4 (Inteligência e Visibilidade):** Cockpit operacional diário para o atendimento (Max) e painel executivo com indicadores em tempo real para a coordenação (Regis).

---

## 🛠️ Stack Tecnológica

* **Back-end:** Node.js (v20+) + Express (Arquitetura em Camadas: MVC + Services + Zod Schemas).
* **Banco de Dados:** MongoDB Atlas (Mongoose ODM com operações atômicas contra concorrência/overbooking).
* **Front-end:** HTML5, CSS3 e Bootstrap 5 (via CDN, sem compilação/build complexo, responsivo para celular).
* **Segurança:** Helmet, Rate Limiting, Zod Validation, RBAC (Controle de Acesso).

---

## 📁 Estrutura do Projeto

```text
conexo/
├── src/
│   ├── app.js               # Configuração do Express e Middlewares
│   ├── server.js            # Inicialização HTTP e conexão MongoDB
│   ├── config/              # Banco de dados e constantes de negócio
│   ├── models/              # Schemas Mongoose (User, Entrepreneur, Schedule, Diary)
│   ├── validations/         # Contratos de dados com Zod
│   ├── services/            # Regras de negócio desacopladas
│   ├── controllers/         # Tratamento de requisições e respostas HTTP
│   ├── routes/              # Endpoints da API REST
│   └── middlewares/         # Autenticação, validação e tratamento central de erros
│
└── public/                  # Front-end (Bootstrap 5)
    ├── css/style.css        # Identidade visual SENAC
    ├── js/api.js            # Cliente HTTP padronizado com toasts
    ├── js/layout.js         # Shell de navegação reutilizável
    ├── index.html           # Cockpit diário (Max) + Indicadores (Regis)
    ├── alunos.html          # Ficha única e cadastro de empreendedores
    ├── ficha.html           # Ficha 360° + Diário de bordo dos 5 encontros
    ├── agenda.html          # Gestão de horários e blocos de 4h
    └── agendar.html         # Link mobile do mentorado no WhatsApp
```

---

## 💻 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
* Node.js v18 ou superior instalado.
* MongoDB rodando localmente (`mongodb://127.0.0.1:27017`) ou conexão com o cluster do **MongoDB Atlas**.

### 2. Passo a Passo
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# O arquivo .env já vem configurado para uso local por padrão:
# PORT=3000
# MONGO_URI=mongodb://127.0.0.1:27017/conexo

# 3. Iniciar o servidor em modo de desenvolvimento
npm run dev

# 4. Acessar a aplicação no navegador
# Abra: http://localhost:3000
```

---

## 👥 Usuários Padrão Inicializados no Banco (Seed)

O sistema cria automaticamente os usuários de teste no primeiro boot:
* **Max (Atendimento):** `max@senac.br` | Senha: `senha123456`
* **Aline (Consultoria):** `aline@senac.br` | Senha: `senha123456`
* **Regis (Coordenação):** `regis@senac.br` | Senha: `senha123456`

---

## 🌐 Deploy no Render / Vercel

1. Suba o repositório para o **GitHub**.
2. No **Render.com**, crie um novo **Web Service** conectado ao repositório.
3. Configure:
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
4. Na aba **Environment Variables**, adicione sua `MONGO_URI` obtida no **MongoDB Atlas**.
