// AbhiStat User Manual - Navigation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeTableOfContents();
    initializeSmoothScrolling();
    initializeActiveSection();
    initializeSearch();
    initializeBreadcrumbs();
    initializeCrossReferences();
    initializeExpandableToC();
});

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth > 768) {
                document.body.classList.toggle('sidebar-collapsed');
            } else {
                sidebar.classList.toggle('active');
                if (sidebar.classList.contains('active')) {
                    document.addEventListener('click', closeSidebarOnOutsideClick);
                } else {
                    document.removeEventListener('click', closeSidebarOnOutsideClick);
                }
            }
        });
    }

    function closeSidebarOnOutsideClick(event) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('active');
            document.removeEventListener('click', closeSidebarOnOutsideClick);
        }
    }
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Ensure mobile state is cleared when moving to desktop
            sidebar.classList.remove('active');
            document.removeEventListener('click', closeSidebarOnOutsideClick);
        }
    });
}

// Table of Contents functionality
function initializeTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-link');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            tocLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Load content based on the clicked section
            const href = this.getAttribute('href');
            loadSectionContent(href);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Track active section based on scroll position
function initializeActiveSection() {
    const sections = document.querySelectorAll('[id]');
    const tocLinks = document.querySelectorAll('.toc-link');
    
    function updateActiveSection() {
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = '#' + section.id;
            }
        });
        
        // Update active TOC link
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateActiveSection();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Content loading functionality
function loadSectionContent(sectionId) {
    const contentArea = document.getElementById('content-area');
    
    // Content templates for different sections
    const contentTemplates = {
        '#getting-started': getGettingStartedContent(),
        '#account-creation': getAccountCreationContent(),
        '#platform-overview': getPlatformOverviewContent(),
        '#navigation-guide': getNavigationGuideContent(),
        '#data-management': getDataManagementContent(),
        '#file-upload': getFileUploadContent(),
        '#data-validation': getDataValidationContent(),
        '#session-management': getSessionManagementContent(),
        '#calculated-columns': getCalculatedColumnsContent(),
        '#formula-builder': getFormulaBuilderContent(),
        '#functions-operators': getFunctionsOperatorsContent(),
        '#column-management': getColumnManagementContent(),
        '#dependency-modeling': getDependencyModelingContent(),
        '#variable-selection': getVariableSelectionContent(),
        '#drag-drop-interface': getDragDropInterfaceContent(),
        '#statistical-analysis': getStatisticalAnalysisContent(),
        '#data-visualization': getDataVisualizationContent(),
        '#distribution-curves': getDistributionCurvesContent(),
        '#scatter-plots': getScatterPlotsContent(),
        '#multivariate-analysis': getMultivariateAnalysisContent(),
        '#bootstrapping': getBootstrappingContent(),
        '#troubleshooting': getTroubleshootingContent(),
        '#common-issues': getCommonIssuesContent(),
        '#performance-optimization': getPerformanceOptimizationContent(),
        '#data-preparation': getDataPreparationContent(),
        '#technical-reference': getTechnicalReferenceContent(),
        '#system-architecture': getSystemArchitectureContent(),
        '#api-documentation': getApiDocumentationContent(),
        '#administrative-functions': getAdministrativeFunctionsContent()
    };
    
    // Load content with fade effect
    contentArea.style.opacity = '0';
    
    setTimeout(() => {
        const content = contentTemplates[sectionId] || getDefaultContent();
        contentArea.innerHTML = content;
        contentArea.style.opacity = '1';
        
        // Scroll to top of content
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
}

// Content template functions (placeholders for now)
function getGettingStartedContent() {
    return `
        <div id="getting-started">
            <h1>Getting Started</h1>
            <p>Welcome to AbhiStat! This section will guide you through the initial setup and basic navigation of the platform.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getAccountCreationContent() {
    return `
        <div id="account-creation">
            <h1>Account Creation & Authentication</h1>
            <p>Learn how to create an account and authenticate with AbhiStat.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getPlatformOverviewContent() {
    return `
        <div id="platform-overview">
            <h1>Platform Overview</h1>
            <p>Get an overview of AbhiStat's main features and capabilities.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getNavigationGuideContent() {
    return `
        <div id="navigation-guide">
            <h1>Navigation Guide</h1>
            <p>Learn how to navigate through the AbhiStat interface effectively.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDataManagementContent() {
    return `
        <div id="data-management">
            <h1>Data Management</h1>
            <p>Learn how to upload, validate, and manage your data files in AbhiStat.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getFileUploadContent() {
    return `
        <div id="file-upload">
            <h1>File Upload Process</h1>
            <p>Step-by-step guide for uploading your data files.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDataValidationContent() {
    return `
        <div id="data-validation">
            <h1>Data Validation & Preview</h1>
            <p>Understanding data validation and preview features.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getSessionManagementContent() {
    return `
        <div id="session-management">
            <h1>Session Management</h1>
            <p>Learn about session lifecycle and file management.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getCalculatedColumnsContent() {
    return `
        <div id="calculated-columns">
            <h1>Calculated Columns</h1>
            <p>Create custom calculated columns using formulas.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getFormulaBuilderContent() {
    return `
        <div id="formula-builder">
            <h1>Formula Builder Interface</h1>
            <p>Learn how to use the formula builder to create calculated columns.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getFunctionsOperatorsContent() {
    return `
        <div id="functions-operators">
            <h1>Available Functions & Operators</h1>
            <p>Reference guide for all available functions and operators.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getColumnManagementContent() {
    return `
        <div id="column-management">
            <h1>Column Management</h1>
            <p>Manage your calculated columns effectively.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDependencyModelingContent() {
    return `
        <div id="dependency-modeling">
            <h1>Dependency Modeling</h1>
            <p>Create and analyze dependency models between variables.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getVariableSelectionContent() {
    return `
        <div id="variable-selection">
            <h1>Variable Selection</h1>
            <p>Learn how to select variables for dependency analysis.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDragDropInterfaceContent() {
    return `
        <div id="drag-drop-interface">
            <h1>Drag & Drop Interface</h1>
            <p>Use the drag and drop interface for variable organization.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getStatisticalAnalysisContent() {
    return `
        <div id="statistical-analysis">
            <h1>Statistical Analysis</h1>
            <p>Understand the statistical analysis results and interpretation.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDataVisualizationContent() {
    return `
        <div id="data-visualization">
            <h1>Data Visualization</h1>
            <p>Create various types of charts and visualizations.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDistributionCurvesContent() {
    return `
        <div id="distribution-curves">
            <h1>Distribution Curves</h1>
            <p>Create and interpret distribution curve visualizations.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getScatterPlotsContent() {
    return `
        <div id="scatter-plots">
            <h1>Scatter Plots</h1>
            <p>Create and customize scatter plot visualizations.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getMultivariateAnalysisContent() {
    return `
        <div id="multivariate-analysis">
            <h1>Multi-variate Analysis</h1>
            <p>Perform multi-variate statistical analysis and visualization.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getBootstrappingContent() {
    return `
        <div id="bootstrapping">
            <h1>Bootstrapping</h1>
            <p>Use bootstrapping techniques for statistical analysis.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getTroubleshootingContent() {
    return `
        <div id="troubleshooting">
            <h1>Troubleshooting & Best Practices</h1>
            <p>Common issues and best practices for using AbhiStat effectively.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getCommonIssuesContent() {
    return `
        <div id="common-issues">
            <h1>Common Issues</h1>
            <p>Solutions to frequently encountered problems.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getPerformanceOptimizationContent() {
    return `
        <div id="performance-optimization">
            <h1>Performance Optimization</h1>
            <p>Tips for optimizing performance when working with large datasets.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDataPreparationContent() {
    return `
        <div id="data-preparation">
            <h1>Data Preparation Guidelines</h1>
            <p>Best practices for preparing your data before analysis.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getTechnicalReferenceContent() {
    return `
        <div id="technical-reference">
            <h1>Technical Reference</h1>
            <p>Technical documentation for administrators and developers.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getSystemArchitectureContent() {
    return `
        <div id="system-architecture">
            <h1>System Architecture</h1>
            <p>Overview of AbhiStat's system architecture and components.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getApiDocumentationContent() {
    return `
        <div id="api-documentation">
            <h1>API Documentation</h1>
            <p>Technical reference for AbhiStat's API endpoints.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getAdministrativeFunctionsContent() {
    return `
        <div id="administrative-functions">
            <h1>Administrative Functions</h1>
            <p>Administrative tools and maintenance procedures.</p>
            <div class="alert alert-info">
                <strong>Note:</strong> This is a placeholder content. Actual content will be added in subsequent tasks.
            </div>
        </div>
    `;
}

function getDefaultContent() {
    return `
        <div>
            <h1>Welcome to AbhiStat User Manual</h1>
            <p>Select a section from the navigation menu to get started.</p>
            <div class="alert alert-info">
                <strong>Getting Started:</strong> Use the navigation menu on the left to explore different sections of the manual.
            </div>
        </div>
    `;
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const tocItems = document.querySelectorAll('.toc-item');
    
    if (!searchInput) return;
    
    // Search index for better performance
    const searchIndex = buildSearchIndex();
    
    let searchTimeout;
    let selectedResultIndex = -1;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Debounce search to improve performance
        searchTimeout = setTimeout(() => {
            if (query.length < 2) {
                hideSearchResults();
                showAllTocItems();
                selectedResultIndex = -1;
                return;
            }
            
            const results = performSearch(query, searchIndex);
            displaySearchResults(results);
            filterTocItems(query);
            selectedResultIndex = -1;
        }, 300);
    });
    
    // Enhanced keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const searchResults = document.getElementById('searchResults');
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        
        switch (e.key) {
            case 'Escape':
                this.value = '';
                hideSearchResults();
                showAllTocItems();
                selectedResultIndex = -1;
                this.blur();
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (resultItems.length > 0) {
                    selectedResultIndex = Math.min(selectedResultIndex + 1, resultItems.length - 1);
                    updateSelectedResult(resultItems);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (resultItems.length > 0) {
                    selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
                    updateSelectedResult(resultItems);
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedResultIndex >= 0 && resultItems[selectedResultIndex]) {
                    resultItems[selectedResultIndex].click();
                } else if (resultItems.length > 0) {
                    resultItems[0].click();
                }
                break;
                
            case 'Tab':
                if (selectedResultIndex >= 0 && resultItems[selectedResultIndex]) {
                    e.preventDefault();
                    resultItems[selectedResultIndex].click();
                }
                break;
        }
    });
    
    // Update visual selection of search results
    function updateSelectedResult(resultItems) {
        resultItems.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedResultIndex);
        });
        
        // Scroll selected item into view
        if (selectedResultIndex >= 0 && resultItems[selectedResultIndex]) {
            resultItems[selectedResultIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            hideSearchResults();
        }
    });
}

function buildSearchIndex() {
    const sections = [
        { id: 'getting-started', title: 'Getting Started', keywords: ['start', 'begin', 'introduction', 'setup'] },
        { id: 'account-creation', title: 'Account Creation & Authentication', keywords: ['login', 'register', 'auth', 'oauth', 'google'] },
        { id: 'platform-overview', title: 'Platform Overview', keywords: ['overview', 'features', 'capabilities', 'workflow'] },
        { id: 'navigation-guide', title: 'Navigation Guide', keywords: ['navigate', 'menu', 'interface', 'ui'] },
        { id: 'data-management', title: 'Data Management', keywords: ['data', 'files', 'upload', 'manage'] },
        { id: 'file-upload', title: 'File Upload Process', keywords: ['upload', 'csv', 'excel', 'parquet', 'files'] },
        { id: 'data-validation', title: 'Data Validation & Preview', keywords: ['validate', 'preview', 'check', 'errors'] },
        { id: 'session-management', title: 'Session Management', keywords: ['session', 'expire', 'cleanup', 'lifecycle'] },
        { id: 'calculated-columns', title: 'Calculated Columns', keywords: ['calculate', 'formula', 'columns', 'custom'] },
        { id: 'formula-builder', title: 'Formula Builder Interface', keywords: ['formula', 'builder', 'create', 'interface'] },
        { id: 'functions-operators', title: 'Available Functions & Operators', keywords: ['functions', 'operators', 'math', 'reference'] },
        { id: 'column-management', title: 'Column Management', keywords: ['columns', 'manage', 'organize', 'batch'] },
        { id: 'dependency-modeling', title: 'Dependency Modeling', keywords: ['dependency', 'model', 'variables', 'relationships'] },
        { id: 'variable-selection', title: 'Variable Selection', keywords: ['variables', 'select', 'dependent', 'independent'] },
        { id: 'drag-drop-interface', title: 'Drag & Drop Interface', keywords: ['drag', 'drop', 'interface', 'organize'] },
        { id: 'statistical-analysis', title: 'Statistical Analysis', keywords: ['statistics', 'analysis', 'confidence', 'significance'] },
        { id: 'data-visualization', title: 'Data Visualization', keywords: ['charts', 'plots', 'visualize', 'graphs'] },
        { id: 'distribution-curves', title: 'Distribution Curves', keywords: ['distribution', 'curves', 'histogram', 'normal'] },
        { id: 'scatter-plots', title: 'Scatter Plots', keywords: ['scatter', 'plots', 'correlation', 'points'] },
        { id: 'multivariate-analysis', title: 'Multi-variate Analysis', keywords: ['multivariate', 'multiple', 'variables', 'analysis'] },
        { id: 'bootstrapping', title: 'Bootstrapping', keywords: ['bootstrap', 'sampling', 'resampling', 'statistics'] },
        { id: 'troubleshooting', title: 'Troubleshooting & Best Practices', keywords: ['troubleshoot', 'problems', 'issues', 'help'] },
        { id: 'common-issues', title: 'Common Issues', keywords: ['issues', 'problems', 'errors', 'solutions'] },
        { id: 'performance-optimization', title: 'Performance Optimization', keywords: ['performance', 'optimize', 'speed', 'large'] },
        { id: 'data-preparation', title: 'Data Preparation Guidelines', keywords: ['prepare', 'guidelines', 'format', 'clean'] },
        { id: 'technical-reference', title: 'Technical Reference', keywords: ['technical', 'reference', 'admin', 'developer'] },
        { id: 'system-architecture', title: 'System Architecture', keywords: ['architecture', 'system', 'components', 'structure'] },
        { id: 'api-documentation', title: 'API Documentation', keywords: ['api', 'endpoints', 'technical', 'reference'] },
        { id: 'administrative-functions', title: 'Administrative Functions', keywords: ['admin', 'administration', 'maintenance', 'management'] }
    ];
    
    return sections;
}

function performSearch(query, searchIndex) {
    const results = [];
    
    searchIndex.forEach(section => {
        let score = 0;
        
        // Check title match
        if (section.title.toLowerCase().includes(query)) {
            score += 10;
        }
        
        // Check keyword matches
        section.keywords.forEach(keyword => {
            if (keyword.includes(query)) {
                score += 5;
            }
        });
        
        // Check partial matches
        const words = query.split(' ');
        words.forEach(word => {
            if (section.title.toLowerCase().includes(word)) {
                score += 2;
            }
            section.keywords.forEach(keyword => {
                if (keyword.includes(word)) {
                    score += 1;
                }
            });
        });
        
        if (score > 0) {
            results.push({ ...section, score });
        }
    });
    
    return results.sort((a, b) => b.score - a.score).slice(0, 8);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    const resultsHTML = results.map((result, index) => {
        const highlightedTitle = highlightSearchTerm(result.title, query);
        const sectionPath = getSectionPath(result.id);
        const scoreIndicator = getScoreIndicator(result.score);
        
        return `
            <div class="search-result-item" data-section="${result.id}" tabindex="0">
                <div class="search-result-header">
                    <div class="search-result-title">${highlightedTitle}</div>
                    <div class="search-result-score">${scoreIndicator}</div>
                </div>
                <div class="search-result-path">${sectionPath}</div>
                <div class="search-result-keywords">${getMatchingKeywords(result, query)}</div>
            </div>
        `;
    }).join('');
    
    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = 'block';
    
    // Add click and keyboard handlers to search results
    searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.addEventListener('click', function() {
            selectSearchResult(this);
        });
        
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectSearchResult(this);
            }
        });
        
        // Add hover effects
        item.addEventListener('mouseenter', function() {
            selectedResultIndex = index;
            updateSelectedResult(searchResults.querySelectorAll('.search-result-item'));
        });
    });
}

function selectSearchResult(resultItem) {
    const sectionId = resultItem.dataset.section;
    loadSectionContent('#' + sectionId);
    updateActiveLink('#' + sectionId);
    hideSearchResults();
    document.getElementById('searchInput').value = '';
    selectedResultIndex = -1;
}

// Interactive code examples functionality
function initializeInteractiveCodeExamples() {
    // Add copy functionality to all code blocks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-code-btn')) {
            const codeBlock = e.target.closest('.code-example').querySelector('code, pre');
            const textToCopy = codeBlock.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show success feedback
                const originalText = e.target.textContent;
                e.target.textContent = 'Copied!';
                e.target.classList.add('copied');
                
                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                // Fallback for older browsers
                fallbackCopyTextToClipboard(textToCopy, e.target);
            });
        }
    });
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
}

// Enhanced tooltip system for technical terms
function initializeTooltipSystem() {
    // Create tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltip-container';
    tooltipContainer.className = 'tooltip-container';
    document.body.appendChild(tooltipContainer);
    
    // Tooltip definitions
    const tooltipDefinitions = {
        'API': 'Application Programming Interface - A set of protocols and tools for building software applications',
        'CSV': 'Comma-Separated Values - A file format that stores tabular data in plain text',
        'Excel': 'Microsoft Excel spreadsheet format (.xlsx, .xls)',
        'Parquet': 'A columnar storage file format optimized for analytics',
        'OAuth': 'Open Authorization - An open standard for access delegation',
        'FastAPI': 'A modern, fast web framework for building APIs with Python',
        'React': 'A JavaScript library for building user interfaces',
        'Bootstrap': 'A statistical method that relies on random sampling with replacement',
        'Confidence Interval': 'A range of values that likely contains the true population parameter',
        'P-value': 'The probability of obtaining test results at least as extreme as observed',
        'Statistical Significance': 'A result that is unlikely to have occurred by chance alone',
        'Multivariate Analysis': 'Statistical analysis involving multiple variables simultaneously',
        'Distribution Curve': 'A graph showing the probability distribution of a dataset',
        'Scatter Plot': 'A graph using dots to represent values for two different variables',
        'Session': 'A temporary storage of user data and uploaded files',
        'Formula Builder': 'An interface for creating custom calculated columns using mathematical expressions',
        'Dependency Modeling': 'Analysis of relationships between dependent and independent variables',
        'Data Validation': 'The process of ensuring data accuracy and quality',
        'Drag and Drop': 'A user interface method for moving objects by clicking and dragging'
    };
    
    // Add tooltip functionality to elements with data-tooltip attribute
    document.addEventListener('mouseover', function(e) {
        const element = e.target.closest('[data-tooltip]');
        if (element) {
            const tooltipText = element.getAttribute('data-tooltip');
            const definition = tooltipDefinitions[tooltipText] || tooltipText;
            showTooltip(e, definition, element);
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        const element = e.target.closest('[data-tooltip]');
        if (element) {
            hideTooltip();
        }
    });
    
    // Auto-detect technical terms and add tooltips
    document.addEventListener('DOMContentLoaded', function() {
        autoAddTooltips();
    });
    
    function showTooltip(event, text, element) {
        const tooltip = document.getElementById('tooltip-container');
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-text">${text}</div>
                <div class="tooltip-arrow"></div>
            </div>
        `;
        tooltip.style.display = 'block';
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;
        
        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 10;
            tooltip.querySelector('.tooltip-arrow').style.transform = 'rotate(180deg)';
            tooltip.querySelector('.tooltip-arrow').style.top = '-8px';
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.style.opacity = '1';
    }
    
    function hideTooltip() {
        const tooltip = document.getElementById('tooltip-container');
        tooltip.style.opacity = '0';
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 200);
    }
    
    function autoAddTooltips() {
        const contentArea = document.getElementById('content-area') || document.body;
        const textNodes = getTextNodes(contentArea);
        
        textNodes.forEach(node => {
            let text = node.textContent;
            let hasChanges = false;
            
            Object.keys(tooltipDefinitions).forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                if (regex.test(text) && !node.parentElement.hasAttribute('data-tooltip')) {
                    text = text.replace(regex, `<span data-tooltip="${term}" class="tooltip-term">$&</span>`);
                    hasChanges = true;
                }
            });
            
            if (hasChanges) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = text;
                node.parentElement.replaceChild(wrapper, node);
            }
        });
    }
    
    function getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style elements
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE' ||
                        node.parentElement.hasAttribute('data-tooltip')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Only include text nodes with actual content
                    if (node.textContent.trim().length > 0) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }
}

// Enhanced smooth scrolling for table of contents
function initializeEnhancedSmoothScrolling() {
    // Override the existing smooth scrolling with enhanced version
    const tocLinks = document.querySelectorAll('.toc-link');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            
            // Handle external page links
            if (href.includes('.html')) {
                // For multi-page navigation, load the page and scroll to section
                const [page, section] = href.split('#');
                loadPage(page, section);
            } else {
                // For same-page navigation, smooth scroll to section
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    smoothScrollToElement(targetElement);
                    updateActiveLink(href);
                    if (window.updateBreadcrumbs) {
                        window.updateBreadcrumbs(href);
                    }
                }
            }
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
}

function smoothScrollToElement(element, offset = 80) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    // Enhanced smooth scroll with easing
    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1 second
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const easeInOutCubic = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            // Highlight the target element briefly
            element.classList.add('highlight-target');
            setTimeout(() => {
                element.classList.remove('highlight-target');
            }, 2000);
        }
    }
    
    requestAnimationFrame(animation);
}

function loadPage(page, section) {
    // This would be implemented for multi-page navigation
    // For now, we'll focus on single-page navigation
    console.log(`Loading page: ${page}, section: ${section}`);
}

// Initialize all interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing functionality
    initializeSidebar();
    initializeTableOfContents();
    initializeSmoothScrolling();
    initializeActiveSection();
    initializeSearch();
    initializeBreadcrumbs();
    initializeCrossReferences();
    initializeExpandableToC();
    
    // Initialize new interactive features
    initializeInteractiveCodeExamples();
    initializeTooltipSystem();
    initializeEnhancedSmoothScrolling();
});teActiveLink('#' + sectionId);
    hideSearchResults();
    document.getElementById('searchInput').value = '';
    selectedResultIndex = -1;
}

function highlightSearchTerm(text, query) {
    if (!query) return text;
    
    const words = query.split(' ').filter(word => word.length > 0);
    let highlightedText = text;
    
    words.forEach(word => {
        const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getScoreIndicator(score) {
    if (score >= 10) return '★★★';
    if (score >= 5) return '★★☆';
    return '★☆☆';
}

function getMatchingKeywords(result, query) {
    const words = query.split(' ').filter(word => word.length > 0);
    const matchingKeywords = [];
    
    words.forEach(word => {
        result.keywords.forEach(keyword => {
            if (keyword.includes(word) && !matchingKeywords.includes(keyword)) {
                matchingKeywords.push(keyword);
            }
        });
    });
    
    return matchingKeywords.length > 0 
        ? `Keywords: ${matchingKeywords.slice(0, 3).join(', ')}` 
        : '';
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

function filterTocItems(query) {
    const tocItems = document.querySelectorAll('.toc-item');
    
    tocItems.forEach(item => {
        const link = item.querySelector('.toc-link');
        const text = link.textContent.toLowerCase();
        
        if (text.includes(query)) {
            item.style.display = 'block';
            // Expand parent if this is a sub-item
            const parentList = item.closest('.toc-sublist');
            if (parentList) {
                parentList.style.display = 'block';
                const parentItem = parentList.previousElementSibling;
                if (parentItem && parentItem.classList.contains('toc-expandable')) {
                    parentItem.classList.add('expanded');
                }
            }
        } else {
            item.style.display = 'none';
        }
    });
}

function showAllTocItems() {
    const tocItems = document.querySelectorAll('.toc-item');
    tocItems.forEach(item => {
        item.style.display = 'block';
    });
}

function getSectionPath(sectionId) {
    const pathMap = {
        'getting-started': 'Getting Started',
        'account-creation': 'Getting Started > Account Creation',
        'platform-overview': 'Getting Started > Platform Overview',
        'navigation-guide': 'Getting Started > Navigation Guide',
        'data-management': 'Data Management',
        'file-upload': 'Data Management > File Upload',
        'data-validation': 'Data Management > Data Validation',
        'session-management': 'Data Management > Session Management',
        'calculated-columns': 'Calculated Columns',
        'formula-builder': 'Calculated Columns > Formula Builder',
        'functions-operators': 'Calculated Columns > Functions & Operators',
        'column-management': 'Calculated Columns > Column Management',
        'dependency-modeling': 'Dependency Modeling',
        'variable-selection': 'Dependency Modeling > Variable Selection',
        'drag-drop-interface': 'Dependency Modeling > Drag & Drop Interface',
        'statistical-analysis': 'Dependency Modeling > Statistical Analysis',
        'data-visualization': 'Data Visualization',
        'distribution-curves': 'Data Visualization > Distribution Curves',
        'scatter-plots': 'Data Visualization > Scatter Plots',
        'multivariate-analysis': 'Data Visualization > Multi-variate Analysis',
        'bootstrapping': 'Data Visualization > Bootstrapping',
        'troubleshooting': 'Troubleshooting & Best Practices',
        'common-issues': 'Troubleshooting > Common Issues',
        'performance-optimization': 'Troubleshooting > Performance Optimization',
        'data-preparation': 'Troubleshooting > Data Preparation',
        'technical-reference': 'Technical Reference',
        'system-architecture': 'Technical Reference > System Architecture',
        'api-documentation': 'Technical Reference > API Documentation',
        'administrative-functions': 'Technical Reference > Administrative Functions'
    };
    
    return pathMap[sectionId] || 'Unknown';
}

// Breadcrumb navigation
function initializeBreadcrumbs() {
    // Build breadcrumb hierarchy mapping
    const breadcrumbMap = {
        '#getting-started': ['Home', 'Getting Started'],
        '#account-creation': ['Home', 'Getting Started', 'Account Creation & Authentication'],
        '#platform-overview': ['Home', 'Getting Started', 'Platform Overview'],
        '#navigation-guide': ['Home', 'Getting Started', 'Navigation Guide'],
        '#data-management': ['Home', 'Data Management'],
        '#file-upload': ['Home', 'Data Management', 'File Upload Process'],
        '#data-validation': ['Home', 'Data Management', 'Data Validation & Preview'],
        '#session-management': ['Home', 'Data Management', 'Session Management'],
        '#calculated-columns': ['Home', 'Calculated Columns'],
        '#formula-builder': ['Home', 'Calculated Columns', 'Formula Builder Interface'],
        '#functions-operators': ['Home', 'Calculated Columns', 'Available Functions & Operators'],
        '#column-management': ['Home', 'Calculated Columns', 'Column Management'],
        '#dependency-modeling': ['Home', 'Dependency Modeling'],
        '#variable-selection': ['Home', 'Dependency Modeling', 'Variable Selection'],
        '#drag-drop-interface': ['Home', 'Dependency Modeling', 'Drag & Drop Interface'],
        '#statistical-analysis': ['Home', 'Dependency Modeling', 'Statistical Analysis'],
        '#data-visualization': ['Home', 'Data Visualization'],
        '#distribution-curves': ['Home', 'Data Visualization', 'Distribution Curves'],
        '#scatter-plots': ['Home', 'Data Visualization', 'Scatter Plots'],
        '#multivariate-analysis': ['Home', 'Data Visualization', 'Multi-variate Analysis'],
        '#bootstrapping': ['Home', 'Data Visualization', 'Bootstrapping'],
        '#troubleshooting': ['Home', 'Troubleshooting & Best Practices'],
        '#common-issues': ['Home', 'Troubleshooting & Best Practices', 'Common Issues'],
        '#performance-optimization': ['Home', 'Troubleshooting & Best Practices', 'Performance Optimization'],
        '#data-preparation': ['Home', 'Troubleshooting & Best Practices', 'Data Preparation Guidelines'],
        '#technical-reference': ['Home', 'Technical Reference'],
        '#system-architecture': ['Home', 'Technical Reference', 'System Architecture'],
        '#api-documentation': ['Home', 'Technical Reference', 'API Documentation'],
        '#administrative-functions': ['Home', 'Technical Reference', 'Administrative Functions']
    };
    
    // Function to update breadcrumbs based on current section
    window.updateBreadcrumbs = function(sectionId) {
        const breadcrumbContainer = document.getElementById('breadcrumbs');
        if (!breadcrumbContainer) return;
        
        const breadcrumbPath = breadcrumbMap[sectionId] || ['Home'];
        
        // Build breadcrumb HTML
        const breadcrumbHTML = breadcrumbPath.map((item, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            const isHome = item === 'Home';
            
            if (isLast) {
                return `<span class="breadcrumb-item active">${item}</span>`;
            } else if (isHome) {
                return `<a href="#" class="breadcrumb-item breadcrumb-link" data-section="home">${item}</a>`;
            } else {
                // Find the section ID for this breadcrumb item
                const sectionId = findSectionIdByTitle(item);
                return `<a href="#${sectionId}" class="breadcrumb-item breadcrumb-link" data-section="${sectionId}">${item}</a>`;
            }
        }).join('');
        
        breadcrumbContainer.innerHTML = breadcrumbHTML;
        
        // Add click handlers to breadcrumb links
        breadcrumbContainer.querySelectorAll('.breadcrumb-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = this.dataset.section;
                
                if (targetSection === 'home') {
                    // Load home content
                    loadSectionContent('');
                    updateActiveLink('');
                } else {
                    loadSectionContent('#' + targetSection);
                    updateActiveLink('#' + targetSection);
                }
            });
        });
    };
    
    // Helper function to find section ID by title
    function findSectionIdByTitle(title) {
        const titleMap = {
            'Getting Started': 'getting-started',
            'Account Creation & Authentication': 'account-creation',
            'Platform Overview': 'platform-overview',
            'Navigation Guide': 'navigation-guide',
            'Data Management': 'data-management',
            'File Upload Process': 'file-upload',
            'Data Validation & Preview': 'data-validation',
            'Session Management': 'session-management',
            'Calculated Columns': 'calculated-columns',
            'Formula Builder Interface': 'formula-builder',
            'Available Functions & Operators': 'functions-operators',
            'Column Management': 'column-management',
            'Dependency Modeling': 'dependency-modeling',
            'Variable Selection': 'variable-selection',
            'Drag & Drop Interface': 'drag-drop-interface',
            'Statistical Analysis': 'statistical-analysis',
            'Data Visualization': 'data-visualization',
            'Distribution Curves': 'distribution-curves',
            'Scatter Plots': 'scatter-plots',
            'Multi-variate Analysis': 'multivariate-analysis',
            'Bootstrapping': 'bootstrapping',
            'Troubleshooting & Best Practices': 'troubleshooting',
            'Common Issues': 'common-issues',
            'Performance Optimization': 'performance-optimization',
            'Data Preparation Guidelines': 'data-preparation',
            'Technical Reference': 'technical-reference',
            'System Architecture': 'system-architecture',
            'API Documentation': 'api-documentation',
            'Administrative Functions': 'administrative-functions'
        };
        
        return titleMap[title] || '';
    }crumbContainer) return;
        
        const path = getSectionPath(sectionId.replace('#', ''));
        const pathParts = path.split(' > ');
        
        const breadcrumbHTML = pathParts.map((part, index) => {
            if (index === pathParts.length - 1) {
                return `<span class="breadcrumb-item active">${part}</span>`;
            } else {
                return `<span class="breadcrumb-item">${part}</span>`;
            }
        }).join('');
        
        breadcrumbContainer.innerHTML = breadcrumbHTML;
    };
}

function initializeCrossReferences() {
    window.addCrossReference = function(fromSection, toSection, linkText) {
        if (!window.crossReferences) {
            window.crossReferences = {};
        }
        
        if (!window.crossReferences[fromSection]) {
            window.crossReferences[fromSection] = [];
        }
        
        window.crossReferences[fromSection].push({
            to: toSection,
            text: linkText
        });
    };
    
    window.getCrossReferences = function(sectionId) {
        return window.crossReferences ? window.crossReferences[sectionId] || [] : [];
    };
}

// Expandable Table of Contents
function initializeExpandableToC() {
    const expandableItems = document.querySelectorAll('.toc-expandable');
    
    expandableItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('toc-expand-icon')) {
                e.preventDefault();
                this.classList.toggle('expanded');
                
                const sublist = this.nextElementSibling;
                if (sublist && sublist.classList.contains('toc-sublist')) {
                    sublist.style.display = this.classList.contains('expanded') ? 'block' : 'none';
                }
            }
        });
    });
}

// Enhanced content loading with breadcrumbs and cross-references
function loadSectionContent(sectionId) {
    const contentArea = document.getElementById('content-area');
    
    // Content templates for different sections (keeping existing ones)
    const contentTemplates = {
        '#getting-started': getGettingStartedContent(),
        '#account-creation': getAccountCreationContent(),
        '#platform-overview': getPlatformOverviewContent(),
        '#navigation-guide': getNavigationGuideContent(),
        '#data-management': getDataManagementContent(),
        '#file-upload': getFileUploadContent(),
        '#data-validation': getDataValidationContent(),
        '#session-management': getSessionManagementContent(),
        '#calculated-columns': getCalculatedColumnsContent(),
        '#formula-builder': getFormulaBuilderContent(),
        '#functions-operators': getFunctionsOperatorsContent(),
        '#column-management': getColumnManagementContent(),
        '#dependency-modeling': getDependencyModelingContent(),
        '#variable-selection': getVariableSelectionContent(),
        '#drag-drop-interface': getDragDropInterfaceContent(),
        '#statistical-analysis': getStatisticalAnalysisContent(),
        '#data-visualization': getDataVisualizationContent(),
        '#distribution-curves': getDistributionCurvesContent(),
        '#scatter-plots': getScatterPlotsContent(),
        '#multivariate-analysis': getMultivariateAnalysisContent(),
        '#bootstrapping': getBootstrappingContent(),
        '#troubleshooting': getTroubleshootingContent(),
        '#common-issues': getCommonIssuesContent(),
        '#performance-optimization': getPerformanceOptimizationContent(),
        '#data-preparation': getDataPreparationContent(),
        '#technical-reference': getTechnicalReferenceContent(),
        '#system-architecture': getSystemArchitectureContent(),
        '#api-documentation': getApiDocumentationContent(),
        '#administrative-functions': getAdministrativeFunctionsContent()
    };
    
    // Load content with fade effect
    contentArea.style.opacity = '0';
    
    setTimeout(() => {
        const content = contentTemplates[sectionId] || getDefaultContent();
        contentArea.innerHTML = content;
        contentArea.style.opacity = '1';
        
        // Update breadcrumbs
        if (window.updateBreadcrumbs) {
            window.updateBreadcrumbs(sectionId);
        }
        
        // Add cross-references if available
        if (window.addCrossReferences) {
            window.addCrossReferences(sectionId.replace('#', ''));
        }
        
        // Scroll to top of content
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update URL hash without triggering scroll
        history.replaceState(null, null, sectionId);
    }, 150);
}

function addCrossReferencesToContent(sectionId) {
    const crossRefs = window.getCrossReferences ? window.getCrossReferences(sectionId) : [];
    
    if (crossRefs.length > 0) {
        const contentArea = document.getElementById('content-area');
        const crossRefHTML = `
            <div class="cross-references">
                <h4>Related Sections</h4>
                <ul class="cross-ref-list">
                    ${crossRefs.map(ref => `
                        <li><a href="#${ref.to}" class="cross-ref-link">${ref.text}</a></li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        contentArea.innerHTML += crossRefHTML;
        
        // Add click handlers to cross-reference links
        contentArea.querySelectorAll('.cross-ref-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = this.getAttribute('href');
                loadSectionContent(targetSection);
                updateActiveLink(targetSection);
            });
        });
    }
}

function updateActiveLink(sectionId) {
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Cross-references functionality - Complete implementation
function initializeCrossReferences() {
    // Build cross-reference mapping
    const crossRefMap = buildCrossReferenceMap();
    
    // Add cross-reference sections to content
    window.addCrossReferences = function(sectionId) {
        const contentArea = document.getElementById('content-area');
        const crossRefs = crossRefMap[sectionId];
        
        if (crossRefs && crossRefs.length > 0) {
            const crossRefHTML = `
                <div class="cross-references">
                    <h4>Related Sections</h4>
                    <ul class="cross-ref-list">
                        ${crossRefs.map(ref => `
                            <li>
                                <a href="#${ref.id}" class="cross-ref-link" data-section="${ref.id}">
                                    ${ref.title}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            
            contentArea.insertAdjacentHTML('beforeend', crossRefHTML);
            
            // Add click handlers for cross-reference links
            contentArea.querySelectorAll('.cross-ref-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetSection = this.dataset.section;
                    loadSectionContent('#' + targetSection);
                    updateActiveLink('#' + targetSection);
                    if (window.updateBreadcrumbs) {
                        window.updateBreadcrumbs('#' + targetSection);
                    }
                });
            });
        }
    };
}

// Build cross-reference mapping between related sections
function buildCrossReferenceMap() {
    return {
        'getting-started': [
            { id: 'account-creation', title: 'Account Creation & Authentication' },
            { id: 'platform-overview', title: 'Platform Overview' },
            { id: 'navigation-guide', title: 'Navigation Guide' }
        ],
        'account-creation': [
            { id: 'getting-started', title: 'Getting Started' },
            { id: 'common-issues', title: 'Common Issues' },
            { id: 'troubleshooting', title: 'Troubleshooting & Best Practices' }
        ],
        'platform-overview': [
            { id: 'getting-started', title: 'Getting Started' },
            { id: 'data-management', title: 'Data Management' },
            { id: 'calculated-columns', title: 'Calculated Columns' },
            { id: 'dependency-modeling', title: 'Dependency Modeling' },
            { id: 'data-visualization', title: 'Data Visualization' }
        ],
        'navigation-guide': [
            { id: 'getting-started', title: 'Getting Started' },
            { id: 'platform-overview', title: 'Platform Overview' }
        ],
        'data-management': [
            { id: 'file-upload', title: 'File Upload Process' },
            { id: 'data-validation', title: 'Data Validation & Preview' },
            { id: 'session-management', title: 'Session Management' },
            { id: 'data-preparation', title: 'Data Preparation Guidelines' }
        ],
        'file-upload': [
            { id: 'data-management', title: 'Data Management' },
            { id: 'data-validation', title: 'Data Validation & Preview' },
            { id: 'common-issues', title: 'Common Issues' },
            { id: 'data-preparation', title: 'Data Preparation Guidelines' }
        ],
        'data-validation': [
            { id: 'data-management', title: 'Data Management' },
            { id: 'file-upload', title: 'File Upload Process' },
            { id: 'common-issues', title: 'Common Issues' }
        ],
        'session-management': [
            { id: 'data-management', title: 'Data Management' },
            { id: 'common-issues', title: 'Common Issues' },
            { id: 'performance-optimization', title: 'Performance Optimization' }
        ],
        'calculated-columns': [
            { id: 'formula-builder', title: 'Formula Builder Interface' },
            { id: 'functions-operators', title: 'Available Functions & Operators' },
            { id: 'column-management', title: 'Column Management' }
        ],
        'formula-builder': [
            { id: 'calculated-columns', title: 'Calculated Columns' },
            { id: 'functions-operators', title: 'Available Functions & Operators' },
            { id: 'common-issues', title: 'Common Issues' }
        ],
        'functions-operators': [
            { id: 'calculated-columns', title: 'Calculated Columns' },
            { id: 'formula-builder', title: 'Formula Builder Interface' },
            { id: 'column-management', title: 'Column Management' }
        ],
        'column-management': [
            { id: 'calculated-columns', title: 'Calculated Columns' },
            { id: 'functions-operators', title: 'Available Functions & Operators' },
            { id: 'performance-optimization', title: 'Performance Optimization' }
        ],
        'dependency-modeling': [
            { id: 'variable-selection', title: 'Variable Selection' },
            { id: 'drag-drop-interface', title: 'Drag & Drop Interface' },
            { id: 'statistical-analysis', title: 'Statistical Analysis' }
        ],
        'variable-selection': [
            { id: 'dependency-modeling', title: 'Dependency Modeling' },
            { id: 'drag-drop-interface', title: 'Drag & Drop Interface' },
            { id: 'data-preparation', title: 'Data Preparation Guidelines' }
        ],
        'drag-drop-interface': [
            { id: 'dependency-modeling', title: 'Dependency Modeling' },
            { id: 'variable-selection', title: 'Variable Selection' },
            { id: 'statistical-analysis', title: 'Statistical Analysis' }
        ],
        'statistical-analysis': [
            { id: 'dependency-modeling', title: 'Dependency Modeling' },
            { id: 'drag-drop-interface', title: 'Drag & Drop Interface' },
            { id: 'data-visualization', title: 'Data Visualization' }
        ],
        'data-visualization': [
            { id: 'distribution-curves', title: 'Distribution Curves' },
            { id: 'scatter-plots', title: 'Scatter Plots' },
            { id: 'multivariate-analysis', title: 'Multi-variate Analysis' },
            { id: 'bootstrapping', title: 'Bootstrapping' }
        ],
        'distribution-curves': [
            { id: 'data-visualization', title: 'Data Visualization' },
            { id: 'scatter-plots', title: 'Scatter Plots' },
            { id: 'bootstrapping', title: 'Bootstrapping' }
        ],
        'scatter-plots': [
            { id: 'data-visualization', title: 'Data Visualization' },
            { id: 'distribution-curves', title: 'Distribution Curves' },
            { id: 'multivariate-analysis', title: 'Multi-variate Analysis' }
        ],
        'multivariate-analysis': [
            { id: 'data-visualization', title: 'Data Visualization' },
            { id: 'scatter-plots', title: 'Scatter Plots' },
            { id: 'statistical-analysis', title: 'Statistical Analysis' }
        ],
        'bootstrapping': [
            { id: 'data-visualization', title: 'Data Visualization' },
            { id: 'distribution-curves', title: 'Distribution Curves' },
            { id: 'statistical-analysis', title: 'Statistical Analysis' }
        ],
        'troubleshooting': [
            { id: 'common-issues', title: 'Common Issues' },
            { id: 'performance-optimization', title: 'Performance Optimization' },
            { id: 'data-preparation', title: 'Data Preparation Guidelines' }
        ],
        'common-issues': [
            { id: 'troubleshooting', title: 'Troubleshooting & Best Practices' },
            { id: 'account-creation', title: 'Account Creation & Authentication' },
            { id: 'file-upload', title: 'File Upload Process' },
            { id: 'formula-builder', title: 'Formula Builder Interface' }
        ],
        'performance-optimization': [
            { id: 'troubleshooting', title: 'Troubleshooting & Best Practices' },
            { id: 'data-preparation', title: 'Data Preparation Guidelines' },
            { id: 'session-management', title: 'Session Management' }
        ],
        'data-preparation': [
            { id: 'troubleshooting', title: 'Troubleshooting & Best Practices' },
            { id: 'file-upload', title: 'File Upload Process' },
            { id: 'performance-optimization', title: 'Performance Optimization' }
        ],
        'technical-reference': [
            { id: 'system-architecture', title: 'System Architecture' },
            { id: 'api-documentation', title: 'API Documentation' },
            { id: 'administrative-functions', title: 'Administrative Functions' }
        ],
        'system-architecture': [
            { id: 'technical-reference', title: 'Technical Reference' },
            { id: 'api-documentation', title: 'API Documentation' }
        ],
        'api-documentation': [
            { id: 'technical-reference', title: 'Technical Reference' },
            { id: 'system-architecture', title: 'System Architecture' },
            { id: 'administrative-functions', title: 'Administrative Functions' }
        ],
        'administrative-functions': [
            { id: 'technical-reference', title: 'Technical Reference' },
            { id: 'api-documentation', title: 'API Documentation' },
            { id: 'session-management', title: 'Session Management' }
        ]
    };
}

// Initialize URL hash handling for direct navigation
function initializeHashNavigation() {
    // Handle initial page load with hash
    window.addEventListener('load', function() {
        const hash = window.location.hash;
        if (hash && hash !== '#') {
            loadSectionContent(hash);
            updateActiveLink(hash);
            if (window.updateBreadcrumbs) {
                window.updateBreadcrumbs(hash);
            }
        }
    });
    
    // Handle hash changes (back/forward navigation)
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        if (hash && hash !== '#') {
            loadSectionContent(hash);
            updateActiveLink(hash);
            if (window.updateBreadcrumbs) {
                window.updateBreadcrumbs(hash);
            }
        }
    });
}

// Add hash navigation to initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation functionality
    initializeSidebar();
    initializeTableOfContents();
    initializeSmoothScrolling();
    initializeActiveSection();
    initializeSearch();
    initializeBreadcrumbs();
    initializeCrossReferences();
    initializeExpandableToC();
    initializeHashNavigation(); // Add this new initialization
});
// Utility
 function to create interactive code examples
function createInteractiveCodeExample(code, title = 'Code Example', language = '') {
    return `
        <div class="code-example">
            <div class="code-example-header">
                <span class="code-example-title">${title}</span>
                <button class="copy-code-btn" type="button" title="Copy code to clipboard">Copy</button>
            </div>
            <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
        </div>
    `;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to add tooltips to specific terms in content
function addTooltipToTerm(content, term, definition) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    return content.replace(regex, `<span data-tooltip="${definition}" class="tooltip-term">$&</span>`);
}

// Enhanced content templates with interactive features
function getGettingStartedContent() {
    let content = `
        <div id="getting-started" class="chapter">
            <h1>Getting Started with AbhiStat</h1>
            <p>Welcome to <span data-tooltip="AbhiStat" class="tooltip-term">AbhiStat</span>! This comprehensive statistical analysis tool allows you to upload data files, perform calculations, create dependency models, and visualize your data through various statistical methods.</p>
            
            <div class="alert alert-info">
                <strong>Quick Start:</strong> New to AbhiStat? Follow these steps to get started:
                <ol>
                    <li>Create an account or log in</li>
                    <li>Upload your data file</li>
                    <li>Explore the four-step workflow</li>
                    <li>Generate insights from your data</li>
                </ol>
            </div>
            
            <h2>Platform Overview</h2>
            <p>AbhiStat follows a structured four-step workflow:</p>
            
            <div class="workflow-steps">
                <div class="step-container">
                    <h3>Step 1: Data File Checks</h3>
                    <p>Upload and validate your data files. Supported formats include <span data-tooltip="CSV" class="tooltip-term">CSV</span>, <span data-tooltip="Excel" class="tooltip-term">Excel</span>, and <span data-tooltip="Parquet" class="tooltip-term">Parquet</span>.</p>
                </div>
                
                <div class="step-container">
                    <h3>Step 2: Calculated Columns Builder</h3>
                    <p>Create custom calculated columns using the <span data-tooltip="Formula Builder" class="tooltip-term">Formula Builder</span> interface.</p>
                </div>
                
                <div class="step-container">
                    <h3>Step 3: Dependency Model</h3>
                    <p>Define relationships between variables using <span data-tooltip="Dependency Modeling" class="tooltip-term">Dependency Modeling</span>.</p>
                </div>
                
                <div class="step-container">
                    <h3>Step 4: Visualize Data</h3>
                    <p>Create charts and perform statistical analysis including <span data-tooltip="Bootstrap" class="tooltip-term">bootstrapping</span> and <span data-tooltip="Multivariate Analysis" class="tooltip-term">multivariate analysis</span>.</p>
                </div>
            </div>
            
            <h2>Authentication Methods</h2>
            <p>AbhiStat supports two types of users:</p>
            
            <div class="feature-box">
                <h3>Internal Abhitech Users</h3>
                <p>Use your company credentials to access the platform directly.</p>
            </div>
            
            <div class="feature-box">
                <h3>External Users</h3>
                <p>Register for an account or use <span data-tooltip="OAuth" class="tooltip-term">Google OAuth</span> for quick access.</p>
            </div>
        </div>
    `;
    
    return content;
}

function getCalculatedColumnsContent() {
    const formulaExample = `// Basic arithmetic operations
new_column = column_a + column_b

// Statistical functions
average_value = (column_a + column_b + column_c) / 3

// Conditional logic
status = IF(column_a > 100, "High", "Low")

// Mathematical functions
log_value = LOG(column_a)
sqrt_value = SQRT(column_b)`;

    let content = `
        <div id="calculated-columns" class="chapter">
            <h1>Calculated Columns</h1>
            <p>The <span data-tooltip="Formula Builder" class="tooltip-term">Formula Builder</span> allows you to create custom calculated columns using mathematical expressions and functions.</p>
            
            <h2>Formula Builder Interface</h2>
            <p>The interface provides an intuitive way to create formulas with validation and error checking.</p>
            
            ${createInteractiveCodeExample(formulaExample, 'Formula Examples', 'javascript')}
            
            <h2>Available Operators</h2>
            <div class="operator-grid">
                <div class="operator-item">
                    <code>+</code> Addition
                </div>
                <div class="operator-item">
                    <code>-</code> Subtraction
                </div>
                <div class="operator-item">
                    <code>*</code> Multiplication
                </div>
                <div class="operator-item">
                    <code>/</code> Division
                </div>
                <div class="operator-item">
                    <code>^</code> Exponentiation
                </div>
                <div class="operator-item">
                    <code>%</code> Modulo
                </div>
            </div>
            
            <h2>Mathematical Functions</h2>
            <p>AbhiStat supports a wide range of mathematical functions:</p>
            
            <ul>
                <li><code>LOG(x)</code> - Natural logarithm</li>
                <li><code>SQRT(x)</code> - Square root</li>
                <li><code>ABS(x)</code> - Absolute value</li>
                <li><code>ROUND(x, decimals)</code> - Round to specified decimals</li>
                <li><code>MAX(x, y, ...)</code> - Maximum value</li>
                <li><code>MIN(x, y, ...)</code> - Minimum value</li>
                <li><code>IF(condition, true_value, false_value)</code> - Conditional logic</li>
            </ul>
            
            <div class="alert alert-warning">
                <strong>Note:</strong> All formulas are validated in real-time. Invalid syntax will be highlighted with error messages.
            </div>
        </div>
    `;
    
    return content;
}

function getDependencyModelingContent() {
    let content = `
        <div id="dependency-modeling" class="chapter">
            <h1>Dependency Modeling</h1>
            <p><span data-tooltip="Dependency Modeling" class="tooltip-term">Dependency modeling</span> allows you to analyze relationships between variables in your dataset.</p>
            
            <h2>Variable Selection</h2>
            <p>Use the <span data-tooltip="Drag and Drop" class="tooltip-term">drag and drop</span> interface to organize variables into three categories:</p>
            
            <div class="variable-categories">
                <div class="category-box">
                    <h3>Independent Variables</h3>
                    <p>Variables that influence the outcome (predictors)</p>
                </div>
                
                <div class="category-box">
                    <h3>Dependent Variables</h3>
                    <p>Variables that are influenced by others (outcomes)</p>
                </div>
                
                <div class="category-box">
                    <h3>Not Used</h3>
                    <p>Variables excluded from the analysis</p>
                </div>
            </div>
            
            <h2>Statistical Analysis Results</h2>
            <p>The analysis provides several key metrics:</p>
            
            <ul>
                <li><strong><span data-tooltip="Confidence Interval" class="tooltip-term">Confidence Intervals</span>:</strong> Range of values likely to contain the true parameter</li>
                <li><strong><span data-tooltip="P-value" class="tooltip-term">P-values</span>:</strong> Probability of observing results by chance</li>
                <li><strong><span data-tooltip="Statistical Significance" class="tooltip-term">Statistical Significance</span>:</strong> Whether results are likely due to chance</li>
                <li><strong>Mean Differences:</strong> Average change between groups</li>
                <li><strong>Percent Changes:</strong> Relative change as a percentage</li>
            </ul>
            
            <div class="alert alert-info">
                <strong>Interpretation Guide:</strong> Results with p-values less than 0.05 are typically considered statistically significant.
            </div>
        </div>
    `;
    
    return content;
}

function getDataVisualizationContent() {
    let content = `
        <div id="data-visualization" class="chapter">
            <h1>Data Visualization</h1>
            <p>Create compelling visualizations to understand your data patterns and relationships.</p>
            
            <h2>Available Chart Types</h2>
            
            <div class="chart-types">
                <div class="chart-type">
                    <h3><span data-tooltip="Distribution Curve" class="tooltip-term">Distribution Curves</span></h3>
                    <p>Visualize the probability distribution of your data with customizable parameters.</p>
                </div>
                
                <div class="chart-type">
                    <h3><span data-tooltip="Scatter Plot" class="tooltip-term">Scatter Plots</span></h3>
                    <p>Explore relationships between two variables with correlation analysis.</p>
                </div>
                
                <div class="chart-type">
                    <h3><span data-tooltip="Multivariate Analysis" class="tooltip-term">Multi-variate Plots</span></h3>
                    <p>Analyze multiple variables simultaneously in complex visualizations.</p>
                </div>
                
                <div class="chart-type">
                    <h3><span data-tooltip="Bootstrap" class="tooltip-term">Bootstrapping</span></h3>
                    <p>Generate confidence intervals through resampling techniques.</p>
                </div>
            </div>
            
            <h2>Chart Customization</h2>
            <p>All charts support extensive customization options:</p>
            
            <ul>
                <li>Axis labels and titles</li>
                <li>Color schemes and themes</li>
                <li>Data point styling</li>
                <li>Legend positioning</li>
                <li>Export formats (PNG, SVG, PDF)</li>
            </ul>
            
            <div class="alert alert-success">
                <strong>Pro Tip:</strong> Use the interactive chart settings modal to fine-tune your visualizations before exporting.
            </div>
        </div>
    `;
    
    return content;
}

// Update the existing content loading function to use enhanced templates
function loadSectionContent(sectionId) {
    const contentArea = document.getElementById('content-area');
    
    // Enhanced content templates with interactive features
    const contentTemplates = {
        '#getting-started': getGettingStartedContent(),
        '#calculated-columns': getCalculatedColumnsContent(),
        '#dependency-modeling': getDependencyModelingContent(),
        '#data-visualization': getDataVisualizationContent(),
        // Keep other existing templates...
        '#account-creation': getAccountCreationContent(),
        '#platform-overview': getPlatformOverviewContent(),
        '#navigation-guide': getNavigationGuideContent(),
        '#data-management': getDataManagementContent(),
        '#file-upload': getFileUploadContent(),
        '#data-validation': getDataValidationContent(),
        '#session-management': getSessionManagementContent(),
        '#formula-builder': getFormulaBuilderContent(),
        '#functions-operators': getFunctionsOperatorsContent(),
        '#column-management': getColumnManagementContent(),
        '#variable-selection': getVariableSelectionContent(),
        '#drag-drop-interface': getDragDropInterfaceContent(),
        '#statistical-analysis': getStatisticalAnalysisContent(),
        '#distribution-curves': getDistributionCurvesContent(),
        '#scatter-plots': getScatterPlotsContent(),
        '#multivariate-analysis': getMultivariateAnalysisContent(),
        '#bootstrapping': getBootstrappingContent(),
        '#troubleshooting': getTroubleshootingContent(),
        '#common-issues': getCommonIssuesContent(),
        '#performance-optimization': getPerformanceOptimizationContent(),
        '#data-preparation': getDataPreparationContent(),
        '#technical-reference': getTechnicalReferenceContent(),
        '#system-architecture': getSystemArchitectureContent(),
        '#api-documentation': getApiDocumentationContent(),
        '#administrative-functions': getAdministrativeFunctionsContent()
    };
    
    // Load content with fade effect
    contentArea.style.opacity = '0';
    
    setTimeout(() => {
        const content = contentTemplates[sectionId] || getDefaultContent();
        contentArea.innerHTML = content;
        contentArea.style.opacity = '1';
        
        // Update breadcrumbs
        if (window.updateBreadcrumbs) {
            window.updateBreadcrumbs(sectionId);
        }
        
        // Add cross-references if available
        if (window.addCrossReferences) {
            window.addCrossReferences(sectionId.replace('#', ''));
        }
        
        // Re-initialize tooltips for new content
        setTimeout(() => {
            if (window.autoAddTooltips) {
                window.autoAddTooltips();
            }
        }, 100);
        
        // Scroll to top of content
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update URL hash without triggering scroll
        history.replaceState(null, null, sectionId);
    }, 150);
}