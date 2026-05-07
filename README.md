# CMeloFlow — Frontend

Painel administrativo da plataforma **CMeloFlow** — automação de atendimento via
WhatsApp e Instagram com IA.

Construído com:
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **Axios** para HTTP
- **React Hook Form** + **Zod** para formulários e validação
- **Zustand** para estado global
- **next-themes** para darkmode

## Pré-requisitos

- Node.js 18.17+ ou 20+
- Backend do CMeloFlow rodando ([cmeloflow_backend](https://github.com/csrmds/cmeloflow_backend))

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e ajuste:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

| Variável                | Descrição                                    |
|-------------------------|----------------------------------------------|
| `NEXT_PUBLIC_API_URL`   | URL base da API (backend Node/Express)       |

## Scripts

```bash
npm run dev      # ambiente de desenvolvimento (http://localhost:3000)
npm run build    # build de produção
npm run start    # serve o build
npm run lint     # ESLint
```

> Se o backend já estiver rodando na porta 3000, ajuste a porta do frontend
> com `npm run dev -- -p 3001` e atualize `NEXT_PUBLIC_API_URL`.

## Estrutura de rotas

### Públicas
- `/` — Landing page
- `/login` — Autenticação

### Autenticadas (todos os roles)
- `/dashboard` — Home
- `/produtos` — Lista, criação e edição de produtos
- `/leads` — Lista, criação e edição de leads
- `/perfil` — Dados da empresa do cliente logado

### Exclusivas do role `admin`
- `/admin/clientes` — Gestão de clientes (incluindo telefones por cliente)
- `/admin/leads` — Todos os leads de todos os clientes
- `/admin/produtos` — Todos os produtos de todos os clientes

O `middleware.ts` garante redirecionamento para `/login` quando o cookie de
token não está presente.

## Autenticação

- O backend retorna `{ token }` em `POST /auth/login`.
- O JWT é decodificado no client (`src/lib/auth.ts`) para extrair
  `user_id`, `user_role` e `client_id`.
- Token persistido em `localStorage` + cookie (para o middleware do Next).
- Interceptor do Axios injeta `Authorization: Bearer <token>` em todas as
  requisições e redireciona para `/login` em respostas 401.

## Endpoints consumidos

| Método | Rota                                  | Uso                                  |
|--------|---------------------------------------|--------------------------------------|
| POST   | `/auth/login`                          | Login                                |
| GET    | `/clients`                             | Lista de clientes (admin)            |
| GET    | `/clients/:id`                         | Dados do cliente (perfil + edição)   |
| POST   | `/clients`                             | Criar cliente (admin)                |
| PUT    | `/clients/:id`                         | Atualizar cliente / perfil           |
| DELETE | `/clients/:id`                         | Excluir cliente (admin)              |
| GET    | `/clients/:clientId/phones`            | Listar telefones                     |
| POST   | `/clients/:clientId/phones`            | Criar telefone                       |
| DELETE | `/clients/:clientId/phones/:id`        | Excluir telefone                     |
| GET    | `/products`                            | Listar produtos do cliente logado    |
| POST   | `/products`                            | Criar produto                        |
| PUT    | `/products/:id`                        | Atualizar produto                    |
| DELETE | `/products/:id`                        | Excluir produto                      |
| GET    | `/leads`                               | Listar leads (controller existe)     |

### Endpoints pendentes no backend

Alguns endpoints estavam fora do scope do backend no momento da construção do
frontend. Todos têm `TODO` no código indicando o ponto exato a ser ajustado:

- `GET /leads` — o controller `leadController.list` existe mas não está
  registrado em `src/routes/leadRoutes.js`. O frontend chama o endpoint e cai
  para uma lista vazia em caso de 404. Basta registrar a rota no backend para
  ativar a tela.
- `POST/PUT/DELETE /leads` autenticados — o frontend já está pronto, mas o
  backend só expõe `POST /leads` com `internalAuth` (n8n). Quando os endpoints
  forem registrados, o componente `LeadForm` passa a funcionar end-to-end.
- `GET /products/all` (admin) — o `productController.list` no role admin exige
  `client_whatsapp` em `req.body`. Para listagem geral, o frontend agrega
  resultados percorrendo `/clients` (ver `src/lib/services/admin-products.ts`).
  Recomenda-se criar um endpoint dedicado `/products/all` no backend.

## Theming

- `next-themes` aplicado no `RootLayout`.
- Toggle no rodapé da sidebar (estado persistido pelo `next-themes`).
- Variáveis CSS em `src/app/globals.css` (paleta inspirada no template
  [Cleopatra](https://github.com/moesaid/cleopatra)).

## Estrutura de pastas

```
src/
├── app/
│   ├── (app)/                # rotas autenticadas (sidebar + header)
│   │   ├── dashboard/
│   │   ├── produtos/
│   │   ├── leads/
│   │   ├── perfil/
│   │   └── admin/
│   ├── login/
│   ├── layout.tsx            # raiz com ThemeProvider
│   └── page.tsx              # landing page
├── components/
│   ├── ui/                   # primitivos shadcn (button, input, etc.)
│   └── shared/               # sidebar, header, formulários, dialogs
├── lib/
│   ├── api.ts                # axios + interceptors
│   ├── auth.ts               # JWT helpers
│   ├── services/             # camada de dados por domínio
│   ├── stores/               # zustand stores
│   └── types.ts              # tipos compartilhados
└── middleware.ts             # guarda de rotas (cookie-based)
```

## Build de produção

```bash
npm run build
npm run start
```

A saída do build mostra rotas estáticas (○) e dinâmicas (ƒ).
