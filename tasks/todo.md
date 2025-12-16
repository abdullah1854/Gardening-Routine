# Switch from Gemini to ChatGPT (GPT-4o-mini) with Backend Proxy

## Goal
Replace Gemini API with OpenAI ChatGPT API (gpt-4o-mini), using a Node.js backend proxy to securely read the API key from `.env` file.

## Checklist

### Phase 1: Backend Setup
- [x] Create `package.json` with Express and OpenAI dependencies
- [x] Create `server.js` with Express server that:
  - Serves static files
  - Has `/api/chat` endpoint for OpenAI proxy
  - Reads `OPENAI_API_KEY` from `.env`
- [x] Create `.env.example` template file
- [x] Add `.env` to `.gitignore`

### Phase 2: Frontend Changes
- [x] Update `script.js`:
  - Change API endpoint from Gemini to `/api/chat`
  - Update request/response format for OpenAI
  - Remove API key modal logic (no longer needed)
  - Update error handling for OpenAI errors
- [x] Update `index.html`:
  - Remove API key modal HTML
- [x] Update `style.css`:
  - Remove API key modal styles (optional cleanup)

### Phase 3: Testing & Deployment
- [ ] Test locally
- [ ] Deploy to Hostinger using JS application deployment

## Architecture
```
Client (browser) → /api/chat → server.js → OpenAI API
                                   ↑
                              .env (API key)
```

## Review

### Files Created
- `package.json` - Node.js project config with Express, OpenAI, dotenv dependencies
- `server.js` - Express server with `/api/chat` endpoint
- `.env.example` - Template for API key

### Files Modified
- `.gitignore` - Added `.env` and `node_modules/`
- `script.js` - Replaced Gemini API with `/api/chat` proxy, removed API key modal logic
- `index.html` - Removed API key modal HTML (28 lines removed)
- `style.css` - Removed API key modal styles (kept modal utilities)

### To Run Locally
1. Create `.env` file: `cp .env.example .env`
2. Add your OpenAI API key to `.env`
3. Install dependencies: `npm install`
4. Start server: `npm start`
5. Open http://localhost:3000
