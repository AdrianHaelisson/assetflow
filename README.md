# AssetFlow

O **AssetFlow** é um sistema Multi-tenant de gestão de ativos patrimoniais voltado para escritórios de contabilidade e seus clientes. Ele permite gerenciar todo o ciclo de vida de hardwares e licenças de software, oferecendo controle de movimentação, auditorias e geração de relatórios.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias modernas do ecossistema JavaScript/TypeScript, com forte foco em performance, tipagem estática e arquitetura limpa (Clean Architecture).

### Back-end
- **[Bun](https://bun.sh/)**: Runtime ultrarrápido para JavaScript e TypeScript.
- **[Hono](https://hono.dev/)**: Framework web leve e de alta performance.
- **Arquitetura**: Clean Architecture + Domain-Driven Design (DDD).
- **Banco de Dados**: PostgreSQL com ORM **[Prisma](https://www.prisma.io/)**.
- **Autenticação**: JWT (JSON Web Token).
- **Ferramentas extras**: `node-cron` para tarefas agendadas, `pdfkit` para geração de relatórios e `csv-parser`.

### Front-end
- **[React](https://reactjs.org/)** com **[Vite](https://vitejs.dev/)**.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework utility-first para estilização ágil e responsiva.
- **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand).
- **Formulários e Validação**: React Hook Form + Zod.
- **Gráficos**: Recharts.
- **Utilitários**: `qrcode.react` para geração de QR Codes de ativos e `axios` para consumo da API.

## 📁 Estrutura do Projeto

O projeto é um monorepo que utiliza os workspaces do Bun, dividindo-se entre backend e frontend.

```text
AssetFlow/
├── src/                    # Backend (Clean Architecture)
│   ├── domain/             # Entidades de negócio e interfaces de repositórios
│   ├── application/        # Casos de Uso (Use Cases) e DTOs
│   ├── infrastructure/     # Repositórios concretos, DB, Server HTTP, Auth
│   └── main/               # Ponto de entrada, injeção de dependências e rotas
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes de UI (Design System / Vanilla CSS + Tailwind)
│   │   ├── pages/          # Telas da aplicação (Dashboard, Collaborators, Reports, etc)
│   │   ├── store/          # Estado global da aplicação com Zustand
│   │   └── api/            # Instância do Axios e integração HTTP
├── prisma/                 # Schemas e Migrations do Banco de Dados
├── docker-compose.yml      # Configuração do PostgreSQL em container
└── package.json            # Configurações do Monorepo
```

## ⚙️ Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Bun](https://bun.sh/)
- [Docker e Docker Compose](https://www.docker.com/)

### Passo a Passo

1. **Clone o repositório e instale as dependências:**
   ```bash
   bun install
   ```
   *Isso instalará as dependências tanto do back-end quanto do front-end através do workspace.*

2. **Suba o banco de dados (PostgreSQL):**
   ```bash
   docker-compose up -d
   ```

3. **Configure as Variáveis de Ambiente:**
   Certifique-se de que o arquivo `.env` na raiz do projeto está configurado corretamente.
   ```env
   DATABASE_URL="postgresql://admin:password@localhost:5432/assetflow?schema=public"
   JWT_SECRET="sua_chave_secreta_aqui"
   ```

4. **Rode as Migrations do Prisma:**
   Isso criará as tabelas no banco de dados.
   ```bash
   bunx prisma migrate dev
   ```

5. **Inicie os servidores (Backend e Frontend):**
   - **Backend:**
     No diretório raiz, execute:
     ```bash
     bun run dev
     ```
   - **Frontend:**
     Abra uma nova aba do terminal e execute:
     ```bash
     cd frontend
     bun run dev
     ```

A aplicação Front-end geralmente ficará disponível em `http://localhost:5173` e a API Back-end em `http://localhost:3000`.

## 🧪 Rodando Testes

O projeto utiliza o test runner nativo do Bun para garantir a qualidade do código.

```bash
# Rodar todos os testes do backend (TDD e Use Cases)
bun test

# Rodar testes do frontend
cd frontend
bun run test
bun run test:coverage
```

## 📝 Funcionalidades Principais
- **Gestão de Empresas (Tenants):** Arquitetura preparada para gerenciar múltiplos clientes.
- **Controle de Acessos:** Usuários Administradores de TI e Clientes (RBAC).
- **Gestão de Ativos (Assets):** Cadastro completo de Hardware e Software (Número de série, valor, data de compra, etc).
- **Check-in/Check-out (Assignments):** Histórico de movimentação, vinculação e devolução de ativos aos colaboradores (users).
- **Geração de Relatórios:** Exportação e visualização de dados via PDF e integração gráfica de estatísticas (Dashboard).

## 🛡️ Boas Práticas Adotadas
- **Clean Architecture:** Independência de frameworks, banco de dados e interfaces externas. O núcleo do sistema (`domain`) é isolado.
- **SOLID Principles:** Alto desacoplamento e responsabilidade única.
- **Dependency Injection:** Desacoplamento através de injeção de dependências no pacote `main`.
- **Validação com Zod:** Validação segura de ponta a ponta (tanto no payload das requisições quanto nos formulários do front-end).
