# TaskHub Admin

Web qu?n tr? ri?ng cho TaskHub AI, d?ng React/Vite v? Firebase Authentication.

## Ch?y local

```bash
npm install
npm run dev
```

Admin web g?i backend qua `VITE_BACKEND_BASE_URL`. N?u kh?ng c?u h?nh `.env`, m?c ??nh d?ng backend Render hi?n t?i.

## Quy?n admin

T?i kho?n ??ng nh?p ph?i c? document trong Firestore `USERS/{uid}` v?i:

```text
systemRole: "admin"
```

Backend s? x?c th?c Firebase ID token v? ki?m tra quy?n b?ng Firebase Admin SDK tr??c khi tr? d? li?u qu?n tr?.
