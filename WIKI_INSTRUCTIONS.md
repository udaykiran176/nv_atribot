
# Atribot Wiki - Setup & Usage Instructions

This project includes a complete Wiki module for electronic component documentation.

## 1. Local Setup

### Prerequisites
- Node.js 18+
- Docker (optional, for DB) or a Neon Postgres URL.

### Installation
1.  Install dependencies:
    ```bash
    npm install
    # Install editor dependencies if you haven't already
    npm install @tiptap/react @tiptap/starter-kit
    ```
2.  Set up environment variables in `.env`:
    ```env
    DATABASE_URL="postgres://user:pass@host/db"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_PUBLIC_WEB_LINK="http://localhost:3000"
    ```
3.  Run database options:
    - **Generate Migration**: `npx drizzle-kit generate`
    - **Push Schema**: `npx drizzle-kit push` (Recommended for prototyping)
4.  Start the dev server:
    ```bash
    npm run dev
    ```

## 2. Features

- **Public Wiki**: Accessible at `/wiki`. Searchable, filterable by category.
- **Admin**: Accessible at `/admin/wiki`. Requires Clerk authentication.
- **Rich Text**: Tiptap editor for content.
- **QR Codes**: Auto-generated for each wiki page for mobile sharing.

## 3. API & cURL Examples

### List Wiki Posts (Public)
```bash
curl "http://localhost:3000/api/wiki?q=sensor&category=Sensors"
```

### Create Wiki Post (Admin)
*Requires Authentication. Use a valid user ID or session cookie in logic, or easier via UI.*
For testing via API directly, you'd need to mock Auth or have a valid Clerk token.
```bash
curl -X POST http://localhost:3000/api/wiki \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ESP32 Module",
    "slug": "esp32-module",
    "category": "Microcontrollers",
    "content": "<p>The ESP32 is a low-cost, low-power system on a chip...</p>",
    "excerpt": "WiFi + Bluetooth SoC",
    "coverImage": "https://example.com/esp32.jpg"
  }'
```

### Update Wiki Post
```bash
curl -X PATCH http://localhost:3000/api/wiki/1 \
  -H "Content-Type: application/json" \
  -d '{ "title": "ESP32-S3 Module" }'
```

### Delete Wiki Post
```bash
curl -X DELETE http://localhost:3000/api/wiki/1
```

## 4. Deployment

### Docker
1.  Build: `docker build -t atribot .`
2.  Run: `docker run -p 3000:3000 -e DATABASE_URL=... atribot`

### Vercel / Neon
1.  Connect your repo to Vercel.
2.  Add environment variables.
3.  Deploy.

## 5. Testing
- Run Jest: `npm run test` (Add test scripts to package.json if missing)
- Run Playwright: `npx playwright test`
