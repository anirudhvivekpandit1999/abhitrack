/**
 * Feedback Collection System for AbhiStat User Manual
 */

class FeedbackSystem {
    constructor() {
        this.feedbackData = [];
        this.currentPage = this.getCurrentPageName();
        this.init();
    }

    /**
     * Initialize the feedback system
     */
    init() {
        this.createFeedbackWidget();
        this.loadStoredFeedback();
        this.bindEvents();
    }

    /**
     * Get current page name for feedback context
     */
    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename || 'index.html';
    }

    /**
     * Create feedback widget HTML
     */
    createFeedbackWidget() {
        const feedbackHTML = `
            <div id="feedback-widget" class="feedback-widget">
                <button id="feedback-toggle" class="feedback-toggle" aria-label="Provide feedback">
                    💬 Feedback
                </button>
                
                <div id="feedback-panel" class="feedback-panel" style="display: none;">
                    <div class="feedback-header">
                        <h3>Help us improve this page</h3>
                        <button id="feedback-close" class="feedback-close" aria-label="Close feedback">&times;</button>
                    </div>
                    
                    <form id="feedback-form" class="feedback-form">
                        <div class="feedback-section">
                            <label>How helpful was this page?</label>
                            <div class="rating-buttons">
                                <button type="button" class="rating-btn" data-rating="1">😞 Not helpful</button>
                                <button type="button" class="rating-btn" data-rating="2">😐 Somewhat helpful</button>
                                <button type="button" class="rating-btn" data-rating="3">😊 Very helpful</button>
                            </div>
                        </div>
                        
                        <div class="feedback-section">
                            <label for="feedback-category">What type of feedback?</label>
                            <select id="feedback-category" name="category" required>
                                <option value="">Select category...</option>
                                <option value="content-error">Content Error</option>
                                <option value="missing-info">Missing Information</option>
                                <option value="unclear-instructions">Unclear Instructions</option>
                                <option value="suggestion">Suggestion</option>
                                <option value="technical-issue">Technical Issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="feedback-section">
                            <label for="feedback-text">Your feedback:</label>
                            <textarea id="feedback-text" name="feedback" rows="4" 
                                placeholder="Please describe your feedback in detail..." required></textarea>
                        </div>
                        
                        <div class="feedback-section">
                            <label for="feedback-email">Email (optional):</label>
                            <input type="email" id="feedback-email" name="email" 
                                placeholder="your.email@company.com">
                            <small>Provide email if you'd like a response</small>
                        </div>
                        
                        <div class="feedback-actions">
                            <button type="submit" class="btn btn-primary">Submit Feedback</button>
                            <button type="button" id="feedback-cancel" class="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                    
                    <div id="feedback-success" class="feedback-success" style="display: none;">
                        <h4>Thank you for your feedback!</h4>
                        <p>Your input helps us improve the documentation.</p>
                        <button id="feedback-new" class="btn btn-primary">Submit More Feedback</button>
                    </div>
                </div>
            </div>
        `;

        // Add CSS styles
        const feedbackCSS = `
            <style>
                .feedback-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: var(--font-family, 'Segoe UI', sans-serif);
                }
                
                .feedback-toggle {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .feedback-toggle:hover {
                    background: #2980b9;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
                }
                
                .feedback-panel {
                    position: absolute;
                    bottom: 60px;
                    right: 0;
                    width: 400px;
                    max-width: 90vw;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    border: 1px solid #e1e8ed;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                
                .feedback-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 20px 10px;
                    border-bottom: 1px solid #e1e8ed;
                }
                
                .feedback-header h3 {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 16px;
                }
                
                .feedback-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #95a5a6;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .feedback-close:hover {
                    color: #e74c3c;
                }
                
                .feedback-form {
                    padding: 20px;
                }
                
                .feedback-section {
                    margin-bottom: 20px;
                }
                
                .feedback-section label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #2c3e50;
                    font-size: 14px;
                }
                
                .rating-buttons {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .rating-btn {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s ease;
                    flex: 1;
                    min-width: 100px;
                }
                
                .rating-btn:hover {
                    background: #e9ecef;
                }
                
                .rating-btn.selected {
                    background: #3498db;
                    color: white;
                    border-color: #3498db;
                }
                
                .feedback-section select,
                .feedback-section input,
                .feedback-section textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                }
                
                .feedback-section textarea {
                    resize: vertical;
                    min-height: 80px;
                }
                
                .feedback-section small {
                    color: #6c757d;
                    font-size: 12px;
                    margin-top: 4px;
                    display: block;
                }
                
                .feedback-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                
                .btn-primary {
                    background: #3498db;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #2980b9;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #5a6268;
                }
                
                .feedback-success {
                    padding: 20px;
                    text-align: center;
                }
                
                .feedback-success h4 {
                    color: #27ae60;
                    margin-bottom: 10px;
                }
                
                .feedback-success p {
                    color: #6c757d;
                    margin-bottom: 20px;
                }
                
                @media (max-width: 768px) {
                    .feedback-panel {
                        width: 350px;
                        bottom: 70px;
                        right: -10px;
                    }
                    
                    .rating-buttons {
                        flex-direction: column;
                    }
                    
                    .rating-btn {
                        min-width: auto;
                    }
                }
                
                @media print {
                    .feedback-widget {
                        display: none !important;
                    }
                }
            </style>
        `;

        // Add CSS to head
        document.head.insertAdjacentHTML('beforeend', feedbackCSS);
        
        // Add widget to body
        document.body.insertAdjacentHTML('beforeend', feedbackHTML);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const toggle = document.getElementById('feedback-toggle');
        const panel = document.getElementById('feedback-panel');
        const close = document.getElementById('feedback-close');
        const cancel = document.getElementById('feedback-cancel');
        const form = document.getElementById('feedback-form');
        const ratingBtns = document.querySelectorAll('.rating-btn');
        const newFeedback = document.getElementById('feedback-new');

        // Toggle panel
        toggle.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        // Close panel
        [close, cancel].forEach(btn => {
            btn.addEventListener('click', () => {
                panel.style.display = 'none';
                this.resetForm();
            });
        });

        // Rating buttons
        ratingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                ratingBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // New feedback button
        newFeedback.addEventListener('click', () => {
            this.showForm();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.feedback-widget')) {
                panel.style.display = 'none';
            }
        });
    }

    /**
     * Submit feedback
     */
    async submitFeedback() {
        const form = document.getElementById('feedback-form');
        const formData = new FormData(form);
        const selectedRating = document.querySelector('.rating-btn.selected');
        
        const feedback = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            page: this.currentPage,
            rating: selectedRating ? selectedRating.dataset.rating : null,
            category: formData.get('category'),
            feedback: formData.get('feedback'),
            email: formData.get('email'),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        try {
            // Store feedback locally
            this.storeFeedback(feedback);
            
            // In a real implementation, you would send this to a server
            // await this.sendToServer(feedback);
            
            this.showSuccess();
            
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('There was an error submitting your feedback. Please try again.');
        }
    }

    /**
     * Store feedback locally
     */
    storeFeedback(feedback) {
        let storedFeedback = JSON.parse(localStorage.getItem('abhistat-feedback') || '[]');
        storedFeedback.push(feedback);
        
        // Keep only last 100 feedback items
        if (storedFeedback.length > 100) {
            storedFeedback = storedFeedback.slice(-100);
        }
        
        localStorage.setItem('abhistat-feedback', JSON.stringify(storedFeedback));
        this.feedbackData = storedFeedback;
    }

    /**
     * Load stored feedback
     */
    loadStoredFeedback() {
        this.feedbackData = JSON.parse(localStorage.getItem('abhistat-feedback') || '[]');
    }

    /**
     * Send feedback to server (placeholder)
     */
    async sendToServer(feedback) {
        // This would be implemented to send feedback to your backend
        // For now, we'll just log it
        console.log('Feedback to be sent to server:', feedback);
        
        // Example implementation:
        // const response = await fetch('/api/feedback', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(feedback)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Failed to submit feedback');
        // }
    }

    /**
     * Show success message
     */
    showSuccess() {
        document.getElementById('feedback-form').style.display = 'none';
        document.getElementById('feedback-success').style.display = 'block';
    }

    /**
     * Show form (hide success)
     */
    showForm() {
        document.getElementById('feedback-form').style.display = 'block';
        document.getElementById('feedback-success').style.display = 'none';
        this.resetForm();
    }

    /**
     * Reset form
     */
    resetForm() {
        const form = document.getElementById('feedback-form');
        form.reset();
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    /**
     * Get feedback analytics
     */
    getAnalytics() {
        const analytics = {
            totalFeedback: this.feedbackData.length,
            averageRating: 0,
            categoryBreakdown: {},
            pageBreakdown: {},
            recentFeedback: []
        };

        if (this.feedbackData.length === 0) {
            return analytics;
        }

        // Calculate average rating
        const ratings = this.feedbackData.filter(f => f.rating).map(f => parseInt(f.rating));
        if (ratings.length > 0) {
            analytics.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        }

        // Category breakdown
        this.feedbackData.forEach(feedback => {
            analytics.categoryBreakdown[feedback.category] = 
                (analytics.categoryBreakdown[feedback.category] || 0) + 1;
            
            analytics.pageBreakdown[feedback.page] = 
                (analytics.pageBreakdown[feedback.page] || 0) + 1;
        });

        // Recent feedback (last 10)
        analytics.recentFeedback = this.feedbackData
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        return analytics;
    }

    /**
     * Export feedback data
     */
    exportFeedback() {
        const data = {
            exportDate: new Date().toISOString(),
            analytics: this.getAnalytics(),
            feedback: this.feedbackData
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abhistat-feedback-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize feedback system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystem = new FeedbackSystem();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackSystem;
}