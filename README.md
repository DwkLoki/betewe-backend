# Betewe Backend

## Persiapan

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Buat file `.env` di root project dengan isi:**
   ```env
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=betewe_db
   DB_HOST=localhost
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Siapkan database PostgreSQL**
   - Buat database sesuai `DB_NAME` di atas.

4. **Jalankan migrasi dan seeder**
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. **Jalankan server**
   ```bash
   npm start
   # atau
   node server.js
   ```

## Testing API
Gunakan Postman/Insomnia untuk mencoba endpoint di `http://localhost:3000/api/`

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Questions: `GET /api/questions`, dst.

---

Jika ada error, pastikan environment dan database sudah benar. 