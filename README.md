# Clube do Album Notification Worker

Worker responsavel pelo futuro processamento de notificacoes da plataforma Clube do Album.

## Responsabilidade futura

- Consumir eventos de notificacao.
- Preparar notificacoes para usuarios.
- Processar notificacoes de feed, reviews e atividades sociais.
- Integrar futuramente com provedores de envio.

## Tecnologias usadas

- Node.js
- TypeScript

## Como rodar localmente

```bash
npm install
npm run dev
```

Status atual: projeto inicial criado apenas com estrutura base. As funcionalidades serão implementadas nas próximas etapas.

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
docker run --env-file .env clube-do-album-notification-worker
```
