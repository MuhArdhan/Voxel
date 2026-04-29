# VOXEL Backend - API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
API menggunakan **Laravel Sanctum** (Bearer Token).

Header yang diperlukan untuk protected routes:
```
Authorization: Bearer {token}
```

---

## 🔓 Public Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Registrasi user baru |
| POST | `/auth/login` | Login, returns token |

**Register payload:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string",
  "phone": "string (optional)"
}
```

**Login payload:**
```json
{ "email": "string", "password": "string" }
```

**Login response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "1|xxxxx",
  "token_type": "Bearer"
}
```

---

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List produk (paginated) |
| GET | `/products/{id}` | Detail produk by ID |
| GET | `/products/slug/{slug}` | Detail produk by slug |

**Query params untuk `/products`:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Cari produk |
| `category` | string | Filter by slug kategori |
| `min_price` | number | Harga minimum |
| `max_price` | number | Harga maksimum |
| `size` | string | Filter by size (XS/S/M/L/XL/XXL) |
| `limited` | boolean | Hanya limited drop |
| `featured` | boolean | Hanya featured |
| `sort_by` | string | `created_at` / `price` / `name` |
| `sort_dir` | string | `asc` / `desc` |
| `per_page` | number | Default: 12 |

---

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List semua kategori aktif |
| GET | `/categories/{id}` | Detail kategori beserta produknya |

---

### Cart (Guest & Authenticated)

> Cart mendukung guest (kirim header `X-Session-ID`) atau authenticated user.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Lihat isi cart |
| POST | `/cart/items` | Tambah item ke cart |
| PUT | `/cart/items/{id}` | Update jumlah item |
| DELETE | `/cart/items/{id}` | Hapus item dari cart |
| DELETE | `/cart` | Kosongkan cart |

**Add item payload:**
```json
{
  "product_id": 1,
  "product_variant_id": 3,
  "quantity": 2
}
```

---

## 🔒 Authenticated User Endpoints

Header: `Authorization: Bearer {token}`

### Auth (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get data user saat ini |
| PUT | `/auth/profile` | Update profil (multipart/form-data untuk avatar) |
| PUT | `/auth/change-password` | Ganti password |

**Update profile payload:**
```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "avatar": "file image (optional, max 2MB)"
}
```

**Change password payload:**
```json
{
  "current_password": "string",
  "password": "string",
  "password_confirmation": "string"
}
```

---

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Riwayat pesanan user (paginated) |
| POST | `/orders/checkout` | Buat pesanan dari cart |
| GET | `/orders/{id}` | Detail pesanan |
| POST | `/orders/{id}/cancel` | Cancel pesanan (status pending only) |

**Checkout payload:**
```json
{
  "shipping_name": "string",
  "shipping_phone": "string",
  "shipping_address": "string",
  "shipping_city": "string",
  "shipping_province": "string",
  "shipping_postal_code": "string",
  "courier": "jne",
  "courier_service": "REG",
  "shipping_cost": 15000,
  "notes": "string (optional)"
}
```

**Order status values:**
- `pending` → `paid` → `processing` → `shipped` → `completed`
- `pending` → `cancelled`

---

## 👑 Admin Endpoints

Header: `Authorization: Bearer {admin_token}`

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Stats, revenue chart 7 hari, recent orders |

**Response:**
```json
{
  "stats": {
    "total_revenue": 12500000,
    "total_orders": 42,
    "total_users": 18,
    "total_products": 10
  },
  "recent_orders": [...],
  "orders_by_status": { "pending": 5, "paid": 3, ... },
  "revenue_chart": [{ "date": "2026-04-29", "revenue": 1200000 }, ...]
}
```

---

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/categories` | List semua kategori (paginated) |
| POST | `/admin/categories` | Buat kategori baru |
| GET | `/admin/categories/{id}` | Detail kategori + produknya |
| PUT | `/admin/categories/{id}` | Update kategori |
| DELETE | `/admin/categories/{id}` | Hapus (jika tidak ada produk) |

**Create/update category payload (multipart/form-data):**
```json
{
  "name": "string",
  "description": "string (optional)",
  "image": "file image (optional, max 2MB)",
  "is_active": true
}
```

---

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | List produk (termasuk soft-deleted) |
| POST | `/admin/products` | Buat produk + variants + images |
| GET | `/admin/products/{id}` | Detail produk |
| PUT | `/admin/products/{id}` | Update data produk |
| DELETE | `/admin/products/{id}` | Soft delete |
| POST | `/admin/products/{id}/restore` | Restore produk yang di-delete |

**Create product payload (multipart/form-data):**
```json
{
  "category_id": 1,
  "name": "string",
  "description": "string",
  "material": "string",
  "price": 259000,
  "discount_price": 199000,
  "sku": "VXL-001",
  "weight": 300,
  "is_limited_drop": false,
  "is_active": true,
  "is_featured": false,
  "variants": [
    { "size": "M", "color": "Black", "stock": 10, "additional_price": 0 },
    { "size": "XL", "color": "Black", "stock": 5, "additional_price": 20000 }
  ],
  "images": ["file1", "file2"],
  "primary_image_index": 0
}
```

#### Variant Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products/{id}/variants` | Tambah variant |
| PUT | `/admin/products/{id}/variants/{vid}` | Update variant (size/color/stock/price) |
| DELETE | `/admin/products/{id}/variants/{vid}` | Hapus variant |

#### Image Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products/{id}/images` | Upload gambar (multipart, field: `images[]`) |
| PUT | `/admin/products/{id}/images/{iid}/primary` | Set gambar sebagai primary |
| DELETE | `/admin/products/{id}/images/{iid}` | Hapus gambar |

---

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | List semua pesanan (paginated) |
| GET | `/admin/orders/{id}` | Detail pesanan + user + items |
| PUT | `/admin/orders/{id}/status` | Update status & nomor resi |

**Query params untuk `/admin/orders`:**
| Param | Description |
|-------|-------------|
| `status` | Filter by status |
| `search` | Cari by order number atau nama user |

**Update status payload:**
```json
{
  "status": "shipped",
  "tracking_number": "JNE12345678"
}
```

---

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List semua user (paginated) |
| GET | `/admin/users/{id}` | Detail user + riwayat orders |
| POST | `/admin/users/{id}/toggle-block` | Toggle block/unblock user |

**Query params untuk `/admin/users`:**
| Param | Description |
|-------|-------------|
| `search` | Cari by nama atau email |

---

## 🧪 Test Accounts (Seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@voxel.id` | `password` |
| User | `user@voxel.id` | `password` |

---

## 📦 Database Schema

```
users
  ├── id, name, email, password
  ├── phone, address, avatar
  ├── role (user|admin), is_blocked
  └── email_verified_at, remember_token, timestamps

categories
  ├── id, name, slug, description
  ├── image, is_active
  └── timestamps

products
  ├── id, category_id (FK)
  ├── name, slug, description, material
  ├── price, discount_price, sku, weight
  ├── is_limited_drop, is_active, is_featured
  └── timestamps, deleted_at (soft delete)

product_variants
  ├── id, product_id (FK)
  ├── size, color, stock
  ├── additional_price
  └── timestamps

product_images
  ├── id, product_id (FK)
  ├── image_path, is_primary, sort_order
  └── timestamps

carts
  ├── id, user_id (FK nullable)
  ├── session_id (for guests)
  └── timestamps

cart_items
  ├── id, cart_id (FK), product_id (FK)
  ├── product_variant_id (FK)
  ├── quantity
  └── timestamps

orders
  ├── id, user_id (FK), order_number
  ├── status (pending|paid|processing|shipped|completed|cancelled)
  ├── subtotal, shipping_cost, total_price
  ├── shipping_name, shipping_phone, shipping_address
  ├── shipping_city, shipping_province, shipping_postal_code
  ├── courier, courier_service, tracking_number
  ├── payment_method, payment_token, payment_url, paid_at
  ├── notes
  └── timestamps, deleted_at (soft delete)

order_items
  ├── id, order_id (FK), product_id (FK)
  ├── product_variant_id (FK)
  ├── product_name, product_sku   ← snapshot saat checkout
  ├── variant_size, variant_color ← snapshot saat checkout
  ├── quantity, unit_price, subtotal
  └── timestamps
```

---

## ⚙️ Environment Variables

```env
# App
APP_NAME=VOXEL
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database (default: SQLite untuk dev)
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql    # untuk MySQL
# DB_CONNECTION=pgsql    # untuk PostgreSQL (recommended production)

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Biteship Shipping API
BITESHIP_API_KEY=
BITESHIP_BASE_URL=https://api.biteship.com
```

---

## 🚀 Cara Menjalankan

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

> Server berjalan di: **http://localhost:8000**
