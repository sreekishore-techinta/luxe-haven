# Lishan Sarees — Luxe Haven

A premium e-commerce platform for authentic handcrafted silk sarees and ethnic fashion.

## Project Overview

**Lishan Sarees** offers a curated collection of luxury silk sarees including Kanjivaram, Banarasi, Mysore Crepe, and designer ethnic wear — delivered across India with a seamless shopping experience.

## Technology Stack

This project is built with:

- **Vite** — Fast development server and build tool
- **TypeScript** — Type-safe JavaScript
- **React** — UI component library
- **shadcn-ui** — Accessible component primitives
- **Tailwind CSS** — Utility-first styling
- **PHP + MySQL** — Backend API and database (via XAMPP)

## Local Development

### Prerequisites

- Node.js & npm installed
- XAMPP installed and running (Apache + MySQL)

### Setup

```sh
# Step 1: Install dependencies
npm install

# Step 2: Start the development server
npm run dev
```

The app runs on `http://localhost:8080` by default.

### Backend (API)

The PHP API lives in the `/api` directory and is served via XAMPP at `http://localhost/luxe-haven/api/`.

## Build for Production

```sh
npm run build
```

The production-ready files will be in the `/dist` directory.

## Project Structure

```
luxe-haven/
├── src/             # React frontend source
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page-level components
│   └── data/        # Static data & types
├── api/             # PHP backend APIs
├── public/          # Static assets (favicon, logo, images)
├── uploads/         # Product image uploads
└── dist/            # Production build output
```
