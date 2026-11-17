# CBL Shop — Backend (NestJS)

**Step 2** of the learning project. This is the **monolith**: one NestJS app with two modules.

- **products**: the product list and the stock rules
- **orders**: places orders. It calls the products module directly to check and reduce stock.

Data is kept **in memory** for now: it resets every time the backend restarts.

## Folder structure

```
backend/
├── src/
│   ├── main.ts                      starts the app: /api prefix, validation, port 3000
│   ├── app.module.ts                the root module, imports the products and orders modules
│   ├── app.controller.ts            GET /api/health
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts   GET and POST /api/products, DELETE /api/products/:id
│   │   ├── products.service.ts      the product list and stock rules
│   │   ├── product.entity.ts        what a product looks like
│   │   └── dto/create-product.dto.ts   rules for the POST /api/products body
│   └── orders/
│       ├── orders.module.ts
│       ├── orders.controller.ts     GET and POST /api/orders
│       ├── orders.service.ts        places orders (uses ProductsService)
│       ├── order.entity.ts          what an order looks like
│       └── dto/create-order.dto.ts  rules for the POST /api/orders body
└── test/app.e2e-spec.ts             tests the whole API over HTTP
```

## API

| Method | URL | Request body | Response |
|---|---|---|---|
| GET | `/api/health` | – | `{ "status": "ok" }` |
| GET | `/api/products` | – | list of products |
| POST | `/api/products` | `{ "name", "price", "stock" }` | the new product |
| DELETE | `/api/products/:id` | – | nothing (status 204) |
| GET | `/api/orders` | – | list of orders |
| POST | `/api/orders` | `{ "productId", "quantity" }` | the new order |

Errors use NestJS's standard shape: `{ "statusCode": 400, "message": "...", "error": "Bad Request" }`.

## Run it on your computer

```bash
cd backend
npm install
npm run start:dev
```

Check it at <http://localhost:3000/api/health>. To use the whole app, also start the frontend in a
second terminal (`cd frontend` then `npm run dev`) and open <http://localhost:5173>.

| Command | What it does |
|---|---|
| `npm run start:dev` | runs the API and restarts it when you change a file |
| `npm run build` | compiles the code into `dist/` |
| `npm test` | unit tests |
| `npm run test:e2e` | tests the API over HTTP |
| `npm run lint` | checks the code |

## Run it on the Ubuntu server

Set up the frontend first (see `../frontend/README.md`). Its Nginx config already forwards `/api`
to port 3000.

**1. Install PM2** (only once). PM2 keeps the backend running and restarts it after a reboot.

```bash
sudo npm install -g pm2
```

**2. Get the latest code and build it**

```bash
cd ~/cbl && git pull
cd backend
npm ci
npm run build
```

**3. Start it with PM2**

```bash
pm2 start dist/main.js --name cbl-backend
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"
```

**4. Check it**

```bash
curl http://127.0.0.1:3000/api/health
```

You should see `{"status":"ok"}`. Open `http://<server-ip>/` and the header shows **Backend connected**.

## Update the server after a change

```bash
cd ~/cbl && git pull
cd backend && npm ci && npm run build
pm2 restart cbl-backend
```

Useful PM2 commands: `pm2 status`, `pm2 logs cbl-backend`, `pm2 restart cbl-backend`.
