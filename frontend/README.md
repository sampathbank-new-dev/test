# CBL Shop — Frontend (React)

**Step 1** of a learning project: build a monolithic app (React frontend + NestJS backend), then
move it to microservices step by step.

This folder is the **frontend**: a React + TypeScript app created with Vite. It has two pages,
**Products** and **Orders**, and gets all of its data from the backend at `/api`.

## Folder structure

```
frontend/
├── index.html                 the HTML page that loads the app
├── package.json               dependencies and scripts
├── vite.config.ts             Vite settings (the dev server forwards /api to the backend)
├── nginx/cbl-frontend.conf    Nginx settings for the Ubuntu server
├── public/favicon.svg
└── src/
    ├── main.tsx               starts React
    ├── App.tsx                header, tabs and the backend status dot
    ├── api.ts                 every call to the backend lives here
    ├── types.ts               the Product and Order data shapes
    ├── format.ts              price and date formatting
    ├── index.css              styles
    └── pages/
        ├── ProductsPage.tsx   list, add and delete products
        └── OrdersPage.tsx     place orders and list them
```

## The API the backend has to provide (step 2, NestJS)

| Method | URL | Request body | Response |
|---|---|---|---|
| GET | `/api/health` | – | `{ "status": "ok" }` |
| GET | `/api/products` | – | list of products |
| POST | `/api/products` | `{ "name", "price", "stock" }` | the new product |
| DELETE | `/api/products/:id` | – | nothing (status 204) |
| GET | `/api/orders` | – | list of orders |
| POST | `/api/orders` | `{ "productId", "quantity" }` | the new order |

A product looks like `{ id, name, price, stock }`. An order looks like
`{ id, productId, productName, quantity, totalPrice, createdAt }`.

## Run it on your computer

You need Node.js 24 LTS (22.12 or newer works too).

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Until the backend exists, the header shows **Backend not connected**.
That is expected.

## Run it on an Ubuntu server (22.04 / 24.04)

Nginx serves the built files. Node.js is only needed to build them. Run these as your normal sudo
user.

**1. Install Node.js 24 LTS, Nginx, Git and rsync**

```bash
sudo apt update
sudo apt install -y nginx git rsync curl
curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
sudo bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs
node -v
```

**2. Get the code onto the server**

The easiest way is from a Git repository (GitHub, GitLab, Azure DevOps, …):

```bash
git clone <YOUR_REPOSITORY_URL> ~/cbl
cd ~/cbl/frontend
```

<details>
<summary>No Git? Copy it from Windows instead</summary>

In PowerShell, inside the `CBL` folder:

```powershell
tar --exclude=node_modules --exclude=dist -czf frontend.tgz frontend
scp frontend.tgz <user>@<server-ip>:~/
```

Then on the server:

```bash
mkdir -p ~/cbl && tar -xzf ~/frontend.tgz -C ~/cbl
cd ~/cbl/frontend
```
</details>

**3. Build the app** (this creates the `dist/` folder)

```bash
npm ci
npm run build
```

**4. Copy the build to the folder Nginx serves**

```bash
sudo mkdir -p /var/www/cbl-frontend
sudo rsync -a --delete dist/ /var/www/cbl-frontend/
```

The files are copied out of your home folder because Nginx is not allowed to read home folders on
Ubuntu.

**5. Configure Nginx**

```bash
sudo cp nginx/cbl-frontend.conf /etc/nginx/sites-available/cbl-frontend
sudo ln -sf /etc/nginx/sites-available/cbl-frontend /etc/nginx/sites-enabled/cbl-frontend
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

**6. Open the firewall** (allow SSH first, so you don't lock yourself out)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

On a cloud VM (AWS, Azure, GCP, …), also open port 80 in its security group or firewall.

**7. Check it**

Open `http://<server-ip>/` in a browser. You should see **CBL Shop** with "Backend not connected".

## Update the server after a change

```bash
cd ~/cbl && git pull
cd frontend && npm ci && npm run build
sudo rsync -a --delete dist/ /var/www/cbl-frontend/
```

## Next step

Step 2 is the NestJS backend: a `backend/` folder with an app on port 3000 that uses `/api` as its
route prefix. Nginx is already set up to forward `/api` to it, so the frontend will connect
without any changes.
