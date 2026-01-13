// Authentication System
class AuthSystem {
    constructor() {
        this.otpValidity = 120; // 2 minutes in seconds
        this.init();
    }
    
    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
    }
    
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('logged_in') === 'true';
        if (isLoggedIn) {
            this.updateUIForLoggedInUser();
        }
    }
    
    setupEventListeners() {
        // Login OTP button
        document.getElementById('send-login-otp').addEventListener('click', () => {
            this.sendOTP('login');
        });
        
        // Signup OTP button
        document.getElementById('send-signup-otp').addEventListener('click', () => {
            this.sendOTP('signup');
        });
        
        // Login form submit
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyOTP('login');
        });
        
        // Signup form submit
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyOTP('signup');
        });
    }
    
    sendOTP(type) {
        let mobile;
        
        if (type === 'login') {
            mobile = document.getElementById('login-mobile').value;
            if (!this.validateMobile(mobile)) {
                alert('Please enter a valid 10-digit mobile number');
                return;
            }
        } else {
            mobile = document.getElementById('signup-mobile').value;
            const name = document.getElementById('signup-name').value;
            
            if (!name || !mobile) {
                alert('Please fill all required fields');
                return;
            }
            
            if (!this.validateMobile(mobile)) {
                alert('Please enter a valid 10-digit mobile number');
                return;
            }
        }
        
        // Generate OTP
        const otp = this.generateOTP();
        const timestamp = Date.now();
        
        // Store OTP data
        localStorage.setItem(`${type}_otp`, otp);
        localStorage.setItem(`${type}_mobile`, mobile);
        localStorage.setItem(`${type}_otp_time`, timestamp);
        
        // Show OTP input
        document.getElementById(`${type}-otp-container`).style.display = 'block';
        
        // Start timer
        this.startOTPTimer(type);
        
        // In real app, send OTP via SMS/WhatsApp
        console.log(`OTP for ${mobile}: ${otp}`);
        
        // Simulate sending via WhatsApp
        this.sendWhatsAppOTP(mobile, otp, type);
        
        alert('OTP sent to your mobile number');
    }
    
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    validateMobile(mobile) {
        return /^[6-9]\d{9}$/.test(mobile);
    }
    
    startOTPTimer(type) {
        const timerElement = document.getElementById(`${type}-otp-timer`);
        let timeLeft = this.otpValidity;
        
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerElement.textContent = 'OTP Expired';
                localStorage.removeItem(`${type}_otp`);
                localStorage.removeItem(`${type}_otp_time`);
            }
            
            timeLeft--;
        }, 1000);
    }
    
    verifyOTP(type) {
        let enteredOTP, storedOTP, otpTime, mobile;
        
        if (type === 'login') {
            enteredOTP = document.getElementById('login-otp').value;
            storedOTP = localStorage.getItem('login_otp');
            otpTime = localStorage.getItem('login_otp_time');
            mobile = localStorage.getItem('login_mobile');
        } else {
            enteredOTP = document.getElementById('signup-otp').value;
            storedOTP = localStorage.getItem('signup_otp');
            otpTime = localStorage.getItem('signup_otp_time');
            mobile = localStorage.getItem('signup_mobile');
        }
        
        // Validate OTP
        if (!enteredOTP || enteredOTP.length !== 6) {
            alert('Please enter 6-digit OTP');
            return;
        }
        
        // Check if OTP expired
        if (Date.now() - otpTime > this.otpValidity * 1000) {
            alert('OTP expired. Please request again.');
            return;
        }
        
        if (enteredOTP === storedOTP) {
            this.handleSuccessfulAuth(type, mobile);
        } else {
            alert('Invalid OTP. Please try again.');
        }
    }
    
    handleSuccessfulAuth(type, mobile) {
        if (type === 'login') {
            // Successful login
            localStorage.setItem('logged_in', 'true');
            localStorage.setItem('user_mobile', mobile);
            
            // Update user data
            this.updateUserData(mobile);
            
            alert('Login successful!');
            this.hideAuthModal();
            this.updateUIForLoggedInUser();
        } else {
            // Successful signup
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            
            this.registerUser(name, email, mobile);
            
            localStorage.setItem('logged_in', 'true');
            localStorage.setItem('user_mobile', mobile);
            
            // Add welcome loyalty points
            this.addLoyaltyPoints(mobile, 100);
            
            alert('Registration successful! Welcome bonus: 100 loyalty points');
            this.hideAuthModal();
            this.updateUIForLoggedInUser();
        }
    }
    
    registerUser(name, email, mobile) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (users.some(user => user.mobile === mobile)) {
            alert('User already exists. Please login instead.');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            name,
            email,
            mobile,
            joined: new Date().toISOString(),
            loyaltyPoints: 100,
            totalOrders: 0,
            totalSpent: 0,
            addresses: [],
            orders: [],
            subscriptions: []
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return newUser;
    }
    
    updateUserData(mobile) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(user => user.mobile === mobile);
        
        if (userIndex !== -1) {
            // Update last login
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    
    addLoyaltyPoints(mobile, points) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(user => user.mobile === mobile);
        
        if (userIndex !== -1) {
            users[userIndex].loyaltyPoints = 
                (users[userIndex].loyaltyPoints || 0) + points;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    
    updateUIForLoggedInUser() {
        const mobile = localStorage.getItem('user_mobile');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.mobile === mobile);
        
        if (user) {
            // Update user icon
            const userIcon = document.getElementById('user-icon');
            userIcon.innerHTML = `<i class="fas fa-user-check"></i>`;
            
            // Show loyalty points
            const loyaltyPointsDisplay = document.getElementById('loyalty-points-display');
            const userPointsElement = document.getElementById('user-points');
            
            if (loyaltyPointsDisplay && userPointsElement) {
                loyaltyPointsDisplay.style.display = 'block';
                userPointsElement.textContent = user.loyaltyPoints || 0;
            }
            
            // Update welcome message
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'welcome-message';
            welcomeMsg.innerHTML = `Welcome, ${user.name}`;
            
            const userActions = document.querySelector('.user-actions');
            if (!document.querySelector('.welcome-message')) {
                userActions.insertBefore(welcomeMsg, userActions.firstChild);
            }
        }
    }
    
    hideAuthModal() {
        const authModal = document.getElementById('auth-modal');
        authModal.style.display = 'none';
        
        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
        document.getElementById('login-otp-container').style.display = 'none';
        document.getElementById('signup-otp-container').style.display = 'none';
    }
    
    sendWhatsAppOTP(mobile, otp, type) {
        // In real app, integrate with WhatsApp Business API
        const message = type === 'login' 
            ? `Your VeggieFresh login OTP is: ${otp}. Valid for 2 minutes.`
            : `Your VeggieFresh verification OTP is: ${otp}. Valid for 2 minutes.`;
        
        // This would be replaced with actual WhatsApp API call
        console.log(`WhatsApp OTP to ${mobile}: ${message}`);
        
        // For demo purposes, we'll simulate it
        if (typeof window.sendWhatsAppMessage === 'function') {
            window.sendWhatsAppMessage(mobile, message);
        }
    }
    
    logout() {
        localStorage.removeItem('logged_in');
        localStorage.removeItem('user_mobile');
        
        // Reset UI
        const userIcon = document.getElementById('user-icon');
        userIcon.innerHTML = `<i class="fas fa-user"></i>`;
        
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        const loyaltyPointsDisplay = document.getElementById('loyalty-points-display');
        if (loyaltyPointsDisplay) {
            loyaltyPointsDisplay.style.display = 'none';
        }
        
        alert('Logged out successfully');
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});