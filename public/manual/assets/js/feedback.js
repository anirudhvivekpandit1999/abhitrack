

class FeedbackSystem {
    constructor() {
        this.feedbackData = [];
        this.currentPage = this.getCurrentPageName();
        this.isPanelOpen = false;
        this.isSubmitting = false;
        this.init();
    }

    
    init() {
        this.createFeedbackWidget();
        this.loadStoredFeedback();
        this.bindEvents();
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename || 'index.html';
    }


    createFeedbackWidget() {
        const feedbackHTML = `
            <div id="feedback-widget" class="feedback-widget" role="region" aria-label="Feedback">
                <button id="feedback-toggle" class="feedback-toggle" aria-label="Provide feedback" aria-expanded="false" aria-controls="feedback-panel">
                    <span class="icon" aria-hidden="true">💬</span>
                    <span>Feedback</span>
                </button>

                <div id="feedback-panel" class="feedback-panel" role="dialog" aria-modal="true" aria-labelledby="feedback-title" hidden>
                    <div class="feedback-header">
                        <h3 id="feedback-title">Help us improve this page</h3>
                        <button id="feedback-close" class="feedback-close" aria-label="Close feedback panel">&times;</button>
                    </div>

                    <div id="feedback-error" class="feedback-error" role="alert" aria-live="polite"></div>

                    <form id="feedback-form" class="feedback-form" novalidate>
                        <div class="feedback-section">
                            <label>How helpful was this page? <span class="required">*</span></label>
                            <div class="rating-buttons" role="radiogroup" aria-label="Rating">
                                <button type="button" class="rating-btn" data-rating="1" role="radio" aria-label="Not helpful">
                                    <span class="rating-icon" aria-hidden="true">😞</span>
                                    <span>Not helpful</span>
                                </button>
                                <button type="button" class="rating-btn" data-rating="2" role="radio" aria-label="Somewhat helpful">
                                    <span class="rating-icon" aria-hidden="true">😐</span>
                                    <span>Somewhat helpful</span>
                                </button>
                                <button type="button" class="rating-btn" data-rating="3" role="radio" aria-label="Very helpful">
                                    <span class="rating-icon" aria-hidden="true">😊</span>
                                    <span>Very helpful</span>
                                </button>
                            </div>
                        </div>

                        <div class="feedback-section">
                            <label for="feedback-category">What type of feedback? <span class="required">*</span></label>
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
                            <label for="feedback-text">Your feedback: <span class="required">*</span></label>
                            <textarea id="feedback-text" name="feedback" rows="4"
                                placeholder="Please describe your feedback in detail..." required></textarea>
                        </div>

                        <div class="feedback-section">
                            <label for="feedback-email">Email (optional):</label>
                            <input type="email" id="feedback-email" name="email"
                                placeholder="your.email@company.com">
                            <small>Provide email if you'd like a response</small>
                        </div>

                        <div class="feedback-loading" id="feedback-loading">
                            <span class="spinner" aria-hidden="true"></span>
                            <span>Submitting your feedback...</span>
                        </div>

                        <div class="feedback-actions">
                            <button type="submit" class="feedback-btn feedback-btn-primary" id="feedback-submit">
                                <span>Submit Feedback</span>
                            </button>
                            <button type="button" id="feedback-cancel" class="feedback-btn feedback-btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>

                    <div id="feedback-success" class="feedback-success" hidden>
                        <div class="success-icon" aria-hidden="true">✅</div>
                        <h4>Thank you for your feedback!</h4>
                        <p>Your input helps us improve the documentation.</p>
                        <button id="feedback-new" class="feedback-btn feedback-btn-primary">
                            <span>Submit More Feedback</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', feedbackHTML);
    }

    
    bindEvents() {
        const toggle = document.getElementById('feedback-toggle');
        const panel = document.getElementById('feedback-panel');
        const close = document.getElementById('feedback-close');
        const cancel = document.getElementById('feedback-cancel');
        const form = document.getElementById('feedback-form');
        const ratingBtns = document.querySelectorAll('.rating-btn');
        const newFeedback = document.getElementById('feedback-new');
        const submitBtn = document.getElementById('feedback-submit');

        toggle.addEventListener('click', () => this.togglePanel());

        [close, cancel].forEach(btn => {
            btn.addEventListener('click', () => this.closePanel());
        });

        ratingBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectRating(btn));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        newFeedback.addEventListener('click', () => this.showForm());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen) {
                this.closePanel();
            }
        });

        document.addEventListener('click', (e) => {
            if (this.isPanelOpen && !e.target.closest('.feedback-widget')) {
                this.closePanel();
            }
        });

        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        submitBtn.addEventListener('click', () => {
            if (this.isSubmitting) {
                e.preventDefault();
            }
        });
    }

    
    togglePanel() {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        const panel = document.getElementById('feedback-panel');
        const toggle = document.getElementById('feedback-toggle');

        panel.classList.add('open');
        panel.hidden = false;
        panel.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        this.isPanelOpen = true;

        const firstFocusable = panel.querySelector('button, input, select, textarea');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    closePanel() {
        const panel = document.getElementById('feedback-panel');
        const toggle = document.getElementById('feedback-toggle');

        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        this.isPanelOpen = false;

        this.resetForm();
    }

    
    selectRating(btn) {
        const ratingBtns = document.querySelectorAll('.rating-btn');
        ratingBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    
    async submitFeedback() {
        const form = document.getElementById('feedback-form');
        const submitBtn = document.getElementById('feedback-submit');
        const loading = document.getElementById('feedback-loading');
        const errorBox = document.getElementById('feedback-error');

        const selectedRating = document.querySelector('.rating-btn.selected');
        const category = form.querySelector('#feedback-category').value;
        const feedbackText = form.querySelector('#feedback-text').value.trim();

        if (!selectedRating || !category || !feedbackText) {
            this.showError('Please complete all required fields (rating, category, and feedback).');
            return;
        }

        this.isSubmitting = true;
        submitBtn.disabled = true;
        loading.classList.add('active');
        errorBox.classList.remove('active');

        const formData = new FormData(form);
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
            await this.storeFeedback(feedback);
            await this.sendToServer(feedback);

            this.showSuccess();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showError('There was an error submitting your feedback. Please try again.');
        } finally {
            this.isSubmitting = false;
            submitBtn.disabled = false;
            loading.classList.remove('active');
        }
    }

    
    storeFeedback(feedback) {
        return new Promise((resolve) => {
            let storedFeedback = JSON.parse(localStorage.getItem('abhistat-feedback') || '[]');
            storedFeedback.push(feedback);

            if (storedFeedback.length > 100) {
                storedFeedback = storedFeedback.slice(-100);
            }

            localStorage.setItem('abhistat-feedback', JSON.stringify(storedFeedback));
            this.feedbackData = storedFeedback;
            resolve();
        });
    }

    loadStoredFeedback() {
        this.feedbackData = JSON.parse(localStorage.getItem('abhistat-feedback') || '[]');
    }

    
    async sendToServer(feedback) {
        
        console.log('Feedback to be sent to server:', feedback);
    }

    
    showSuccess() {
        const form = document.getElementById('feedback-form');
        const success = document.getElementById('feedback-success');
        const errorBox = document.getElementById('feedback-error');

        form.style.display = 'none';
        errorBox.classList.remove('active');
        success.hidden = false;
        success.style.display = 'block';
    }

    showForm() {
        const form = document.getElementById('feedback-form');
        const success = document.getElementById('feedback-success');
        const errorBox = document.getElementById('feedback-error');

        success.style.display = 'none';
        errorBox.classList.remove('active');
        form.style.display = 'block';
        this.resetForm();
    }

    showError(message) {
        const errorBox = document.getElementById('feedback-error');
        errorBox.textContent = message;
        errorBox.classList.add('active');
    }

    resetForm() {
        const form = document.getElementById('feedback-form');
        form.reset();
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    
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

        const ratings = this.feedbackData
            .filter(f => f.rating)
            .map(f => parseInt(f.rating));

        if (ratings.length > 0) {
            analytics.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        }

        this.feedbackData.forEach(feedback => {
            analytics.categoryBreakdown[feedback.category] =
                (analytics.categoryBreakdown[feedback.category] || 0) + 1;

            analytics.pageBreakdown[feedback.page] =
                (analytics.pageBreakdown[feedback.page] || 0) + 1;
        });

        analytics.recentFeedback = this.feedbackData
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        return analytics;
    }

    
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


document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystem = new FeedbackSystem();
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackSystem;
}
