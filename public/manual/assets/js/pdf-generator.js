/**
 * PDF Generation Utilities for AbhiStat User Manual
 */

class PDFGenerator {
    constructor() {
        this.pages = [
            { file: 'index.html', title: 'Home', section: 'Introduction' },
            { file: 'getting-started.html', title: 'Getting Started', section: '1' },
            { file: 'data-management.html', title: 'Data Management', section: '2' },
            { file: 'session-management.html', title: 'Session Management', section: '2.3' },
            { file: 'calculated-columns.html', title: 'Calculated Columns', section: '3' },
            { file: 'dependency-modeling.html', title: 'Dependency Modeling', section: '4' },
            { file: 'data-visualization.html', title: 'Data Visualization', section: '5' },
            { file: 'troubleshooting.html', title: 'Troubleshooting & Best Practices', section: '6' },
            { file: 'technical-reference.html', title: 'Technical Reference', section: '7' }
        ];
    }

    /**
     * Generate a complete PDF version of the manual
     */
    async generateCompletePDF() {
        try {
            // Create a new window for PDF generation
            const printWindow = window.open('', '_blank');
            
            // Build the complete HTML document
            const htmlContent = await this.buildCompleteHTML();
            
            // Write content to the new window
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Wait for content to load
            await this.waitForContentLoad(printWindow);
            
            // Trigger print dialog
            printWindow.print();
            
            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return false;
        }
    }

    /**
     * Build complete HTML document for PDF
     */
    async buildCompleteHTML() {
        let completeHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AbhiStat User Manual - Complete Guide</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/print.css">
    <style>
        /* Additional PDF-specific styles */
        .pdf-page {
            page-break-before: always;
        }
        .pdf-page:first-child {
            page-break-before: auto;
        }
        .pdf-section-header {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body class="pdf-preview">
    <div class="main-content">
        <div class="content-wrapper">
`;

        // Add title page
        completeHTML += this.generateTitlePage();

        // Add table of contents
        completeHTML += await this.generateTableOfContents();

        // Add each page content
        for (const page of this.pages) {
            try {
                const content = await this.fetchPageContent(page.file);
                completeHTML += `
                    <div class="pdf-page">
                        <div class="pdf-section-header">
                            <h1>${page.section ? page.section + '. ' : ''}${page.title}</h1>
                        </div>
                        ${content}
                    </div>
                `;
            } catch (error) {
                console.warn(`Could not load content for ${page.file}:`, error);
            }
        }

        completeHTML += `
        </div>
    </div>
</body>
</html>`;

        return completeHTML;
    }

    /**
     * Generate title page
     */
    generateTitlePage() {
        const currentDate = new Date().toLocaleDateString();
        return `
            <div class="pdf-page title-page">
                <div style="text-align: center; margin-top: 100px;">
                    <h1 style="font-size: 36pt; margin-bottom: 20pt; color: #2c3e50;">
                        AbhiStat User Manual
                    </h1>
                    <h2 style="font-size: 18pt; margin-bottom: 40pt; color: #3498db;">
                        Complete Guide to Statistical Analysis Platform
                    </h2>
                    <div style="margin-top: 60pt; font-size: 14pt;">
                        <p><strong>Version:</strong> 1.0</p>
                        <p><strong>Date:</strong> ${currentDate}</p>
                        <p><strong>Organization:</strong> Abhitech</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate table of contents
     */
    async generateTableOfContents() {
        return `
            <div class="pdf-page print-toc">
                <h2>Table of Contents</h2>
                <ul>
                    <li><a href="#introduction">Introduction</a></li>
                    <li><a href="#getting-started">1. Getting Started</a></li>
                    <li><a href="#data-management">2. Data Management</a></li>
                    <li><a href="#session-management">2.3 Session Management</a></li>
                    <li><a href="#calculated-columns">3. Calculated Columns</a></li>
                    <li><a href="#dependency-modeling">4. Dependency Modeling</a></li>
                    <li><a href="#data-visualization">5. Data Visualization</a></li>
                    <li><a href="#troubleshooting">6. Troubleshooting & Best Practices</a></li>
                    <li><a href="#technical-reference">7. Technical Reference</a></li>
                </ul>
            </div>
        `;
    }

    /**
     * Fetch content from a page file
     */
    async fetchPageContent(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            
            // Extract content from the main content area
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const contentArea = doc.querySelector('#content-area');
            
            if (contentArea) {
                // Remove interactive elements
                const interactiveElements = contentArea.querySelectorAll(
                    '.search-container, .breadcrumb-container, .sidebar-toggle, .feedback-section'
                );
                interactiveElements.forEach(el => el.remove());
                
                return contentArea.innerHTML;
            }
            
            return '<p>Content not found</p>';
        } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            return `<p>Error loading content from ${filename}</p>`;
        }
    }

    /**
     * Wait for content to load in print window
     */
    waitForContentLoad(printWindow) {
        return new Promise((resolve) => {
            const checkLoad = () => {
                if (printWindow.document.readyState === 'complete') {
                    // Wait a bit more for images and styles to load
                    setTimeout(resolve, 1000);
                } else {
                    setTimeout(checkLoad, 100);
                }
            };
            checkLoad();
        });
    }

    /**
     * Generate PDF using browser's print functionality
     */
    printCurrentPage() {
        // Add print styles temporarily
        const printLink = document.createElement('link');
        printLink.rel = 'stylesheet';
        printLink.href = 'assets/css/print.css';
        printLink.media = 'print';
        document.head.appendChild(printLink);

        // Trigger print
        window.print();
    }

    /**
     * Download instructions for PDF generation
     */
    showPDFInstructions() {
        const instructions = `
            <div class="alert alert-info">
                <h4>PDF Generation Instructions</h4>
                <ol>
                    <li>Click "Generate Complete PDF" to open the full manual in a new window</li>
                    <li>In the new window, use Ctrl+P (Cmd+P on Mac) to open the print dialog</li>
                    <li>Select "Save as PDF" as the destination</li>
                    <li>Choose appropriate settings:
                        <ul>
                            <li>Paper size: A4</li>
                            <li>Margins: Default</li>
                            <li>Include headers and footers: Yes</li>
                            <li>Background graphics: Yes</li>
                        </ul>
                    </li>
                    <li>Click "Save" to download the PDF</li>
                </ol>
                <p><strong>Note:</strong> For best results, use Chrome or Edge browser for PDF generation.</p>
            </div>
        `;
        
        return instructions;
    }
}

// Initialize PDF generator
const pdfGenerator = new PDFGenerator();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}