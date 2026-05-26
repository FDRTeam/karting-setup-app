# Environment Configuration Guide

**Complete reference for all environment variables and configuration.**

---

## .env File Setup

Create a `.env` file in the project root with the following variables:

```bash
# Database Connection (TiDB Cloud)
DATABASE_URL=mysql://rMtoxcFkpbtowTn.root:92Ea6fUFmBKXWO043goc@gateway04.us-east-1.prod.aws.tidbcloud.com:4000/Fftu9JQd2wjiu6sz88Saj8?ssl={"rejectUnauthorized":true}

# API Base URL (for frontend to communicate with backend)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# JWT Secret (for backend authentication)
JWT_SECRET=hbJzhDZAi6LSs36acnEPys

# OAuth Server URL (for user authentication)
OAUTH_SERVER_URL=https://api.manus.im
```

---

## Environment Variable Reference

### Required Variables

| Variable | Purpose | Value |
|----------|---------|-------|
| `DATABASE_URL` | Database connection string | TiDB Cloud MySQL connection |
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3000` (dev) or production URL |
| `JWT_SECRET` | Secret for JWT token signing | Any strong random string |
| `OAUTH_SERVER_URL` | OAuth provider URL | `https://api.manus.im` |

### Optional Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `EXPO_PORT` | Port for Expo Metro bundler | `8081` |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |

---

## Development vs Production

### Development (.env.local)

```bash
DATABASE_URL=mysql://rMtoxcFkpbtowTn.root:92Ea6fUFmBKXWO043goc@gateway04.us-east-1.prod.aws.tidbcloud.com:4000/Fftu9JQd2wjiu6sz88Saj8?ssl={"rejectUnauthorized":true}
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
JWT_SECRET=hbJzhDZAi6LSs36acnEPys
OAUTH_SERVER_URL=https://api.manus.im
NODE_ENV=development
```

### Production (.env.production)

```bash
DATABASE_URL=mysql://your-prod-db:your-prod-password@prod-host:4000/prod-db?ssl={"rejectUnauthorized":true}
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com
JWT_SECRET=your-strong-production-secret
OAUTH_SERVER_URL=https://api.manus.im
NODE_ENV=production
```

---

## Database Configuration

### TiDB Cloud (Current)

**Connection String Format:**
```
mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}
```

**Current Values:**
- **Host:** `gateway04.us-east-1.prod.aws.tidbcloud.com`
- **Port:** `4000`
- **Username:** `rMtoxcFkpbtowTn.root`
- **Password:** `92Ea6fUFmBKXWO043goc`
- **Database:** `Fftu9JQd2wjiu6sz88Saj8`

### Switching Databases

To use a different database:

1. **Update `DATABASE_URL`** in `.env`
2. **Run migrations:**
   ```bash
   pnpm db:push
   ```
3. **Restart dev server:**
   ```bash
   pnpm dev
   ```

---

## API Configuration

### Local Development

```bash
# Backend runs on port 3000
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Frontend connects to backend at:
# http://localhost:3000/trpc/...
```

### Production Deployment

```bash
# Update to your production API domain
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Frontend connects to:
# https://api.yourdomain.com/trpc/...
```

---

## Authentication Configuration

### JWT Secret

```bash
# Used to sign and verify JWT tokens
JWT_SECRET=hbJzhDZAi6LSs36acnEPys

# Generate a new one for production:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### OAuth

```bash
# OAuth server for user authentication
OAUTH_SERVER_URL=https://api.manus.im

# Users can sign in with:
# - Apple ID
# - Google Account
# - GitHub Account
```

---

## Build Configuration

### EAS Build Environment

When building with EAS, you can set environment variables:

```bash
# For iOS build
eas build --platform ios \
  --env EXPO_PUBLIC_API_BASE_URL=https://your-api.com

# For Android build
eas build --platform android \
  --env EXPO_PUBLIC_API_BASE_URL=https://your-api.com
```

### Secrets Management

**For CI/CD pipelines:**

```bash
# Store sensitive values in CI/CD secrets
# Then pass them during build:
eas build --platform ios \
  --env DATABASE_URL=$DATABASE_URL \
  --env JWT_SECRET=$JWT_SECRET
```

---

## Verification

### Test Database Connection

```bash
# From Node.js REPL
node
> const mysql = require('mysql2/promise');
> const pool = mysql.createPool(process.env.DATABASE_URL);
> pool.getConnection().then(conn => {
    console.log('✓ Database connected');
    conn.release();
  }).catch(err => console.error('✗ Connection failed:', err));
```

### Test API Connection

```bash
# From terminal
curl http://localhost:3000/api/health

# Should return 200 OK
```

### Test OAuth

```bash
# OAuth is tested during user sign-in flow
# No manual verification needed
```

---

## Troubleshooting

### "DATABASE_URL not found"

```bash
# Verify .env file exists
ls -la .env

# Verify variable is set
echo $DATABASE_URL

# Reload environment
source .env
```

### "Cannot connect to database"

```bash
# Check connection string format
# Verify host, port, username, password

# Test connection
mysql -h gateway04.us-east-1.prod.aws.tidbcloud.com \
  -u rMtoxcFkpbtowTn.root \
  -p92Ea6fUFmBKXWO043goc \
  -P 4000
```

### "API endpoint not responding"

```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Check EXPO_PUBLIC_API_BASE_URL in .env
# Verify frontend can reach backend
```

### "JWT token invalid"

```bash
# Verify JWT_SECRET is set correctly
echo $JWT_SECRET

# Regenerate if needed
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Best Practices

### Never Commit Secrets

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

### Rotate Credentials Regularly

```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update DATABASE_URL if password changes
# Regenerate API keys if compromised
```

### Use Different Secrets Per Environment

```bash
# Development
.env.local
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Production
.env.production
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Staging
.env.staging
EXPO_PUBLIC_API_BASE_URL=https://staging-api.yourdomain.com
```

---

## Docker Deployment

If deploying in Docker, pass environment variables at runtime:

```bash
docker run \
  -e DATABASE_URL="mysql://..." \
  -e EXPO_PUBLIC_API_BASE_URL="https://..." \
  -e JWT_SECRET="..." \
  -e OAUTH_SERVER_URL="https://..." \
  karting-setup-app
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  EXPO_PUBLIC_API_BASE_URL: ${{ secrets.EXPO_PUBLIC_API_BASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  OAUTH_SERVER_URL: ${{ secrets.OAUTH_SERVER_URL }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: pnpm build
```

---

## Reference

- **Drizzle ORM:** https://orm.drizzle.team
- **TiDB Cloud:** https://tidbcloud.com
- **Expo:** https://docs.expo.dev
- **Node.js:** https://nodejs.org

---

**Last Updated:** 2026-05-19
