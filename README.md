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

## Custom domain setup for Credible Artisans

Use this format for domains:

- `credibleartisans.com`
- `www.credibleartisans.com`

Deployment and DNS steps:

1. Import `RentMaster-GH/credible-artisans-app` into Vercel and deploy.
2. In Vercel project settings, add both custom domains:
   - `credibleartisans.com`
   - `www.credibleartisans.com`
3. In your registrar DNS:
   - Apex/root `credibleartisans.com` → `A` record `76.76.21.21`
   - `www` → `CNAME` `cname.vercel-dns.com`
4. Keep `credibleartisans.com` as canonical and redirect `www` to apex (configured in `vercel.json`).
5. Verify:
   - `https://credibleartisans.com` loads successfully
   - `https://www.credibleartisans.com` permanently redirects to apex
   - SSL certificates are issued for both domains in Vercel
6. Remove old/conflicting DNS records after successful verification.
