# AssetFlow

O **AssetFlow** é um sistema de gestão de ativos patrimoniais voltado para escritórios de contabilidade. Ele permite gerenciar todo o ciclo de vida de hardwares, acessórios e licenças de software, com rastreabilidade por colaborador, sede e setor.

---

## 🚀 Stack Tecnológica e Decisões Técnicas

Cada tecnologia foi escolhida com um motivo claro. Esta seção documenta o **porquê** de cada escolha e o que foi descartado.

---

### ⚡ Runtime: Bun (em vez de Node.js)

**Por quê Bun?**
O Bun é um runtime JavaScript/TypeScript all-in-one que substitui Node.js + npm + ts-node em um único binário. Para este projeto, ele trouxe três vantagens decisivas:

1. **Execução nativa de TypeScript** — sem necessidade de compilar com `tsc` ou usar `ts-node`/`tsx`. O arquivo `.ts` roda diretamente.
2. **Velocidade** — instalação de pacotes ~20x mais rápida que npm e inicialização do servidor significativamente mais rápida.
3. **Test runner integrado** — não precisamos do Jest ou Vitest para o backend; o `bun test` é suficiente e mais rápido.

**O que foi descartado:** Node.js + ts-node. Funcionaria, mas exigiria mais configuração e seria mais lento em desenvolvimento.

---

### 🌐 Framework HTTP: Hono (em vez de Express ou Fastify)

**Por quê Hono?**
O Hono é um framework web minimalista construído para runtimes modernos (Bun, Deno, Cloudflare Workers). Suas vantagens:

1. **Tipagem nativa** — o contexto (`c`) é totalmente tipado, o que melhora a DX.
2. **Zero dependências** — extremamente leve, sem o bagageiro histórico do Express.
3. **Performance** — benchmarks mostram performance superior ao Express em todos os cenários.
4. **Middleware moderno** — CORS, JWT, validação com Zod são plug-ins nativos.

**O que foi descartado:** Express (muito legado, sem suporte a TypeScript nativo), Fastify (mais complexo de configurar com Bun).

---

### 🗄️ Banco de Dados: PostgreSQL + Prisma ORM

**Por quê PostgreSQL?**
O projeto lida com dados relacionais complexos (Ativos → Atribuições → Usuários → Sedes → Setores). Um banco relacional garante integridade referencial via Foreign Keys — algo que bancos NoSQL (MongoDB) não oferecem nativamente. PostgreSQL também oferece suporte a transações ACID, essencial em operações de check-out/devolução de ativos.

**Por quê Prisma?**
O Prisma é o ORM que melhor integra com TypeScript. Diferente de Sequelize ou TypeORM (que têm problemas de tipos gerados automaticamente), o Prisma gera tipos precisos diretamente do `schema.prisma`. Isso significa que se você acessar `user.locationId`, o TypeScript sabe exatamente o tipo sem nenhuma configuração extra.

**O que foi descartado:** MongoDB (sem joins nativos, mais difícil para relatórios financeiros), TypeORM (tipos gerados com decorators, mais verboso).

---

### 🔐 Autenticação: JWT (JSON Web Token)

**Por quê JWT?**
O AssetFlow é uma SPA (Single Page Application) sem SSR. O padrão de autenticação mais adequado para SPAs é o JWT stateless: após o login, o servidor assina um token com uma chave secreta (`JWT_SECRET`) e o devolve ao cliente. Nas chamadas subsequentes, o cliente inclui esse token no cabeçalho `Authorization`, e o servidor o verifica sem precisar consultar o banco de dados a cada requisição.

**Como funciona na prática:**
1. Usuário faz login → backend valida senha (hash bcrypt) → gera JWT assinado
2. Frontend armazena o token (Zustand/localStorage)
3. `apiClient` (Axios) injeta automaticamente `Authorization: Bearer <token>` em toda requisição
4. O middleware `AuthMiddleware` no backend verifica a assinatura antes de processar qualquer rota protegida

**O `JWT_SECRET`** pode ser qualquer string longa e aleatória. Em produção, use algo como:
```bash
openssl rand -base64 64
```

**O que foi descartado:** Sessions com cookies (requerem armazenamento server-side e são mais complexos em arquiteturas multi-tenant), OAuth (overkill para um sistema interno).

---

### 🏗️ Arquitetura: Clean Architecture + DDD

**Por quê Clean Architecture?**
O domínio de negócio (Ativo, Atribuição, Colaborador) foi isolado da infraestrutura (banco de dados, framework HTTP). Isso significa que:

- Se o banco mudar de PostgreSQL para outro, só a camada `infrastructure/` muda.
- Se o framework mudar de Hono para Express, só os controllers mudam.
- O core de negócio pode ser testado sem mockar banco ou HTTP.

```
domain/      → Regras de negócio puras (sem dependências externas)
application/ → Casos de uso (orquestram o domínio)
infrastructure/ → Prisma, Hono, JWT (detalhes de implementação)
```

**O que foi descartado:** MVC simples (acopla lógica de negócio ao framework), CRUD puro sem camadas (difícil de testar e manter).

---

### ⚛️ Frontend: React + Vite (em vez de Next.js)

**Por quê React sem Next.js?**
O AssetFlow é uma ferramenta administrativa interna — não precisa de SEO, nem de Server-Side Rendering. Um SPA puro com React + Vite é mais simples de hospedar (qualquer servidor de arquivos estáticos) e tem DX mais rápida (HMR instantâneo com Vite).

**O que foi descartado:** Next.js (SSR desnecessário para um painel admin, maior complexidade de configuração).

---

### 🎨 CSS: Vanilla CSS com variáveis (em vez de Tailwind)

**Por quê Vanilla CSS?**
O sistema de design do AssetFlow usa um tema dark personalizado com glassmorphism, gradientes e animações específicas. Com Tailwind, isso exigiria muitas classes customizadas ou `@apply` excessivos, perdendo as vantagens do utility-first. Com variáveis CSS nativas (`--accent-primary`, `--bg-surface`, etc.), o tema é alterável globalmente e legível.

**O que foi descartado:** Tailwind (classes longas para estilos complexos e personalizados), styled-components (runtime overhead, complexidade desnecessária).

---

### 📦 Estado Global: Zustand (em vez de Redux ou Context API)

**Por quê Zustand?**
O estado global do frontend é simples: dados do usuário logado, toasts de notificação e modal de confirmação. Zustand resolve isso em ~10 linhas sem boilerplate de actions, reducers ou providers. Para a escala deste projeto, Redux seria exagero.

**O que foi descartado:** Redux Toolkit (verboso para estado simples), Context API (re-renders desnecessários, performance inferior).

---

### 📊 Exportação: SheetJS (xlsx)

**Por quê xlsx em vez de CSV?**
O relatório exportado contém múltiplas entidades (Ativos, Colaboradores, Resumo Financeiro). Um arquivo `.xlsx` suporta múltiplas abas em um único arquivo, formatação e é nativamente compatível com Excel e Google Sheets. Um CSV é uma tabela plana — não comporta dados multi-dimensionais sem gerar múltiplos arquivos.

---

## 📁 Estrutura do Projeto

```text
AssetFlow/
├── src/                    # Backend (Clean Architecture)
│   ├── domain/             # Entidades e interfaces de repositórios
│   ├── application/        # Casos de Uso (Use Cases)
│   ├── infrastructure/     # Prisma, Hono, JWT, Controllers
│   └── main/               # Ponto de entrada e injeção de dependências
├── frontend/               # SPA React + Vite
│   └── src/
│       ├── components/     # UI components (tabs, modais, tabelas)
│       ├── hooks/          # Hooks reutilizáveis (useFilteredData)
│       ├── store/          # Estado global (Zustand)
│       └── lib/            # apiClient (Axios com interceptor JWT)
├── prisma/                 # Schema, migrations e seeds
├── docker-compose.yml      # PostgreSQL em container
└── package.json            # Monorepo (Bun workspaces)
```

---

## ⚙️ Como Executar

### Pré-requisitos
- [Bun](https://bun.sh/) — `curl -fsSL https://bun.sh/install | bash`
- [Docker e Docker Compose](https://www.docker.com/)

### Passo a Passo

**1. Clone e instale as dependências:**
```bash
git clone https://github.com/AdrianHaelisson/assetflow.git
cd assetflow
bun install
```

**2. Suba o banco de dados:**
```bash
docker-compose up -d
```

**3. Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz com:
```env
DATABASE_URL="postgresql://admin:password@localhost:5432/assetflow?schema=public"
JWT_SECRET="cole-aqui-uma-string-longa-e-aleatoria"
```

> 💡 Para gerar um `JWT_SECRET` seguro: `openssl rand -base64 64`

**4. Rode as migrations e o seed inicial:**
```bash
bunx prisma migrate dev
bun run prisma/seed.ts
```

**5. Inicie os servidores:**

```bash
# Terminal 1 — Backend (porta 3000)
bun run dev

# Terminal 2 — Frontend (porta 5173)
cd frontend && bun run dev
```

Acesse em: **http://localhost:5173**

---

## 🧪 Testes

```bash
# Backend
bun test

# Frontend
cd frontend
bun run test
bun run test:coverage
```

---

## ✨ Funcionalidades

- **Inventário Unificado** — Ativos (Hardware, Software, Acessórios) com tag/patrimônio, série e QR Code únicos
- **Atribuições (Check-out)** — Histórico completo de quem usou cada equipamento e quando
- **Colaboradores** — Perfis com sedes, setores, kits de equipamentos e termo de responsabilidade em PDF
- **Sedes e Setores** — Organização geográfica e departamental do inventário
- **Relatórios** — Dashboard com gráficos de depreciação e exportação em `.xlsx` (3 abas: ativos, colaboradores, resumo financeiro)
- **Consumíveis** — Controle de estoque de itens não rastreáveis (toner, papel, cabos)
