import { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Network, 
  BarChart3, 
  Dna, 
  Search, 
  Moon, 
  Sun, 
  RefreshCw, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  X, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { preSeededJobs } from './jobsData';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSource, setDataSource] = useState('curated'); // 'curated' | 'live'
  const [liveJobs, setLiveJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Resilient live jobs fetcher
  const fetchLiveJobs = async () => {
    setLoading(true);
    setError(null);
    const targetUrl = 'https://remotive.com/api/remote-jobs';
    
    // We try multiple CORS proxies in order of reliability
    const proxies = [
      (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url) => url // Direct fallback
    ];

    let success = false;
    let fetchedJobs = [];

    for (const getProxyUrl of proxies) {
      const proxyUrl = getProxyUrl(targetUrl);
      try {
        console.log(`Attempting fetch via: ${proxyUrl}`);
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        
        if (data && data.jobs) {
          fetchedJobs = data.jobs;
          success = true;
          break; // Stop trying proxies once successful
        }
      } catch (err) {
        console.warn(`Proxy failed: ${proxyUrl}`, err);
      }
    }

    if (success) {
      const processed = processRemoteJobs(fetchedJobs);
      setLiveJobs(processed);
      setLastSynced(new Date().toLocaleTimeString());
      setDataSource('live');
    } else {
      setError('Could not connect to live job feed. Falling back to verified listings.');
      setDataSource('curated');
    }
    setLoading(false);
  };

  // Cleanse, filter and classify remote jobs to only include London & UK-eligible roles
  const processRemoteJobs = (rawJobs) => {
    const PREDEFINED_SKILLS = [
      'Python', 'PyTorch', 'TensorFlow', 'SQL', 'R', 'C++', 'Java', 'Docker', 
      'AWS', 'GCP', 'Git', 'Excel', 'Tableau', 'Spark', 'Kubernetes', 'LLMs', 
      'Bioinformatics', 'Nextflow', 'RDKit', 'HTML', 'JavaScript', 'React',
      'Statistics', 'NLP', 'Computer Vision', 'Data Mining', 'Machine Learning'
    ];

    const logoColors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', 
      '#8B5CF6', '#EC4899', '#14B8A6', '#06B6D4', '#F43F5E'
    ];

    // Helper to estimate pay band (London Graduate Salaries in GBP)
    const estimatePayBand = (salary, title) => {
      if (salary && salary.trim()) {
        // If the salary is in USD, convert to GBP symbol or display
        if (salary.includes('$')) {
          const usdNum = parseInt(salary.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(usdNum) && usdNum > 10000) {
            // Rough conversion (e.g. $100,000 -> £78,000)
            const gbpMin = Math.round((usdNum * 0.78) / 1000) * 1000;
            return `£${gbpMin.toLocaleString()}`;
          }
        }
        return salary;
      }
      
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('intern') || lowerTitle.includes('co-op')) {
        return '£25 - £45 / hour';
      }
      
      let min = 45000;
      let max = 60000;

      if (lowerTitle.includes('ml') || lowerTitle.includes('machine learning') || lowerTitle.includes('deep learning')) {
        min = 55000;
        max = 75000;
      } else if (lowerTitle.includes('ai') || lowerTitle.includes('artificial intelligence') || lowerTitle.includes('llm')) {
        min = 52000;
        max = 72000;
      } else if (lowerTitle.includes('analyst')) {
        min = 40000;
        max = 52000;
      } else if (lowerTitle.includes('senior')) {
        min = 75000;
        max = 110000;
      }

      return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    };

    // Helper to extract top 3 skills
    const extractSkills = (description, tags, category) => {
      const skillsFound = [];
      const lowerDesc = description.toLowerCase();

      // Check tags first
      if (tags && tags.length > 0) {
        tags.forEach(tag => {
          const matched = PREDEFINED_SKILLS.find(s => s.toLowerCase() === tag.toLowerCase());
          if (matched && !skillsFound.includes(matched)) {
            skillsFound.push(matched);
          }
        });
      }

      // Check description
      PREDEFINED_SKILLS.forEach(skill => {
        if (skillsFound.length >= 3) return;
        const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        if (regex.test(lowerDesc) && !skillsFound.includes(skill)) {
          skillsFound.push(skill);
        }
      });

      // Pad with defaults if less than 3
      const defaults = {
        ai: ['Python', 'LLMs', 'Prompt Engineering'],
        ml: ['Python', 'PyTorch', 'Machine Learning'],
        ds: ['Python', 'SQL', 'Data Science'],
        bio: ['Bioinformatics', 'Python', 'R']
      };

      const categoryDefaults = defaults[category] || ['Python', 'SQL', 'Git'];
      
      while (skillsFound.length < 3) {
        const nextDefault = categoryDefaults.find(s => !skillsFound.includes(s));
        if (nextDefault) {
          skillsFound.push(nextDefault);
        } else {
          skillsFound.push(PREDEFINED_SKILLS[skillsFound.length] || 'Python');
        }
      }

      return skillsFound.slice(0, 3);
    };

    return rawJobs
      .filter(job => {
        const title = job.title.toLowerCase();
        const locationLower = (job.candidate_required_location || '').toLowerCase();
        const descLower = job.description.toLowerCase();

        // 1. Ensure it is a graduate/junior/entry-level role
        const isEntryLevel = 
          title.includes('junior') || 
          title.includes('entry') || 
          title.includes('graduate') || 
          title.includes('grad') || 
          title.includes('associate') || 
          title.includes('intern') || 
          title.includes('co-op') ||
          title.includes('fellow') ||
          title.includes('apprentice') ||
          title.includes('trainee');
          
        // 2. Ensure it is AI, ML, Data Science or Bio AI
        const isTargetDomain = 
          title.includes('ai') || 
          title.includes('artificial intelligence') || 
          title.includes('ml') || 
          title.includes('machine learning') || 
          title.includes('deep learning') || 
          title.includes('neural') ||
          title.includes('data scientist') || 
          title.includes('data science') || 
          title.includes('analyst') || 
          title.includes('analytics') ||
          title.includes('bio') || 
          title.includes('genomic') ||
          title.includes('pharma') || 
          title.includes('clinical') ||
          title.includes('health') ||
          title.includes('medical');

        // 3. Ensure it is in/around London or UK remote eligible (exclude non-UK specific remote limits)
        const isExcludedRegion = 
          locationLower.includes('us') || 
          locationLower.includes('usa') || 
          locationLower.includes('united states') || 
          locationLower.includes('canada') || 
          locationLower.includes('americas') || 
          locationLower.includes('asia') ||
          locationLower.includes('australia') ||
          locationLower.includes('nz') ||
          locationLower.includes('germany') ||
          locationLower.includes('france') ||
          locationLower.includes('japan');

        const isLondonOrUkEligible = 
          locationLower.includes('uk') || 
          locationLower.includes('united kingdom') || 
          locationLower.includes('london') || 
          locationLower.includes('england') || 
          locationLower.includes('gb') || 
          locationLower.includes('great britain') ||
          title.includes('london') || 
          title.includes('uk') || 
          title.includes('united kingdom') || 
          title.includes('cambridge') || 
          title.includes('oxford') || 
          title.includes('reading') ||
          descLower.includes('london') ||
          descLower.includes('united kingdom') ||
          descLower.includes('cambridge') ||
          descLower.includes('oxford') ||
          // Worldwide remote is eligible for London-based candidates
          (locationLower.includes('worldwide') && !isExcludedRegion) ||
          (locationLower === '' && !isExcludedRegion);

        return isEntryLevel && isTargetDomain && isLondonOrUkEligible;
      })
      .map(job => {
        const title = job.title;
        const description = job.description;
        const tags = job.tags || [];

        // Classify Category
        let category = 'ai';
        const lowerTitle = title.toLowerCase();
        const lowerDesc = description.toLowerCase();

        const hasBioKeyword = 
          lowerTitle.includes('bio') || lowerTitle.includes('pharma') || lowerTitle.includes('health') || 
          lowerTitle.includes('medic') || lowerTitle.includes('clinical') || lowerTitle.includes('genomic') || 
          lowerTitle.includes('cancer') || lowerTitle.includes('chemistry') || lowerTitle.includes('biology') ||
          lowerDesc.includes('healthcare') || lowerDesc.includes('pharma') || lowerDesc.includes('medical') || 
          lowerDesc.includes('bioinformatics') || lowerDesc.includes('drug discovery') || lowerDesc.includes('clinical trial');

        if (hasBioKeyword) {
          category = 'bio';
        } else if (
          lowerTitle.includes('ml') || lowerTitle.includes('machine learning') || 
          lowerTitle.includes('deep learning') || lowerTitle.includes('pytorch') || 
          lowerTitle.includes('tensorflow') || lowerTitle.includes('computer vision') || 
          lowerTitle.includes('nlp')
        ) {
          category = 'ml';
        } else if (
          lowerTitle.includes('data science') || lowerTitle.includes('data scientist') || 
          lowerTitle.includes('analyst') || lowerTitle.includes('analytics') || 
          lowerTitle.includes('statistics') || lowerTitle.includes('statistician')
        ) {
          category = 'ds';
        } else {
          category = 'ai';
        }

        // Get details
        const payBand = estimatePayBand(job.salary, title);
        const skills = extractSkills(description, tags, category);
        const companyHash = job.company_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const logoColor = logoColors[companyHash % logoColors.length];
        const logoText = job.company_name.substring(0, 2).toUpperCase();

        return {
          id: `live-${job.id}`,
          title: job.title,
          company: job.company_name,
          logoText,
          logoColor,
          category,
          location: job.candidate_required_location || 'Remote (London/UK)',
          payBand,
          skills,
          postedDate: job.publication_date ? job.publication_date.split('T')[0] : new Date().toISOString().split('T')[0],
          applyUrl: job.url,
          description: job.description
        };
      });
  };

  const getActiveJobs = () => {
    return dataSource === 'curated' ? preSeededJobs : liveJobs;
  };

  // Filter jobs based on search term
  const getFilteredJobs = () => {
    const jobs = getActiveJobs();
    if (!searchTerm.trim()) return jobs;

    const term = searchTerm.toLowerCase();
    return jobs.filter(job => 
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      job.skills.some(skill => skill.toLowerCase().includes(term)) ||
      job.description.toLowerCase().includes(term)
    );
  };

  const filteredJobs = getFilteredJobs();

  // Group by category
  const aiJobs = filteredJobs.filter(j => j.category === 'ai');
  const mlJobs = filteredJobs.filter(j => j.category === 'ml');
  const dsJobs = filteredJobs.filter(j => j.category === 'ds');
  const bioJobs = filteredJobs.filter(j => j.category === 'bio');

  // Helper to safely render markdown/HTML details
  const renderJobDescription = (descHtml) => {
    // If it's a curated job, it uses simple custom markdown. Let's parse it.
    if (!descHtml.startsWith('<')) {
      const formatted = descHtml
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/\- (.*)/g, '<li>$1</li>')
        .replace(/\n\n/g, '<br/>')
        .replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>')
        // Clean double ul tags
        .replace(/<\/ul>\s*<ul>/g, '');
      return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
    }
    // If it's HTML from the API
    return <div dangerouslySetInnerHTML={{ __html: descHtml }} />;
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="app-header">
        <div className="header-top">
          <div className="logo-section">
            <BrainCircuit size={32} />
            <h1 className="logo-text">Aegis Careers</h1>
          </div>
          <button 
            id="theme-toggle-btn"
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <p className="tagline">
          Real-time curated and live matching engine aggregating the highest quality 2026 entry-level and graduate roles in AI, ML, Data Science, and biomedical applications.
        </p>

        {/* Aggregate Stats Bar */}
        <div className="stats-row">
          <div className="stat-card ai">
            <div className="stat-icon"><BrainCircuit size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{dataSource === 'curated' ? preSeededJobs.filter(j=>j.category==='ai').length : liveJobs.filter(j=>j.category==='ai').length}</span>
              <span className="stat-label">AI Engineering</span>
            </div>
          </div>
          <div className="stat-card ml">
            <div className="stat-icon"><Network size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{dataSource === 'curated' ? preSeededJobs.filter(j=>j.category==='ml').length : liveJobs.filter(j=>j.category==='ml').length}</span>
              <span className="stat-label">Machine Learning</span>
            </div>
          </div>
          <div className="stat-card ds">
            <div className="stat-icon"><BarChart3 size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{dataSource === 'curated' ? preSeededJobs.filter(j=>j.category==='ds').length : liveJobs.filter(j=>j.category==='ds').length}</span>
              <span className="stat-label">Data Science</span>
            </div>
          </div>
          <div className="stat-card bio">
            <div className="stat-icon"><Dna size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{dataSource === 'curated' ? preSeededJobs.filter(j=>j.category==='bio').length : liveJobs.filter(j=>j.category==='bio').length}</span>
              <span className="stat-label">Bio & Healthcare</span>
            </div>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <section className="action-bar">
        <div className="search-wrapper">
          <Search size={18} />
          <input 
            id="job-search-input"
            type="text" 
            placeholder="Search roles, companies, or skills (e.g. PyTorch, Pfizer)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="control-buttons">
          <div className="source-toggle">
            <button 
              id="source-curated-btn"
              className={`toggle-btn ${dataSource === 'curated' ? 'active' : ''}`}
              onClick={() => setDataSource('curated')}
            >
              <ShieldCheck size={16} />
              Curated Roles
            </button>
            <button 
              id="source-live-btn"
              className={`toggle-btn ${dataSource === 'live' ? 'active' : ''}`}
              onClick={() => {
                if (liveJobs.length === 0) {
                  fetchLiveJobs();
                } else {
                  setDataSource('live');
                }
              }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Live Remote
            </button>
          </div>

          <button 
            id="sync-now-btn"
            className={`sync-btn ${loading ? 'loading' : ''}`} 
            onClick={fetchLiveJobs}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Syncing...' : 'Sync Live Jobs'}
          </button>

          {lastSynced && (
            <span className="sync-status">
              <Check size={14} color="#10B981" />
              Synced {lastSynced}
            </span>
          )}
        </div>
      </section>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid #ef4444', 
          color: '#f87171', 
          padding: '12px 16px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* 4-Pane Grid Columns */}
      <main className="panes-grid">
        {/* PANE 1: AI */}
        <section className="pane ai" id="pane-ai">
          <div className="pane-header">
            <div className="pane-title-wrapper">
              <BrainCircuit />
              <div>
                <h2 className="pane-title">Artificial Intelligence</h2>
                <p className="pane-subtitle">LLMs, Prompt Eng, Agents, RAG</p>
              </div>
            </div>
            <span className="pane-badge">{aiJobs.length}</span>
          </div>
          <div className="pane-content">
            {aiJobs.length > 0 ? (
              aiJobs.map(job => <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />)
            ) : (
              <EmptyState title="No AI roles found" desc="Try adjusting your filters or sync live remote jobs." />
            )}
          </div>
        </section>

        {/* PANE 2: ML */}
        <section className="pane ml" id="pane-ml">
          <div className="pane-header">
            <div className="pane-title-wrapper">
              <Network />
              <div>
                <h2 className="pane-title">Machine Learning</h2>
                <p className="pane-subtitle">Deep Learning, CV, PyTorch, Pipelines</p>
              </div>
            </div>
            <span className="pane-badge">{mlJobs.length}</span>
          </div>
          <div className="pane-content">
            {mlJobs.length > 0 ? (
              mlJobs.map(job => <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />)
            ) : (
              <EmptyState title="No ML roles found" desc="Try adjusting your filters or sync live remote jobs." />
            )}
          </div>
        </section>

        {/* PANE 3: DATA SCIENCE */}
        <section className="pane ds" id="pane-ds">
          <div className="pane-header">
            <div className="pane-title-wrapper">
              <BarChart3 />
              <div>
                <h2 className="pane-title">Data Science</h2>
                <p className="pane-subtitle">A/B Testing, SQL, Stats, Predictive</p>
              </div>
            </div>
            <span className="pane-badge">{dsJobs.length}</span>
          </div>
          <div className="pane-content">
            {dsJobs.length > 0 ? (
              dsJobs.map(job => <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />)
            ) : (
              <EmptyState title="No DS roles found" desc="Try adjusting your filters or sync live remote jobs." />
            )}
          </div>
        </section>

        {/* PANE 4: BIO / MEDICINE / PHARMA */}
        <section className="pane bio" id="pane-bio">
          <div className="pane-header">
            <div className="pane-title-wrapper">
              <Dna />
              <div>
                <h2 className="pane-title">Bio & Healthcare</h2>
                <p className="pane-subtitle">Pharma, Biotech, Clinical Diagnostics</p>
              </div>
            </div>
            <span className="pane-badge">{bioJobs.length}</span>
          </div>
          <div className="pane-content">
            {bioJobs.length > 0 ? (
              bioJobs.map(job => <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />)
            ) : (
              <EmptyState title="No Healthcare roles found" desc="Try adjusting your filters or sync live remote jobs." />
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Aegis Careers Dashboard. All live jobs aggregated via <a href="https://remotive.com" target="_blank" rel="noopener noreferrer">Remotive API</a>. Designed for clinical and computational excellence.</p>
      </footer>

      {/* Detailed Slide-Up/Overlay Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)} id="job-details-modal">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-company-logo" style={{ backgroundColor: selectedJob.logoColor }}>
                  {selectedJob.logoText}
                </div>
                <div className="modal-title-section">
                  <h2 className="modal-title">{selectedJob.title}</h2>
                  <div className="modal-subtitle">
                    <span>{selectedJob.company}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      {selectedJob.location}
                    </span>
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedJob(null)} aria-label="Close details">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info-bar">
                <div className="info-item">
                  <span className="info-label">ESTIMATED COMPENSATION</span>
                  <span className="info-val pay">{selectedJob.payBand}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">POSTED DATE</span>
                  <span className="info-val">{selectedJob.postedDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">SECTOR TRACK</span>
                  <span className="info-val" style={{ textTransform: 'capitalize' }}>
                    {selectedJob.category === 'bio' ? 'Bio/Healthcare' : selectedJob.category}
                  </span>
                </div>
              </div>

              <div className="modal-skills">
                <span className="modal-section-title">Essential Focus Skills</span>
                <div className="skills-container">
                  {selectedJob.skills.map((skill, i) => (
                    <span key={i} className="skill-pill">{skill}</span>
                  ))}
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />

              <div className="modal-description">
                <span className="modal-section-title" style={{ display: 'block', marginBottom: '15px' }}>Job Description</span>
                <div className="description-text">
                  {renderJobDescription(selectedJob.description)}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="theme-toggle-btn" style={{ padding: '12px 18px', fontSize: '14px', fontWeight: '600' }} onClick={() => setSelectedJob(null)}>
                Close Window
              </button>
              <a 
                href={selectedJob.applyUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="apply-btn"
              >
                Apply on Company Site
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inner Component for Job Cards
function JobCard({ job, onClick }) {
  return (
    <div className="job-card" onClick={onClick}>
      <div className="card-top">
        <div className="company-logo" style={{ backgroundColor: job.logoColor }}>
          {job.logoText}
        </div>
        <div className="job-title-info">
          <h3 className="job-card-title" title={job.title}>{job.title}</h3>
          <span className="job-card-company">{job.company}</span>
        </div>
      </div>

      <div className="pay-band-badge">
        <DollarSign size={13} />
        {job.payBand}
      </div>

      <div className="card-meta-row">
        <div className="card-meta-item">
          <MapPin size={12} />
          <span>{job.location}</span>
        </div>
        <div className="card-meta-item">
          <Calendar size={12} />
          <span>{job.postedDate}</span>
        </div>
      </div>

      <div className="skills-container">
        {job.skills.map((skill, index) => (
          <span key={index} className="skill-pill">{skill}</span>
        ))}
      </div>

      <div className="card-footer">
        <span>Click for full description</span>
        <span className="view-details-txt">
          Read More
          <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}

// Inner Component for Empty State
function EmptyState({ title, desc }) {
  return (
    <div className="empty-state">
      <Briefcase size={32} />
      <span className="empty-state-title">{title}</span>
      <p className="empty-state-desc">{desc}</p>
    </div>
  );
}

export default App;
