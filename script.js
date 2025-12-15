// Fetch jobs from API
let allJobs = [];

// Fallback jobs in case API fails
const fallbackJobs = [
    { title: 'Blockchain Developer', company: 'Crypto.com', salary: '$150k-$180k' },
    { title: 'Smart Contract Engineer', company: 'Uniswap Labs', salary: '$160k-$200k' },
    { title: 'Web3 Product Manager', company: 'Coinbase', salary: '$170k-$210k' },
    { title: 'DeFi Protocol Dev', company: 'Aave', salary: '$155k-$195k' },
    { title: 'Security Researcher', company: 'Trail of Bits', salary: '$140k-$180k' },
    { title: 'Solidity Developer', company: 'OpenZeppelin', salary: '$145k-$185k' },
    { title: 'Backend Engineer', company: 'Alchemy', salary: '$140k-$180k' },
    { title: 'Frontend Developer', company: 'Metamask', salary: '$145k-$185k' },
    { title: 'DevOps Engineer', company: 'Protocol Labs', salary: '$140k-$180k' },
    { title: 'Data Scientist', company: 'Chainanalysis', salary: '$135k-$175k' },
];

// Fetch jobs from API on page load
async function fetchJobs() {
    try {
        const response = await fetch('/api/jobs');
        if (response.ok) {
            const jobs = await response.json();
            allJobs = jobs;
            console.log(`Loaded ${jobs.length} jobs from API`);
            return jobs;
        } else {
            throw new Error('API returned non-ok status');
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        console.log('Using fallback jobs');
        allJobs = generateJobsForGrid(fallbackJobs);
        return allJobs;
    }
}

// Generate 400 jobs from base jobs
function generateJobsForGrid(baseJobs) {
    const jobs = [];
    for (let i = 0; i < 400; i++) {
        const baseJob = baseJobs[i % baseJobs.length];
        const variation = Math.floor(i / baseJobs.length);
        jobs.push({
            title: baseJob.title + (variation > 0 ? ` (${variation + 1})` : ''),
            company: baseJob.company,
            salary: baseJob.salary
        });
    }
    return jobs;
}

function initializeGrid() {
    const gridContainer = document.getElementById('grid');
    const gridSize = 400; // 20x20 = 400 cells
    
    // Create all cells with jobs
    for (let i = 0; i < gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        const job = allJobs[i];
        cell.innerHTML = `
            <div class="job-title">${job.title}</div>
            <div class="job-company">${job.company}</div>
            <div class="job-salary">${job.salary}</div>
        `;
        cell.addEventListener('click', () => alert(`Apply for: ${job.title} at ${job.company}`));
        
        gridContainer.appendChild(cell);
    }
}

// Initialize grid on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch jobs from API first
    await fetchJobs();
    // Then initialize the grid
    initializeGrid();
});
