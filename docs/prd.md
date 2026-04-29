# PRD — Event-Driven Microservices Lab (NestJS + RabbitMQ)

## 1. Propósito do Projeto

Este repositório é um **laboratório de arquitetura distribuída**.

Ele NÃO é um produto final.
Ele NÃO busca perfeição de negócio.

Ele existe para servir como:

* ambiente de estudo contínuo
* referência de arquitetura
* playground para experimentos
* base reutilizável para projetos futuros

O foco principal é aprender **microserviços e arquitetura orientada a eventos** de forma progressiva e prática.

---

# 2. Objetivos Técnicos

O projeto deve permitir praticar:

### Arquitetura

* Event-Driven Architecture
* Domain isolation
* Contracts between services
* Event choreography vs orchestration
* Consistência eventual

### Mensageria

* RabbitMQ com amqplib
* Exchanges, queues e bindings
* Ack / Nack
* Retry
* Dead Letter Queue (DLQ)
* Idempotência

### Persistência

* Database per service
* Isolamento de dados
* Migrações independentes

### Problemas reais de sistemas distribuídos

* Latência artificial
* Falhas simuladas
* Processamento assíncrono
* Reprocessamento de eventos

---

# 3. Decisão Arquitetural Principal

O sistema será implementado como:

👉 **Um único projeto NestJS**
👉 **Módulos isolados simulando microserviços**
👉 **Comunicação EXCLUSIVA via RabbitMQ**

Essa abordagem permite foco total na arquitetura sem complexidade operacional de múltiplos deploys.

---

# 4. Regras Arquiteturais (CRÍTICAS)

Estas regras NÃO podem ser quebradas.

## Regra 1 — Isolamento de Módulos

Módulos NÃO podem importar serviços de outros módulos.

❌ Proibido:

```ts
constructor(private billingService: BillingService)
```

✔ Permitido:

```ts
eventBus.publish(new InvoiceGeneratedEvent(...))
```

Comunicação entre módulos ocorre SOMENTE via eventos.

---

## Regra 2 — Banco por Serviço

Cada módulo possui seu próprio banco SQLite.

Exemplos:

* users.sqlite
* billing.sqlite
* payments.sqlite

Nenhum módulo pode acessar o banco de outro.

---

## Regra 3 — Comunicação Assíncrona

Módulos nunca esperam resposta de outro módulo.

Eventos são **fire-and-forget**.

---

## Regra 4 — Eventos são Imutáveis

Eventos representam algo que JÁ aconteceu.

Devem:

* estar no passado
* ser serializáveis
* nunca ser alterados após publicação

---

## Regra 5 — Contratos Compartilhados

Eventos vivem em:

```
src/contracts/events
```

Todos os módulos dependem apenas desses contratos.

---

# 5. Stack Tecnológica

* NestJS
* RabbitMQ (amqplib)
* SQLite
* Drizzle ORM
* Docker (apenas para RabbitMQ)

---

# 6. Estrutura do Projeto

```txt
src/
  modules/
    users/
    billing/
    payments/
    notifications/
    webhooks/

  infrastructure/
    messaging/
    database/

  contracts/
    events/
```

---

# 7. Domínio do Sistema

Tema: **Plataforma de Assinaturas**

O sistema simula:

* criação de usuários
* criação de assinaturas
* geração de faturas
* processamento de pagamentos
* envio de notificações
* recebimento de webhooks

---

# 8. Módulos (Serviços Simulados)

## API / App Core

Responsável por expor endpoints HTTP.

Ele NÃO contém regra de negócio pesada.
Apenas publica eventos.

---

## Users Module

Responsável por gerenciar usuários.

Entidade:

* User(id, email, createdAt)

Publica:

* user.created

---

## Billing Module

Responsável por assinaturas e faturas.

Entidades:

* Plan
* Subscription
* Invoice

Publica:

* subscription.created
* invoice.generated

Consome:

* invoice.paid
* invoice.payment_failed

---

## Payments Module

Simula um gateway de pagamento.

Consome:

* invoice.generated

Publica:

* invoice.paid
* invoice.payment_failed

Este módulo introduz assincronia e falhas.

---

## Notifications Module

Responsável por notificações (fake).

Consome:

* user.created
* subscription.created
* invoice.paid
* invoice.payment_failed

Não possui banco inicialmente.

---

## Webhooks Module

Simula integrações externas.

Recebe HTTP e publica:

* payment.webhook_received

---

# 9. Fluxo Principal do Sistema

## Fluxo de Assinatura

1. Cliente cria usuário
2. Evento `user.created` é publicado
3. Notifications envia email de boas-vindas

---

4. Cliente cria assinatura
5. Billing cria assinatura
6. Evento `subscription.created`

---

7. Billing gera fatura
8. Evento `invoice.generated`

---

9. Payments consome evento
10. Pagamento é aprovado/reprovado (simulado)
11. Evento:

* `invoice.paid` OU
* `invoice.payment_failed`

---

12. Billing atualiza estado da assinatura
13. Notifications envia email ao usuário

---

# 10. Infra de Mensageria

Exchange principal:

```
domain.events (topic)
```

Routing keys:

* user.created
* subscription.created
* invoice.generated
* invoice.paid
* invoice.payment_failed

Cada módulo possui sua própria fila.

---

# 11. Requisitos de Aprendizado

O sistema deve permitir experimentar:

* falhas intencionais de consumidores
* retry automático
* dead letter queues
* reprocessamento manual de eventos
* idempotência

Falhar faz parte do aprendizado.

---

# 12. Fora do Escopo (por enquanto)

Para evitar overengineering:

* Kubernetes
* CI/CD
* Observabilidade avançada
* Autenticação real
* Frontend

---

# 13. Resultado Esperado

Ao concluir este laboratório, o desenvolvedor deverá entender:

* como sistemas distribuídos se comunicam
* como eventos desacoplam domínios
* como lidar com falhas e assincronia
* como evoluir de monólito para microserviços
