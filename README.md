# Cryptocurrency Jobs Ticker - 20x20 Grid

A dynamic web app displaying 400 cryptocurrency job listings in a 20x20 grid with green text on black background. Jobs are scraped from cryptocurrency job websites and dynamically populated.

## Features

- **20x20 Grid**: 400 cells displaying unique crypto job listings
- **Dynamic Scraping**: Automatically fetches jobs from crypto.jobs and Indeed
- **Fallback Jobs**: Uses pre-loaded jobs if scraping fails
- **Green-on-Black Theme**: Authentic "hacker" aesthetics with neon green text
- **Responsive Design**: Works on desktop and mobile
- **Clickable Cells**: Click any job to apply

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

### Development Mode

Run with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /api/jobs` - Fetches all 400 jobs for the grid
- `GET /api/health` - Server health check
- `GET /` - Serves the main HTML page

## How It Works

1. **Backend (server.js)**:
   - Scrapes cryptocurrency job websites
   - Caches results for 1 hour
   - Generates 400 unique jobs by rotating through base listings
   - Serves via REST API

2. **Frontend (script.js)**:
   - Fetches jobs from `/api/jobs` endpoint
   - Falls back to pre-loaded jobs if API fails
   - Dynamically renders 20x20 grid
   - Handles cell clicks for job applications

3. **Styling (styles.css)**:
   - Green (#00ff00) text on black (#000) background
   - Hover effects with glowing borders
   - Grid layout with 20 columns

## Job Sources

- **crypto.jobs**: Primary source for Web3 jobs
- **Indeed**: Cryptocurrency job listings
- **Fallback**: 20 pre-loaded jobs if scraping fails

## Configuration

Edit `.env` file to configure:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `OPENAI_API_KEY`: For future AI job enhancement

## Styling

The grid features:
- Neon green text: `#00ff00`
- Black background: `#000`
- Green borders: `#00ff00`
- Hover glow effects
- Monospace font for authenticity

## Troubleshooting

**Jobs not loading?**
- Check if server is running: `curl http://localhost:3000/api/health`
- Check browser console for errors
- Falls back to pre-loaded jobs automatically

**Port already in use?**
- Change `PORT` in `.env` or command line:
  ```bash
  PORT=3001 npm start
  ```

## Future Enhancements

- AI job description enhancement with OpenAI
- Real-time job updates every hour
- Filter/search functionality
- Save favorite jobs
- Direct application links
- Multi-language support
# cryptocurrencygridjobs2020
# cryptocurrencygridjobs2020
