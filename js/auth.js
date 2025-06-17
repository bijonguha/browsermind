// Google Authentication Module for BrowserMind
// Minimal implementation using Google Identity Services

class AuthManager {
    constructor() {
        this.user = null;
        this.isInitialized = false;
        this.config = null;
        this.hasSignedOut = false; // Track explicit sign-out actions
        this.callbacks = {
            onSignIn: [],
            onSignOut: []
        };
        this.browserInfo = window.BrowserUtils ? window.BrowserUtils.detectBrowser() : this.detectBrowser();
        
        // Wait for config to be available
        this.waitForConfig();
    }

    /**
     * Detect browser for Chrome-specific fixes
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
        const isEdge = /Edg/.test(userAgent);
        const isFirefox = /Firefox/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        
        return {
            isChrome,
            isEdge,
            isFirefox,
            isSafari,
            userAgent
        };
    }
    
    /**
     * Wait for configuration to be loaded
     */
    waitForConfig() {
        if (typeof window.appConfig !== 'undefined') {
            this.config = window.appConfig;
            if (window.log) {
                window.log.info('Configuration loaded', 'Auth');
            }
        } else {
            setTimeout(() => this.waitForConfig(), 100);
        }
    }

    // Initialize Google Identity Services
    async initialize() {
        if (window.log) {
            window.log.info('Starting authentication initialization', 'Auth');
        }
        return new Promise((resolve, reject) => {
            // Wait for configuration and Google Identity Services to load
            if (!this.config || typeof google === 'undefined') {
                if (window.log) {
                    window.log.debug('Waiting for configuration and Google Identity Services', 'Auth');
                }
                setTimeout(() => this.initialize().then(resolve).catch(reject), 500);
                return;
            }

            const clientId = this.config.get('google.clientId');
            const autoSelect = this.config.get('google.auth.autoSelect');
            const cancelOnTapOutside = this.config.get('google.auth.cancelOnTapOutside');

            if (window.log) {
                window.log.debug('Google Identity Services available', 'Auth');
                window.log.debug(`Environment: ${this.config.get('app.environment')}`, 'Auth');
            }

            try {
                // Chrome-specific configuration
                const initConfig = {
                    client_id: clientId,
                    callback: (response) => this.handleCredentialResponse(response),
                    auto_select: this.browserInfo.isChrome ? false : autoSelect, // Disable auto-select in Chrome
                    cancel_on_tap_outside: cancelOnTapOutside
                };

                // Add Chrome-specific settings
                if (this.browserInfo.isChrome) {
                    initConfig.use_fedcm_for_prompt = false; // Disable FedCM which can cause issues
                    initConfig.itp_support = true; // Enable Intelligent Tracking Prevention support
                }

                if (window.log) {
                    window.log.debug(`Browser detected: ${this.browserInfo.isChrome ? 'Chrome' : 'Other'}`, 'Auth');
                    window.log.debug('Auth config:', 'Auth', initConfig);
                }

                google.accounts.id.initialize(initConfig);

                this.isInitialized = true;
                if (window.log) {
                    window.log.info('Google Identity Services initialized', 'Auth');
                }
                
                // Check for existing session and update UI
                this.loadUserFromStorage();
                this.updateUI();
                
                resolve();
            } catch (error) {
                if (window.log) {
                    window.log.error('Failed to initialize Google Identity Services', 'Auth', error);
                }
                reject(error);
            }
        });
    }

    // Handle credential response from Google
    handleCredentialResponse(response) {
        try {
            // Decode JWT token to get user info
            const payload = this.parseJWT(response.credential);
            const user = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                token: response.credential
            };

            this.user = user;
            this.hasSignedOut = false; // Reset sign-out flag when user signs in
            this.saveUserToStorage(user);
            this.updateUI();
            this.triggerCallbacks('onSignIn', user);

            if (window.log) {
                window.log.info(`User signed in: ${user.name}`, 'Auth');
            }
            
            // Track sign-in with Google Analytics
            if (typeof gtag === 'function') {
                gtag('event', 'login', {
                    method: 'Google',
                    user_id: user.id
                });
            }
        } catch (error) {
            if (window.log) {
                window.log.error('Error handling credential response', 'Auth', error);
            }
        }
    }

    // Parse JWT token (simple implementation)
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            if (window.log) {
                window.log.error('Error parsing JWT', 'Auth', error);
            }
            return null;
        }
    }

    // Show Google sign-in - directly render button for immediate access
    signIn() {
        if (window.log) {
            window.log.debug('signIn() called', 'Auth');
            window.log.debug(`Auth initialized: ${this.isInitialized}, Google available: ${typeof google !== 'undefined'}`, 'Auth');
        }
        
        if (!this.isInitialized) {
            if (window.log) {
                window.log.error('Authentication not initialized', 'Auth');
            }
            this.showUserFriendlyError('Authentication not ready. Please refresh the page.');
            return;
        }

        if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
            if (window.log) {
                window.log.error('Google Identity Services not loaded', 'Auth');
            }
            this.showUserFriendlyError('Google services not loaded. Please refresh the page.');
            return;
        }

        if (window.log) {
            window.log.debug('Attempting Google sign-in', 'Auth');
        }

        // Directly render the Google button for immediate interaction
        this.renderSignInButton();
    }

    /**
     * Show user-friendly error message
     */
    showUserFriendlyError(message) {
        if (this.browserInfo.isChrome) {
            // For Chrome, show more specific guidance
            const chromeMessage = message + '\n\nChrome users: Please make sure third-party cookies are enabled and popup blockers are disabled for this site.';
            alert(chromeMessage);
        } else {
            alert(message);
        }
    }

    // Render sign-in button with Chrome-specific handling
    renderSignInButton() {
        const authContainer = document.getElementById('auth-container');
        if (authContainer && !this.user) {
            try {
                // Add helpful text above the button
                authContainer.innerHTML = `
                    <div style="text-align: center; margin-bottom: 12px;">
                        <div style="color: #cbd5e1; font-size: 13px; margin-bottom: 8px;">Click the button below to sign in:</div>
                    </div>
                `;
                
                // Create a container for the Google button
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = 'display: flex; justify-content: center; align-items: center;';
                authContainer.appendChild(buttonContainer);
                
                // Enhanced button configuration
                const buttonConfig = {
                    theme: 'filled_blue',
                    size: 'large',
                    text: 'signin_with',
                    width: 240,
                    type: 'standard',
                    shape: 'rectangular'
                };

                if (window.log) {
                    window.log.debug('Rendering Google sign-in button', 'Auth', buttonConfig);
                }
                
                google.accounts.id.renderButton(buttonContainer, buttonConfig);
                
                authContainer.style.display = 'block';

                // Add event listener for better UX feedback
                buttonContainer.addEventListener('click', () => {
                    if (window.log) {
                        window.log.debug('Google sign-in button clicked', 'Auth');
                    }
                    // Show immediate feedback
                    const feedbackDiv = document.createElement('div');
                    feedbackDiv.style.cssText = `
                        color: #06b6d4; 
                        font-size: 12px; 
                        text-align: center; 
                        margin-top: 8px;
                        animation: fadeIn 0.3s ease;
                    `;
                    feedbackDiv.textContent = '🔄 Opening Google sign-in...';
                    authContainer.appendChild(feedbackDiv);
                });
                
            } catch (error) {
                if (window.log) {
                    window.log.error('Error rendering Google button', 'Auth', error);
                }
                // Fallback: Create a manual sign-in button
                this.createFallbackSignInButton(authContainer);
            }
        }
    }


    /**
     * Create fallback sign-in button if Google button fails
     */
    createFallbackSignInButton(container) {
        container.innerHTML = `
            <button class="google-signin-fallback" onclick="window.authManager.handleFallbackSignIn()">
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
            </button>
        `;
        
        container.style.display = 'block';
    }

    /**
     * Handle fallback sign-in when Google button fails
     */
    handleFallbackSignIn() {
        if (window.log) {
            window.log.debug('Fallback sign-in initiated', 'Auth');
        }
        
        // Open Google OAuth in a new window
        const clientId = this.config.get('google.clientId');
        const redirectUri = encodeURIComponent(window.location.origin);
        const scope = encodeURIComponent('openid email profile');
        
        const googleAuthUrl = `https://accounts.google.com/oauth/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${redirectUri}&` +
            `scope=${scope}&` +
            `response_type=code&` +
            `access_type=offline`;
            
        // Open in popup
        const popup = window.open(
            googleAuthUrl,
            'google-signin',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        if (!popup) {
            alert('Popup was blocked. Please allow popups for this site and try again.');
            return;
        }
        
        // Monitor popup
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                if (window.log) {
                    window.log.debug('Sign-in popup closed', 'Auth');
                }
            }
        }, 1000);
    }

    // Sign out user
    signOut() {
        this.user = null;
        this.hasSignedOut = true; // Mark that user has explicitly signed out
        this.clearUserFromStorage();
        this.updateUI();
        this.triggerCallbacks('onSignOut');

        if (window.log) {
            window.log.info('User signed out', 'Auth');
        }
        
        // Track sign-out with Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', 'logout', {
                method: 'Google'
            });
        }
    }

    // Save user to localStorage
    saveUserToStorage(user) {
        try {
            const userData = {
                ...user,
                timestamp: Date.now()
            };
            const storageKey = this.config.get('google.auth.storageKey', 'mistermd_user');
            localStorage.setItem(storageKey, JSON.stringify(userData));
        } catch (error) {
            if (window.log) {
                window.log.error('Error saving user to storage', 'Auth', error);
            }
        }
    }

    // Load user from localStorage
    loadUserFromStorage() {
        try {
            const storageKey = this.config.get('google.auth.storageKey', 'mistermd_user');
            const userData = localStorage.getItem(storageKey);
            if (userData) {
                const user = JSON.parse(userData);
                // Check if token is not too old
                const sessionTimeout = this.config.get('google.auth.sessionTimeout', 24 * 60 * 60 * 1000);
                const tokenAge = Date.now() - user.timestamp;
                if (tokenAge < sessionTimeout) {
                    this.user = user;
                    this.hasSignedOut = false; // Reset sign-out flag when loading valid session
                    this.updateUI();
                    if (window.log) {
                        window.log.info(`User loaded from storage: ${user.name}`, 'Auth');
                    }
                } else {
                    if (window.log) {
                        window.log.debug('Stored user token expired', 'Auth');
                    }
                    this.clearUserFromStorage();
                }
            }
        } catch (error) {
            if (window.log) {
                window.log.error('Error loading user from storage', 'Auth', error);
            }
        }
    }

    // Clear user from localStorage
    clearUserFromStorage() {
        try {
            const storageKey = this.config.get('google.auth.storageKey', 'mistermd_user');
            localStorage.removeItem(storageKey);
        } catch (error) {
            if (window.log) {
                window.log.error('Error clearing user from storage', 'Auth', error);
            }
        }
    }

    // Update UI based on authentication state
    updateUI() {
        const authUserInfo = document.getElementById('authUserInfo');
        const authSignIn = document.getElementById('authSignIn');
        const userAvatar = document.getElementById('userAvatar');
        const userAvatarFallback = document.getElementById('userAvatarFallback');
        const userInitials = document.getElementById('userInitials');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const authContainer = document.getElementById('auth-container');

        if (this.user) {
            // User is signed in - show user info
            if (authUserInfo && authSignIn) {
                authSignIn.style.display = 'none';
                authUserInfo.style.display = 'flex';
                
                // Set user name and email
                if (userName) userName.textContent = this.user.name;
                if (userEmail) userEmail.textContent = this.user.email;
                
                // Set user avatar
                if (userAvatar && userAvatarFallback && userInitials) {
                    if (this.user.picture) {
                        userAvatar.src = this.user.picture;
                        userAvatar.style.display = 'block';
                        userAvatarFallback.style.display = 'none';
                        
                        // Handle avatar load error
                        userAvatar.onerror = () => {
                            userAvatar.style.display = 'none';
                            userAvatarFallback.style.display = 'flex';
                            userInitials.textContent = this.getUserInitials(this.user.name);
                        };
                    } else {
                        userAvatar.style.display = 'none';
                        userAvatarFallback.style.display = 'flex';
                        userInitials.textContent = this.getUserInitials(this.user.name);
                    }
                }
            }

            // Clear any Google button in auth container when signed in
            if (authContainer) {
                authContainer.innerHTML = '';
                authContainer.style.display = 'none';
            }
            
            if (window.log) {
                window.log.info(`User UI updated: ${this.user.name}`, 'Auth');
            }
            
            // Update input state when user signs in
            if (window.app && window.app.ui) {
                window.app.ui.setInputEnabled(true);
                // Initialize chat manager for authenticated user
                window.app.chatManager.initializeForAuthenticatedUser();
                // Refresh chat history display to show user's conversations
                window.app.updateChatHistoryDisplay();
            }
        } else {
            // User is not signed in - show sign in button
            if (authUserInfo && authSignIn) {
                authUserInfo.style.display = 'none';
                authSignIn.style.display = 'block';
            }

            // Clear auth container
            if (authContainer) {
                authContainer.innerHTML = '';
                authContainer.style.display = 'none';
            }
            
            if (window.log) {
                window.log.info('User signed out, UI updated', 'Auth');
            }
            
            // Update input state when user signs out
            if (window.app && window.app.ui) {
                window.app.ui.setInputEnabled(false);
                // Clear chat data for unauthenticated user (auto-saves current chat)
                window.app.chatManager.clearForUnauthenticatedUser();
                // Clear the main chat UI to start fresh
                window.app.ui.clearMessages(false);
                // Add sign out message only if user has explicitly signed out
                if (this.hasSignedOut) {
                    window.app.ui.addMessage('👋 You have signed out successfully. Sign in again to access your conversations.', 'system', false);
                }
                // Hide chat history and show auth required message
                window.app.updateChatHistoryDisplay();
            }
        }
    }

    // Initialize event handlers for the new UI
    initializeEventHandlers() {
        const authSignInBtn = document.getElementById('authSignInBtn');
        const authSignOutBtn = document.getElementById('authSignOutBtn');
        
        if (authSignInBtn) {
            authSignInBtn.addEventListener('click', () => this.signIn());
        }
        
        if (authSignOutBtn) {
            authSignOutBtn.addEventListener('click', () => this.signOut());
        }
    }

    // Add event callbacks
    onSignIn(callback) {
        this.callbacks.onSignIn.push(callback);
    }

    onSignOut(callback) {
        this.callbacks.onSignOut.push(callback);
    }

    // Trigger callbacks
    triggerCallbacks(event, data) {
        this.callbacks[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                if (window.log) {
                    window.log.error(`Error in ${event} callback`, 'Auth', error);
                }
            }
        });
    }

    // Public API methods
    getCurrentUser() {
        return this.user;
    }

    isAuthenticated() {
        return this.user !== null;
    }

    getUserId() {
        return this.user ? this.user.id : null;
    }

    getUserEmail() {
        return this.user ? this.user.email : null;
    }

    getUserName() {
        return this.user ? this.user.name : null;
    }

    // Get user initials for avatar fallback
    getUserInitials(name) {
        return window.BrowserUtils ? window.BrowserUtils.getUserInitials(name) : this.fallbackGetInitials(name);
    }

    // Fallback method if utils not available
    fallbackGetInitials(name) {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
}

// Create global instance
window.authManager = new AuthManager();
console.log('✅ window.authManager created:', typeof window.authManager);

// Initialize event handlers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.authManager) {
        window.authManager.initializeEventHandlers();
    }
    
    // Hide Google button when clicking outside auth area and user is not signed in
    document.addEventListener('click', function(event) {
        const authContainer = document.getElementById('auth-container');
        const rightSidebar = document.getElementById('rightSidebar');
        
        // Hide Google button if clicking outside right sidebar and user is not signed in
        if (rightSidebar && authContainer && !rightSidebar.contains(event.target) && window.authManager && !window.authManager.isAuthenticated()) {
            authContainer.innerHTML = '';
            authContainer.style.display = 'none';
        }
    });
});

if (window.log) {
    window.log.debug('Auth module loaded', 'Auth');
}