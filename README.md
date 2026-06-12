# Clube do Album Notification Worker

Worker responsavel pelo processamento local de notificacoes da plataforma Clube do Album.

## Responsabilidades

- Consumir eventos do RabbitMQ.
- Criar notificacoes no PostgreSQL.
- Notificar quando alguem seguir um usuario.
- Criar notificacao local quando uma avaliacao for registrada.
- Preparar notificacoes de atualizacao de ranking para evolucao futura.
- Expor endpoints HTTP para consultar e marcar notificacoes como lidas.

Nesta etapa nao ha envio real de email, push ou WebSocket. As notificacoes ficam persistidas no banco.

## Tecnologias usadas

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- RabbitMQ

## Como rodar localmente

Crie o `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Instale as dependencias:

```bash
npm install
```

Rode as migrations:

```bash
npx prisma migrate dev
```

Inicie o worker:

```bash
npm run dev
```

O servidor HTTP sobe por padrao em:

```text
http://localhost:3005
```

## Endpoints HTTP

Healthcheck:

```http
GET /health
```

Listar notificacoes do usuario:

```http
GET /notifications
X-User-Id: uuid-do-usuario
```

Tambem e possivel consultar temporariamente com query string:

```http
GET /notifications?userId=uuid-do-usuario
```

Listar apenas nao lidas:

```http
GET /notifications?unread=true
X-User-Id: uuid-do-usuario
```

Contar nao lidas:

```http
GET /notifications/unread-count
X-User-Id: uuid-do-usuario
```

Marcar uma notificacao como lida:

```http
PATCH /notifications/{id}/read
X-User-Id: uuid-do-usuario
```

Marcar todas como lidas:

```http
PATCH /notifications/read-all
X-User-Id: uuid-do-usuario
```

## Eventos consumidos

Exchange:

```text
clube-do-album.events
```

Routing keys:

```text
album.rated
user.followed
ranking.updated
```

## Dead Letter Queues

As filas consumidas por este worker usam dead letter para mensagens rejeitadas com `nack(..., false, false)`.

```text
Dead letter exchange: clube-do-album.dead-letter
Tipo: direct
Filas:
  notification.album-rated.queue.dlq
  notification.user-followed.queue.dlq
  notification.ranking-updated.queue.dlq
Routing keys:
  notification.album-rated.queue.dead
  notification.user-followed.queue.dead
  notification.ranking-updated.queue.dead
```

Se as filas principais ja existirem no RabbitMQ sem argumentos de dead letter, recrie as filas antes de subir a nova versao do worker.

## Docker

Crie um arquivo local de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

Build da imagem:

```bash
docker build -t clube-do-album-notification-worker .
```

Execucao local:

```bash
docker run --rm --name clube-do-album-notification-worker \
  --network clube-do-album-network \
  --env-file .env \
  -e DATABASE_URL=postgresql://clube:clube@clube-do-album-postgres:5432/clube_do_album_notification \
  -e RABBITMQ_URL=amqp://clube:clube@clube-do-album-rabbitmq:5672 \
  -e RABBITMQ_DEAD_LETTER_EXCHANGE=clube-do-album.dead-letter \
  -e IDENTITY_API_URL=http://clube-do-album-identity-api:8081 \
  -e CATALOG_API_URL=http://clube-do-album-catalog-api:3001 \
  -p 3005:3005 \
  clube-do-album-notification-worker
```
