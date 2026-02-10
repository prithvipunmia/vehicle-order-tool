# 🚗 Vehicle Order Tool

A Next.js web application for managing vehicle orders.  
Orders are submitted via a simple form and stored in **Google Sheets** for tracking.  
Optional **Firebase integration** adds authentication and real‑time features.  
Deployed seamlessly with **Vercel**.

---

## 📖 Overview

The Vehicle Order Tool streamlines order collection by combining a modern Next.js frontend with Google Sheets as a lightweight backend.  
It’s designed for scalability, portability, and ease of deployment.

---

## 🛠 Tech Stack

- **Frontend:** Next.js (React + TypeScript)
- **Styling:** Tailwind CSS
- **Backend/API:** Next.js API routes
- **Database/Storage:** Google Sheets (primary), Firebase (optional)
- **Hosting:** Vercel
- **Version Control:** Git + GitHub

---

## 🔑 Environment Variables

Environment variables are stored securely in `.env.local` (ignored by Git) and mirrored in Vercel’s dashboard.

### Firebase (public)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Google Sheets (private)

- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`

---

## 📂 Project Structure

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
