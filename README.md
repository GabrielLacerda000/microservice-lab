Perfeito — segue o **README técnico inicial** focado em setup e primeiros passos. Você pode salvar como `README.md`.

---

# Event-Driven Microservices Lab

Laboratório de arquitetura distribuída usando **NestJS + RabbitMQ + Drizzle + SQLite**.

Este projeto simula microserviços dentro de um único app Nest, mantendo isolamento real entre domínios através de eventos.

O objetivo é aprender arquitetura, não construir um produto.

---

# Stack

* NestJS
* RabbitMQ (via amqplib)
* SQLite
* Drizzle ORM
* Docker (apenas RabbitMQ)

---

# Pré-requisitos

Instale antes de começar:

* Node 18+
* Docker
* npm / pnpm

Recomendado:

```bash
node -v
docker -v
```

---

# 1. Criar o projeto Nest

Se ainda não criou:

```bash
npx @nestjs/cli new microservices-lab
cd microservices-lab
```

Escolha npm ou pnpm.

---

# 2. Instalar dependências principais

### RabbitMQ client

```bash
npm install amqplib
```

### Drizzle + SQLite

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

### Variáveis de ambiente

```bash
npm install dotenv
```

---

# 3. Subir RabbitMQ com Docker

Crie um arquivo na raiz:

## docker-compose.yml

```yaml
version: "3.9"

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: microservices-rabbit
    ports:
      - "5672:5672"
      - "15672:15672"
```

Subir o container:

```bash
docker compose up -d
```

Verificar se está rodando:

Painel web:

```
http://localhost:15672
```

Credenciais padrão:

```
user: guest
password: guest
```

Se você consegue acessar o painel, o broker está pronto.

---

# 4. Estrutura inicial do projeto

Crie a estrutura base:

```bash
mkdir -p src/modules
mkdir -p src/infrastructure/messaging
mkdir -p src/infrastructure/database
mkdir -p src/contracts/events
```

Estrutura esperada:

```
src/
  modules/
  infrastructure/
    messaging/
    database/
  contracts/
    events/
```

---

# 5. Configurar variáveis de ambiente

Crie `.env` na raiz:

```env
RABBITMQ_URL=amqp://localhost:5672
```

Adicione ao `main.ts`:

```ts
import 'dotenv/config';
```

---

# 6. Primeiro teste de conexão com RabbitMQ

Crie:

## src/infrastructure/messaging/rabbit.connection.ts

```ts
import amqp from 'amqplib';

export async function createRabbitConnection() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();

  console.log('RabbitMQ connected');

  return { connection, channel };
}
```

---

# 7. Testar ao iniciar a aplicação

Abra `app.module.ts` e adicione no bootstrap temporariamente:

```ts
import { Module, OnModuleInit } from '@nestjs/common';
import { createRabbitConnection } from './infrastructure/messaging/rabbit.connection';

@Module({})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    await createRabbitConnection();
  }
}
```

---

# 8. Rodar o projeto

```bash
npm run start:dev
```

Se aparecer:

```
RabbitMQ connected
```

🎉 Infra básica pronta.

