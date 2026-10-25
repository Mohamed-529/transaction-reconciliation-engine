# Technical Architecture Document

## 1. System Architecture Layout

```
[GitHub Webhook Payload]
│
▼
[Spring Boot Ingestion Controller] ─── (Immediate HTTP 202 Response)
│
▼ (Publish Payload)
[Apache Kafka Cluster (Topic: pr-analysis-events)]
│
▼ (Consume Payload)
[Kafka Event Listener Service]
│
├───► [Redis Idempotency Layer] (Check X-GitHub-Delivery Header)
│      ├──► (Exist: Terminate Event execution)
│      └──► (New: Acquire Lock & Proceed)
│
▼
[AST Analysis Engine (JavaParser)] ───► Programmatic Dependency Call Graph
│
▼
[Risk Evaluation Framework] ──────────► Strategy Pattern Context (Complexity vs. Blast Radius)
│
▼
[Generative AI Service Layer] ────────► OpenAI API Grounded Prompt Structure
│
▼
[Data Persistence Layer] ─────────────► PostgreSQL Database Store
│
▼ (WebSockets / SSE Updates)
[React Dashboard UI] ─────────────────► (Clean Component Progressive Disclosure Rendering)
```

## 2. Boundary Systems & Stack Setup
- **Ingress Gateway**: Spring Boot Web Starter exposing standard API endpoints.
- **Message Broker**: Apache Kafka operating on local cluster topologies (KRaft mode).
- **Fast-Access Cashier**: Redis cache instances handling identity lifecycle TTL constraints set strictly to 24 hours.
- **Static Core**: JavaParser Engine extracting specific token matrices from target code repositories.
- **Relational Ledger**: PostgreSQL storage layer managing data normalization for repositories, metadata profiles, and generated test files.
- **Frontend Display**: React, TypeScript, and TailwindCSS delivering a unified application canvas.
