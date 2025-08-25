# Betewe Backend

## Deskripsi Proyek
Betewe Backend adalah API untuk aplikasi web diskusi online yang memungkinkan pengguna untuk bertanya, menjawab, memberikan vote, dan berinteraksi dengan konten lainnya. Backend ini dibangun dengan Node.js, Express.js, dan PostgreSQL.

## Fitur Utama
- Autentikasi pengguna (register, login, logout)
- Manajemen pertanyaan (buat, lihat, hapus)
- Manajemen jawaban (buat, lihat, edit, hapus)
- Sistem voting (upvote/downvote untuk pertanyaan dan jawaban)
- Kategori pertanyaan
- Upload foto profil
- Rich text editor dengan dukungan gambar

## Teknologi yang Digunakan
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Autentikasi token
- **Bcrypt** - Hash password
- **Multer** - File upload

## Persiapan

### 1. Install dependencies
```bash
npm install
```

### 2. Buat file `.env` di root project dengan isi:
```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=betewe_db
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

### 3. Siapkan database PostgreSQL
- Buat database sesuai `DB_NAME` di atas.

### 4. Jalankan migrasi dan seeder
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5. Jalankan server
```bash
npm start
# atau
node server.js
```

## Struktur API

### Autentikasi
| Endpoint                         | Method | Deskripsi                          | Auth Required |
| -------------------------------- | ------ | ---------------------------------- | ------------- |
| `/api/auth/register`             | POST   | Mendaftarkan pengguna baru         | ❌             |
| `/api/auth/login`                | POST   | Login pengguna                     | ❌             |
| `/api/auth/user/me`              | GET    | Mendapatkan data pengguna saat ini | ✅             |
| `/api/auth/user/me`              | PUT    | Mengupdate profil pengguna         | ✅             |
| `/api/auth/user/profile-picture` | POST   | Upload foto profil                 | ✅             |
| `/api/auth/user/change-password` | PUT    | Mengganti password                 | ✅             |
| `/api/auth/upload/content-image` | POST   | Upload gambar untuk konten         | ✅             |

### Pertanyaan
| Endpoint                      | Method | Deskripsi                                   | Auth Required |
| ----------------------------- | ------ | ------------------------------------------- | ------------- |
| `/api/questions`              | GET    | Mendapatkan daftar pertanyaan dengan filter | ❌             |
| `/api/questions`              | POST   | Membuat pertanyaan baru                     | ✅             |
| `/api/questions/user/:userId` | GET    | Mendapatkan pertanyaan berdasarkan user     | ❌             |
| `/api/questions/:id`          | GET    | Mendapatkan detail pertanyaan               | ❌             |
| `/api/questions/:id`          | DELETE | Menghapus pertanyaan                        | ✅             |
| `/api/questions/:id/upvote`   | POST   | Upvote pertanyaan                           | ✅             |
| `/api/questions/:id/downvote` | POST   | Downvote pertanyaan                         | ✅             |

### Jawaban
| Endpoint                    | Method | Deskripsi                            | Auth Required |
| --------------------------- | ------ | ------------------------------------ | ------------- |
| `/api/answers`              | GET    | Mendapatkan daftar jawaban           | ❌             |
| `/api/answers`              | POST   | Membuat jawaban baru                 | ✅             |
| `/api/answers/user/:userId` | GET    | Mendapatkan jawaban berdasarkan user | ❌             |
| `/api/answers/:id`          | PUT    | Mengedit jawaban                     | ✅             |
| `/api/answers/:id`          | DELETE | Menghapus jawaban                    | ✅             |
| `/api/answers/:id/upvote`   | POST   | Upvote jawaban                       | ✅             |
| `/api/answers/:id/downvote` | POST   | Downvote jawaban                     | ✅             |

### Kategori
| Endpoint          | Method | Deskripsi                   | Auth Required |
| ----------------- | ------ | --------------------------- | ------------- |
| `/api/categories` | GET    | Mendapatkan daftar kategori | ❌             |

## Dokumentasi API Lengkap

### Autentikasi

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

#### Get User Profile
```http
GET /api/auth/user/me
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "nama_lengkap": "John Doe",
  "jurusan": "Teknik Informatika",
  "foto_profil": "/uploads/profiles/profile-1234567890.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

#### Update Profile
```http
PUT /api/auth/user/me
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "username": "johnupdated",
  "email": "johnupdated@example.com",
  "nama_lengkap": "John Updated",
  "jurusan": "Sistem Informasi"
}
```

#### Upload Profile Picture
```http
POST /api/auth/user/profile-picture
Authorization: Bearer jwt_token
Content-Type: multipart/form-data

file: [image_file]
```

#### Change Password
```http
PUT /api/auth/user/change-password
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "oldPassword": "old_password",
  "newPassword": "new_password123"
}
```

#### Upload Content Image
```http
POST /api/auth/upload/content-image
Authorization: Bearer jwt_token
Content-Type: multipart/form-data

image: [image_file]
```

**Response:**
```json
{
  "url": "/uploads/content/content-1234567890.jpg",
  "filename": "content-1234567890.jpg"
}
```

### Pertanyaan

#### Get Questions (dengan filter)
```http
GET /api/questions?answered=true&category=1&sort=most_votes&search=javascript
```

**Query Parameters:**
- `userId`: Filter berdasarkan user
- `category`: Filter berdasarkan kategori (bisa multiple: `category=1,2,3` atau `category=1&category=2`)
- `answered`: Filter berdasarkan status jawaban (`true`/`false`)
- `sort`: Urutan (`newest`, `oldest`, `most_votes`, `least_votes`)
- `search`: Pencarian berdasarkan title atau content

#### Create Question
```http
POST /api/questions
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "title": "Bagaimana cara menggunakan React?",
  "content": "Saya ingin belajar React tapi bingung memulainya",
  "category_ids": [1, 2]
}
```

#### Get Question by User
```http
GET /api/questions/user/1
```

#### Get Question Detail
```http
GET /api/questions/1
```

#### Delete Question
```http
DELETE /api/questions/1
Authorization: Bearer jwt_token
```

#### Upvote Question
```http
POST /api/questions/1/upvote
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "id": 1,
  "vote": 1,
  "message": "Upvoted"
}
```

#### Downvote Question
```http
POST /api/questions/1/downvote
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "id": 1,
  "vote": -1,
  "message": "Downvoted"
}
```

### Jawaban

#### Get Answers
```http
GET /api/answers?userId=1
```

#### Create Answer
```http
POST /api/answers
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "content": "Untuk menggunakan React, pertama install dulu dengan npm",
  "question_id": 1
}
```

#### Get Answers by User
```http
GET /api/answers/user/1
```

#### Update Answer
```http
PUT /api/answers/1
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "content": "Untuk menggunakan React, pertama install dulu dengan npm install react"
}
```

#### Delete Answer
```http
DELETE /api/answers/1
Authorization: Bearer jwt_token
```

#### Upvote Answer
```http
POST /api/answers/1/upvote
Authorization: Bearer jwt_token
```

#### Downvote Answer
```http
POST /api/answers/1/downvote
Authorization: Bearer jwt_token
```

### Kategori

#### Get Categories
```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "React",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
]
```

## Testing API
Gunakan Postman/Insomnia untuk mencoba endpoint di `http://localhost:3000/api/`

## Deploy
Platform yang direkomendasikan:
- Render.com (gratis dengan PostgreSQL built-in)
- Railway.app (gratis dengan $5 credit/bulan)
- Supabase + Vercel untuk kombinasi terbaik

## Lisensi
MIT

---
Jika ada error, pastikan environment dan database sudah benar.