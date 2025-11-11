# Portfolio

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://www.sweber.dev)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/tLJ14Pyvivh)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://www.sweber.dev](https://www.sweber.dev)**

## Environment variables

Configure the contact form email delivery by creating a `.env.local` file based on `.env.local.example` and providing the SMTP credentials for your mail provider:

```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="Portfolio Contact <no-reply@example.com>"
CONTACT_RECIPIENT=your-destination@example.com
```

> Deployments on Vercel should define the same variables in the project settings so the API route can deliver emails in production.


### Contact rate limiting

The contact endpoint enforces a daily quota of three successful submissions per browser (tracked via cookie) and per IP address. Clients that exceed the quota receive a `429` response with a `Retry-After` header indicating when the limit resets.

## Contact success animation

The contact form success modal loads a Lottie animation from `public/animations/checkmark.lottie`. Drop your exported `.lottie` file into that directory (or replace the placeholder file path with a CDN URL if you prefer hosting it elsewhere). The player automatically keeps the final frame visible and falls back to an icon if the asset is missing or fails to load.


## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/tLJ14Pyvivh](https://v0.app/chat/projects/tLJ14Pyvivh)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
