# CBL Shop — Backend (NestJS + MySQL)

This is the **monolith**: one NestJS app with two modules that share **one MySQL database**.

- **products**: the `products` table and the stock rules
- **orders**: the `orders` table. Placing an order calls the products module directly to check and
  reduce stock.

The data is stored with **TypeORM**. Each module registers its own table
(`TypeOrmModule.forFeature`), and the `orders` table has no link to the `products` table. That keeps
the modules separate, which makes it easier to split them into microservices later.

## Folder structure

```
backend/
├── .env.example                     database settings template (copy to .env)
├── src/
│   ├── main.ts                      starts the app: /api prefix, validation, port 3000
│   ├── app.module.ts                reads .env, connects to MySQL, loads the modules
│   ├── app.controller.ts            GET /api/health
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts   GET and POST /api/products, DELETE /api/products/:id
│   │   ├── products.service.ts      reads and writes the products table, stock rules
│   │   ├── product.entity.ts        the products table
│   │   └── dto/create-product.dto.ts   rules for the POST /api/products body
│   └── orders/
│       ├── orders.module.ts
│       ├── orders.controller.ts     GET and POST /api/orders
│       ├── orders.service.ts        places orders (uses ProductsService)
│       ├── order.entity.ts          the orders table
│       └── dto/create-order.dto.ts  rules for the POST /api/orders body
└── test/app.e2e-spec.ts             tests the whole API against the database in .env
```

## Database settings (`backend/.env`)

The app reads its database settings from `backend/.env`. That file is never committed, because it
holds the password. Create it from the template:

```bash
cp .env.example .env
```

| Setting | Meaning |
|---|---|
| `DB_HOST` | MySQL server address (on AWS: the RDS **endpoint**) |
| `DB_PORT` | usually `3306` |
| `DB_USER` / `DB_PASSWORD` | the MySQL user and password |
| `DB_NAME` | the database name, for example `cbl_shop` (the database must already exist) |
| `DB_SSL` | `true` for Amazon RDS (encrypted connection), `false` for a local MySQL |

On first start the app creates the `products` and `orders` tables itself, and adds three sample
products if the products table is empty.

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

You need a MySQL 8 server. For example, install MySQL Community Server, or with Docker:
`docker run -d --name cbl-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=cbl_shop -p 3306:3306 mysql:8.4`.
Put its details in `backend/.env`, then:

```bash
cd backend
npm install
npm run start:dev
```

Check it at <http://localhost:3000/api/health>. For the whole app, also start the frontend in a
second terminal (`cd frontend` then `npm run dev`) and open <http://localhost:5173>.

| Command | What it does |
|---|---|
| `npm run start:dev` | runs the API and restarts it when you change a file |
| `npm run build` | compiles the code into `dist/` |
| `npm test` | unit tests (no database needed) |
| `npm run test:e2e` | tests the API against the database in `.env` |
| `npm run lint` | checks the code |

## Create the MySQL database on Amazon RDS

In the AWS console, go to **RDS → Create database**:

1. **Standard create**, engine **MySQL**, version **MySQL 8.4**.
2. **Templates:** Free tier, or Dev/Test.
3. **Settings:**
   - DB instance identifier: `cbl-shop-db`
   - Master username: `admin`
   - Credentials management: **Self managed**. Set a password and keep it safe.
4. **Instance:** `db.t4g.micro`. **Storage:** 20 GB.
5. **Connectivity:**
   - Choose **Connect to an EC2 compute resource** and pick your EC2 server. AWS then adds the
     security-group rules that let the server reach the database on port 3306.
   - **Public access: No**, so only your server can connect.
6. **Additional configuration → Initial database name:** `cbl_shop`.
7. **Create database.** When the status says **Available** (5 to 10 minutes), open it and copy the
   **Endpoint** from the **Connectivity & security** tab.

## Run it on the Ubuntu server

Set up the frontend first (see `../frontend/README.md`). Its Nginx config already forwards `/api`
to port 3000. These commands assume the code is in `~/cbl`; use your folder if it's different.

**1. Install PM2** (only once). PM2 keeps the backend running and restarts it after a reboot.

```bash
sudo npm install -g pm2
```

**2. Get the latest code and create `.env`**

```bash
cd ~/cbl && git pull
cd backend
cp .env.example .env
nano .env
chmod 600 .env
```

In `nano`, set `DB_HOST` to the RDS endpoint, `DB_USER=admin`, `DB_PASSWORD` to your password,
`DB_NAME=cbl_shop` and `DB_SSL=true`. Save with **Ctrl+O**, **Enter**, then exit with **Ctrl+X**.

**3. Build and start it**

```bash
npm ci
npm run build
pm2 start dist/main.js --name cbl-backend
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"
```

If it is already running from an earlier step, run `pm2 restart cbl-backend` instead of `pm2 start`.

**4. Check it**

```bash
curl http://127.0.0.1:3000/api/products
```

You should see the three sample products. Open `http://<server-ip>/`: the header shows **Backend
connected**, and anything you add now survives restarts.

If it doesn't answer, run `pm2 logs cbl-backend`:

- `Unable to connect to the database. Retrying`: check `DB_HOST` and the security groups (step 5
  of the RDS setup).
- `Access denied`: check `DB_USER` and `DB_PASSWORD`.
- `Unknown database`: set `DB_NAME` to the initial database name you chose.

**Look at the data (optional)**

```bash
sudo apt install -y mysql-client
mysql -h <rds-endpoint> -u admin -p cbl_shop -e "SELECT * FROM products; SELECT * FROM orders;"
```

## Update the server after a change

```bash
cd ~/cbl && git pull
cd backend && npm ci && npm run build
pm2 restart cbl-backend
```

Useful PM2 commands: `pm2 status`, `pm2 logs cbl-backend`, `pm2 restart cbl-backend`.
