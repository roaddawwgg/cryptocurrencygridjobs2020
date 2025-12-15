const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// In-memory cache for jobs
let jobsCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Function to scrape jobs from crypto.jobs
async function scrapeCryptoJobs() {
    try {
        console.log('Scraping crypto.jobs...');
        const response = await axios.get('https://crypto.jobs/jobs', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const jobs = [];
        
        // Parse job listings from crypto.jobs
        $('[data-testid="job-card"], .job-card, .job-item').each((index, element) => {
            if (jobs.length >= 100) return; // Limit to 100 jobs from this source
            
            const title = $(element).find('[data-testid="job-title"], .job-title, h2').first().text().trim();
            const company = $(element).find('[data-testid="company-name"], .company-name, .company').first().text().trim();
            const salary = $(element).find('[data-testid="salary"], .salary').text().trim() || 'Competitive';
            
            if (title && company) {
                jobs.push({ title, company, salary, source: 'crypto.jobs' });
            }
        });
        
        return jobs;
    } catch (error) {
        console.error('Error scraping crypto.jobs:', error.message);
        return [];
    }
}

// Function to scrape jobs from Indeed crypto jobs
async function scrapeIndeedCryptoJobs() {
    try {
        console.log('Scraping Indeed crypto jobs...');
        const response = await axios.get('https://www.indeed.com/jobs?q=cryptocurrency&sort=date', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 5000
        });
        
        const $ = cheerio.load(response.data);
        const jobs = [];
        
        // Parse job listings from Indeed
        $('[data-testid="jobCard"]').each((index, element) => {
            if (jobs.length >= 50) return;
            
            const title = $(element).find('[data-testid="jobTitle"] h2 a span').text().trim();
            const company = $(element).find('[data-testid="companyName"]').text().trim();
            const salary = $(element).find('[data-testid="salary-snippet"]').text().trim() || 'Competitive';
            
            if (title && company) {
                jobs.push({ title, company, salary, source: 'Indeed' });
            }
        });
        
        return jobs;
    } catch (error) {
        console.error('Error scraping Indeed:', error.message);
        return [];
    }
}

// Function to get jobs from multiple sources
async function fetchAllJobs() {
    try {
        const [cryptoJobsResults, indeedResults] = await Promise.all([
            scrapeCryptoJobs(),
            scrapeIndeedCryptoJobs()
        ]);
        
        // Combine and deduplicate
        const allJobs = [...cryptoJobsResults, ...indeedResults];
        const uniqueJobs = Array.from(
            new Map(allJobs.map(job => [job.title.toLowerCase(), job])).values()
        );
        
        return uniqueJobs;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

// Fallback jobs if scraping fails
const fallbackJobs = [
    { title: 'Blockchain Developer', company: 'Crypto.com', salary: '$150k-$180k', source: 'fallback' },
    { title: 'Smart Contract Engineer', company: 'Uniswap Labs', salary: '$160k-$200k', source: 'fallback' },
    { title: 'Web3 Product Manager', company: 'Coinbase', salary: '$170k-$210k', source: 'fallback' },
    { title: 'DeFi Protocol Dev', company: 'Aave', salary: '$155k-$195k', source: 'fallback' },
    { title: 'Security Researcher', company: 'Trail of Bits', salary: '$140k-$180k', source: 'fallback' },
    { title: 'Solidity Developer', company: 'OpenZeppelin', salary: '$145k-$185k', source: 'fallback' },
    { title: 'Backend Engineer', company: 'Alchemy', salary: '$140k-$180k', source: 'fallback' },
    { title: 'Frontend Developer', company: 'Metamask', salary: '$145k-$185k', source: 'fallback' },
    { title: 'DevOps Engineer', company: 'Protocol Labs', salary: '$140k-$180k', source: 'fallback' },
    { title: 'Data Scientist', company: 'Chainanalysis', salary: '$135k-$175k', source: 'fallback' },
    { title: 'Rust Developer', company: 'Solana Labs', salary: '$160k-$200k', source: 'fallback' },
    { title: 'ML Engineer', company: 'Chainalysis', salary: '$150k-$190k', source: 'fallback' },
    { title: 'Community Manager', company: 'MakerDAO', salary: '$90k-$130k', source: 'fallback' },
    { title: 'Technical Writer', company: 'Web3 Foundation', salary: '$100k-$140k', source: 'fallback' },
    { title: 'Business Development', company: 'Curve Finance', salary: '$120k-$160k', source: 'fallback' },
    { title: 'Product Designer', company: 'dYdX', salary: '$130k-$170k', source: 'fallback' },
    { title: 'Legal Counsel', company: 'Kraken', salary: '$140k-$180k', source: 'fallback' },
    { title: 'Compliance Officer', company: 'Gemini', salary: '$120k-$160k', source: 'fallback' },
    { title: 'Risk Manager', company: 'Lido DAO', salary: '$130k-$170k', source: 'fallback' },
    { title: 'Quantitative Analyst', company: 'Yearn Finance', salary: '$150k-$190k', source: 'fallback' }
];

// Generate 400 unique jobs from base jobs
function generateJobsForGrid(baseJobs) {
    const jobs = [];
    const baselist = baseJobs.length > 0 ? baseJobs : fallbackJobs;
    
    for (let i = 0; i < 400; i++) {
        const baseJob = baselist[i % baselist.length];
        const variation = Math.floor(i / baselist.length);
        
        jobs.push({
            title: baseJob.title + (variation > 0 ? ` (${variation + 1})` : ''),
            company: baseJob.company,
            salary: baseJob.salary,
            source: baseJob.source
        });
    }
    
    return jobs;
}

// API Endpoint to get jobs
app.get('/api/jobs', async (req, res) => {
    try {
        // Check if cache is still valid
        if (jobsCache.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
            return res.json(jobsCache);
        }
        
        console.log('Fetching fresh jobs...');
        
        // Try to fetch from web sources
        let scrapedJobs = await fetchAllJobs();
        
        // If scraping returns results, use them; otherwise use fallback
        if (scrapedJobs.length === 0) {
            console.log('Using fallback jobs');
            scrapedJobs = fallbackJobs;
        }
        
        // Generate 400 jobs for the grid
        jobsCache = generateJobsForGrid(scrapedJobs);
        lastFetchTime = Date.now();
        
        res.json(jobsCache);
    } catch (error) {
        console.error('Error in /api/jobs:', error);
        
        // Return fallback jobs on error
        jobsCache = generateJobsForGrid(fallbackJobs);
        res.json(jobsCache);
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', cachedJobs: jobsCache.length, lastUpdate: lastFetchTime });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/jobs`);
});
