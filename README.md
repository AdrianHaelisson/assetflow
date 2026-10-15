# AssetFlow

Acompanhe ativos, responsáveis e movimentações em um inventário organizado por colaborador, sede e setor. O projeto reúne gestão patrimonial e histórico de atribuições em uma aplicação web.

[Código do projeto](https://github.com/AdrianHaelisson/assetflow) · [Portfólio](https://haelisson.com.br) · [LinkedIn](https://www.linkedin.com/in/adrian-haelisson/)

## O fluxo

1. Cadastre os ativos e a estrutura de sedes e setores.
2. Atribua equipamentos aos colaboradores e acompanhe movimentações.
3. Consulte o inventário, o histórico e os relatórios da operação.

O objetivo é organizar a responsabilidade e a localização dos itens, dando uma base comum para consulta.

## Funcionalidades

- Inventário de hardware, software e acessórios com identificação patrimonial.
- Histórico de atribuição e devolução por colaborador.
- Organização por sedes, setores e kits de equipamentos.
- Termos de responsabilidade em PDF.
- Painel e exportação `.xlsx` com informações de ativos, colaboradores e resumo financeiro.
- Controle de consumíveis.

## Arquitetura e stack

O backend separa domínio, casos de uso e infraestrutura. Usa Bun, TypeScript, Hono, Prisma e PostgreSQL. O frontend é uma SPA em React e Vite, com Zustand para estado e Axios para requisições.

O login utiliza JWT. A configuração `JWT_SECRET` é interna ao servidor; o usuário informa suas credenciais de acesso, não essa chave. O frontend inclui o token nas requisições autenticadas.

```text
src/
  domain/          Entidades e contratos
  application/     Casos de uso
  infrastructure/  Persistência, HTTP e serviços
  main/            Inicialização
frontend/          Interface React
prisma/            Schema, migrations e seeds
docker-compose.yml Banco de dados local
```

## Executar localmente

Pré-requisitos: [Bun](https://bun.sh/) e [Docker com Compose](https://www.docker.com/).

Clone o projeto e instale as dependências:

```bash
git clone https://github.com/AdrianHaelisson/assetflow.git
cd assetflow
bun install
```

Inicie o banco local:

```bash
docker-compose up -d
```

Crie `.env` na raiz. O exemplo abaixo contém placeholders que devem ser substituídos pela configuração local:

```env
DATABASE_URL="postgresql://USUARIO_LOCAL:SENHA_LOCAL@localhost:5432/assetflow?schema=public"
JWT_SECRET="SUBSTITUA_POR_UMA_CHAVE_ALEATORIA_LONGA"
```

Use os parâmetros do banco configurado em `docker-compose.yml`. Uma chave aleatória pode ser gerada com:

```bash
openssl rand -base64 64
```

Execute as migrations e o seed de desenvolvimento:

```bash
bunx prisma migrate dev
bun run prisma/seed.ts
```

Inicie os servidores em terminais separados:

```bash
# Backend
bun run dev
```

```bash
# Frontend, a partir da raiz do projeto
cd frontend
bun run dev
```

Abra `http://localhost:5173`. O backend usa a porta `3000`, conforme a configuração documentada do projeto.

## Primeiro acesso

O seed cria um usuário administrador para desenvolvimento. Consulte as credenciais definidas em `prisma/seed.ts` para esse ambiente e altere-as antes de qualquer uso externo.

## Testes

Backend, a partir da raiz:

```bash
bun test
```

Frontend:

```bash
cd frontend
bun run test
bun run test:coverage
```

Para gerar o build do frontend, dentro de `frontend/`:

```bash
bun run build
```

## Escopo

As instruções descrevem desenvolvimento local. Banco, seeds e dados de inventário devem corresponder ao ambiente escolhido. Não publique `.env`, relatórios operacionais ou informações de colaboradores junto do código.
