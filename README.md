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

## Install Core Packages

After creating/cloning the project, install the core packages required for the application:

```bash
npm install @supabase/ssr @supabase/supabase-js lightweight-charts zod lucide-react date-fns
```

### Packages Installed

| Package                 | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `@supabase/ssr`         | Supabase integration with Next.js SSR and authentication |
| `@supabase/supabase-js` | Supabase database and authentication client              |
| `lightweight-charts`    | Interactive stock/candlestick charts                     |
| `zod`                   | Runtime data and API validation                          |
| `lucide-react`          | UI icons                                                 |
| `date-fns`              | Date and time manipulation                               |

### Important

When setting up the project on another device, **do not install these packages individually**.

Simply run:

```bash
npm install
```

`npm` will automatically install all dependencies listed in `package.json`.

The `package-lock.json` file should also be committed to GitHub so that the project can reproduce the correct dependency versions.

Do **not** commit:

```text
.env.local
node_modules/
```

These contain local/private configuration and generated dependencies.

3. Environment Variables

The .env.local file is intentionally not committed to GitHub because it contains private credentials.

After cloning the project, create:

.env.local

Add the required environment variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

MARKET_DATA_PROVIDER=yahoo
AI_PROVIDER=groq
NEWS_PROVIDER=free

GROQ_API_KEY=
GEMINI_API_KEY=

Additional API keys will be added as the project develops.


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
