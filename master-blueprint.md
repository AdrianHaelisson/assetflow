1. Visão Geral e Objetivo
O AssetFlow é um sistema Multi-tenant de gestão de ativos patrimoniais voltado para escritórios de contabilidade e seus clientes. Ele deve gerenciar o ciclo de vida de hardware e licenças de software, permitindo auditoria e controle de movimentação.

Público-alvo: Administradores de TI (como você na Exatas Contabilidade) e gestores de empresas clientes.


Prazo de Execução: 16 semanas.

2. Arquitetura e Tech Stack (The "How")
Para cumprir as premissas do TAP, utilizaremos:

Back-end (Bun + TypeScript)
Arquitetura: Clean Architecture + DDD (Domain-Driven Design).

Padrões: Repository Pattern, Dependency Injection (Inversão de Controle), Use Cases, Singleton.


Framework: Express.js.


ORM: Prisma ou TypeORM (para mapeamento do PostgreSQL).

Autenticação: JWT (JSON Web Token) com Refresh Token.

Front-end (React + TypeScript)

Comunicação: Axios.

Estilização: Tailwind CSS (para agilidade e design moderno).

Gerenciamento de Estado: React Context API ou Zustand.

Formulários: React Hook Form + Zod (validação de schemas).

3. Estrutura de Pastas (Clean Architecture)
Plaintext
src/
├── domain/                # Regras de Negócio e Entidades
│   ├── entities/          # Asset, Company, User, Assignment
│   └── repositories/      # Interfaces (Contratos)
├── application/           # Casos de Uso (Lógica da aplicação)
│   ├── use-cases/         # CreateAsset, AssignAsset, GenerateReport
│   └── dtos/              # Data Transfer Objects
├── infrastructure/        # Detalhes técnicos (Frameworks, DB)
│   ├── database/          # Prisma Client e Migrations
│   ├── repositories/      # Implementações concretas dos contratos
│   └── http/              # Express setup, Controllers, Middlewares
└── main/                  # Composição do sistema (Dependency Injection)
4. Modelagem do Banco de Dados (PostgreSQL)
Tabelas fundamentais que o agente de IA deve criar via Migrations:

Companies: id, name, cnpj, address, created_at.

Users: id, name, email, password_hash, role (ADMIN/CLIENT), company_id.

Assets: id, type (HARDWARE/SOFTWARE), tag_number, model, serial, purchase_date, value, status, company_id.

Assignments: id, asset_id, user_id (employee), assigned_at, returned_at.

5. Plano de Execução (Sprint por Sprint)
Fase 1: Fundação e TDD (Semanas 1-4)

Tarefa 0: Configuração do ambiente com Docker para o PostgreSQL.

Tarefa 1 (TDD): Implementar Entidades de Domínio com testes unitários usando Vitest.

Checklist:

[ ] Entidade Asset não permite criação sem número de série.

[ ] Entidade Company valida CNPJ real.

Fase 2: Core Back-end (Semanas 5-8)
Tarefa 2: Implementar Use Cases principais (Cadastro de Ativo e Vinculação de Ativo a Colaborador).


Tarefa 3: Configuração do Prisma/TypeORM e Migrations.

Boas Práticas: Aplicar o princípio S (Single Responsibility) do SOLID em cada Use Case.

Fase 3: API e Segurança (Semanas 9-11)

Tarefa 4: Criar Controllers e rotas Express.

Tarefa 5: Middleware de autenticação JWT e RBAC (Role-Based Access Control).

Boas Práticas: Todos os erros devem ser tratados por um GlobalErrorHandler.

Fase 4: Front-end e Integração (Semanas 12-14)
Tarefa 6: Setup do React com Vite e Tailwind.


Tarefa 7: Criar Dashboard de Ativos com filtros por empresa (usando Axios).

Tarefa 8: Tela de movimentação (Check-in/Check-out de equipamentos).

Fase 5: Finalização (Semanas 15-16)
Tarefa 9: Geração de PDF para termos de responsabilidade.


Tarefa 10: Revisão final do código e documentação para o TCC.

6. Instruções Específicas para o Agente de IA (Prompt de Execução)
"Aja como um Arquiteto de Software Sênior. Sua missão é construir o back-end do sistema AssetFlow.

Regras de Ouro:

TDD First: Escreva o teste para o caso de uso antes da implementação.

SOLID: Não aceite classes com mais de uma responsabilidade.

Clean Code: Nomes de variáveis semânticos, funções pequenas e sem comentários óbvios.

Dependency Injection: O domínio nunca deve depender da infraestrutura. Use interfaces para desacoplar o banco de dados da lógica.

Tarefa Imediata: Crie a estrutura de pastas e a entidade de domínio Asset.ts com validações de negócio, juntamente com seu teste unitário em Vitest."

7. Checklist de Qualidade (Definição de Pronto)
[ ] O código segue o padrão TypeScript Strict Mode.

[ ] Cobertura de testes unitários nos Use Cases > 80%.

[ ] Documentação da API feita via Swagger/OpenAPI.

[ ] O sistema é totalmente funcional no navegador (Web).

[ ] O código-fonte está versionado no Git com mensagens de commit padronizadas (Conventional Commits).

Com este nível de detalhamento, você pode simplesmente pedir para a IA começar pela Fase 1, enviando este plano como contexto. Como você já tem afinidade com Clean Architecture e Docker, esse projeto será um diferencial enorme na sua apresentação no IFS.