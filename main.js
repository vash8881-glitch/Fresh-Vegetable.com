// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize products
    initProducts();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load cart from localStorage
    loadCart();
    
    // Update cart display
    updateCartDisplay();
    
    // Check for abandoned cart
    checkAbandonedCart();
    
    // Load language
    loadLanguage();
});

// Sample Products Data
const products = [
    {
        id: 1,
        name: "Fresh Tomatoes",
        name_hi: "ताज़ा टमाटर",
        name_kn: "ತಾಜಾ ಟೊಮೇಟೊಗಳು",
        name_mr: "ताजी टोमॅटो",
        category: "fruit",
        price: 40,
        originalPrice: 50,
        image: "assets/tomato.jpg",
        todaysOffer: true,
        stock: 50
    },
    {
        id: 2,
        name: "Organic Spinach",
        name_hi: "जैविक पालक",
        name_kn: "ಸಾವಯವ ಪಾಲಕ್",
        name_mr: "ऑर्गेनिक पालक",
        category: "leafy",
        price: 30,
        originalPrice: 35,
        image: "assets/spinach.jpg",
        todaysOffer: false,
        stock: 30
    },
    {
        id: 3,
        name: "Carrots",
        name_hi: "गाजर",
        name_kn: "ಕ್ಯಾರೆಟ್",
        name_mr: "गाजर",
        category: "root",
        price: 45,
        originalPrice: 55,
        image: "assets/carrot.jpg",
        todaysOffer: true,
        stock: 40
    },
    {
        id: 4,
        name: "Potatoes",
        name_hi: "आलू",
        name_kn: "ಆಲೂ",
        name_mr: "बटाटे",
        category: "root",
        price: 25,
        originalPrice: 30,
        image: "assets/potato.jpg",
        todaysOffer: false,
        stock: 60
    },
    {
        id: 5,
        name: "Cabbage",
        name_hi: "पत्ता गोभी",
        name_kn: "ಕೋಸು",
        name_mr: "कोबी",
        category: "leafy",
        price: 20,
        originalPrice: 25,
        image: "assets/cabbage.jpg",
        todaysOffer: true,
        stock: 25
    },
    {
        id: 6,
        name: "Onions",
        name_hi: "प्याज़",
        name_kn: "ಈರುಳ್ಳಿ",
        name_mr: "कांदे",
        category: "root",
        price: 35,
        originalPrice: 40,
        image: "assets/onion.jpg",
        todaysOffer: false,
        stock: 45
    },
    {
        id: 7,
        name: "Capsicum",
        name_hi: "शिमला मिर्च",
        name_kn: "ಕ್ಯಾಪ್ಸಿಕಮ್",
        name_mr: "भोपळी मिरची",
        category: "fruit",
        price: 60,
        originalPrice: 70,
        image: "assets/capsicum.jpg",
        todaysOffer: true,
        stock: 20
    },
    {
        id: 8,
        name: "Ladies Finger",
        name_hi: "भिंडी",
        name_kn: "ಬೆಂಡೆ ಕಾಯಿ",
        name_mr: "भेंडी",
        category: "fruit",
        price: 50,
        originalPrice: 60,
        image: "assets/ladiesfinger.jpg",
        todaysOffer: false,
        stock: 35
    }
];

function initProducts() {
    const productsGrid = document.getElementById('products-grid');
    const currentLang = localStorage.getItem('language') || 'en';
    
    productsGrid.innerHTML = products.map(product => {
        const nameKey = currentLang === 'en' ? 'name' : `name_${currentLang}`;
        const productName = product[nameKey] || product.name;
        
        return `
            <div class="product-card" data-category="${product.category}" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${productName}">
                    ${product.todaysOffer ? '<span class="todays-offer" data-i18n="todays_offer">Today\'s Offer</span>' : ''}
                </div>
                <div class="product-info">
                    <h3>${productName}</h3>
                    <div class="product-price">
                        <span class="current-price">₹${product.price}/kg</span>
                        ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart" data-id="${product.id}" data-i18n="add_to_cart">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

function initEventListeners() {
    // Cart icon click
    document.getElementById('cart-icon').addEventListener('click', toggleCart);
    
    // Close cart
    document.querySelector('.close-cart').addEventListener('click', toggleCart);
    
    // User icon click
    document.getElementById('user-icon').addEventListener('click', showAuthModal);
    
    // Close auth modal
    document.querySelector('.close-auth').addEventListener('click', hideAuthModal);
    
    // Login link
    document.getElementById('login-link').addEventListener('click', showAuthModal);
    
    // WhatsApp order button
    document.getElementById('whatsapp-order').addEventListener('click', () => {
        const cart = getCart();
        if (cart.items.length === 0) {
            alert(getTranslation('empty_cart'));
            return;
        }
        
        const message = generateWhatsAppMessage(cart);
        const phone = '919876543210'; // Your WhatsApp number
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    });
    
    // Fast checkout
    document.getElementById('fast-checkout').addEventListener('click', fastCheckout);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter products
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });
    
    // Subscription buttons
    document.querySelectorAll('.btn-subscribe').forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            showSubscriptionModal(plan);
        });
    });
    
    // Language switcher
    document.getElementById('language-switcher').addEventListener('change', function() {
        const lang = this.value;
        localStorage.setItem('language', lang);
        location.reload();
    });
    
    // Tab switching in auth modal
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchAuthTab(tab);
        });
    });
    
    // Send OTP for login
    document.getElementById('send-login-otp').addEventListener('click', sendLoginOTP);
    
    // Send OTP for signup
    document.getElementById('send-signup-otp').addEventListener('click', sendSignupOTP);
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', verifyLoginOTP);
    
    // Signup form submission
    document.getElementById('signup-form').addEventListener('submit', verifySignupOTP);
}

function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('active');
}

function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    authModal.style.display = 'flex';
    switchAuthTab('login');
}

function hideAuthModal() {
    const authModal = document.getElementById('auth-modal');
    authModal.style.display = 'none';
}

function switchAuthTab(tab) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}-form`).classList.add('active');
}

function sendLoginOTP() {
    const mobile = document.getElementById('login-mobile').value;
    if (!validateMobile(mobile)) {
        alert(getTranslation('invalid_mobile'));
        return;
    }
    
    // Simulate OTP sending
    const otp = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('login_otp', otp);
    localStorage.setItem('login_mobile', mobile);
    localStorage.setItem('login_otp_time', Date.now());
    
    // Show OTP container
    document.getElementById('login-otp-container').style.display = 'block';
    startOTPTimer('login');
    
    // In real app, send OTP via SMS/WhatsApp
    console.log(`OTP sent to ${mobile}: ${otp}`);
    alert(getTranslation('otp_sent'));
}

function sendSignupOTP() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const mobile = document.getElementById('signup-mobile').value;
    
    if (!name || !mobile) {
        alert(getTranslation('fill_required'));
        return;
    }
    
    if (!validateMobile(mobile)) {
        alert(getTranslation('invalid_mobile'));
        return;
    }
    
    // Simulate OTP sending
    const otp = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('signup_otp', otp);
    localStorage.setItem('signup_mobile', mobile);
    localStorage.setItem('signup_data', JSON.stringify({ name, email, mobile }));
    localStorage.setItem('signup_otp_time', Date.now());
    
    // Show OTP container
    document.getElementById('signup-otp-container').style.display = 'block';
    startOTPTimer('signup');
    
    console.log(`OTP sent to ${mobile}: ${otp}`);
    alert(getTranslation('otp_sent'));
}

function verifyLoginOTP(e) {
    e.preventDefault();
    const enteredOTP = document.getElementById('login-otp').value;
    const storedOTP = localStorage.getItem('login_otp');
    const otpTime = localStorage.getItem('login_otp_time');
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        alert(getTranslation('enter_otp'));
        return;
    }
    
    // Check if OTP expired (2 minutes)
    if (Date.now() - otpTime > 2 * 60 * 1000) {
        alert(getTranslation('otp_expired'));
        return;
    }
    
    if (enteredOTP === storedOTP) {
        const mobile = localStorage.getItem('login_mobile');
        localStorage.setItem('logged_in', 'true');
        localStorage.setItem('user_mobile', mobile);
        
        // Load user data
        loadUserData();
        
        alert(getTranslation('login_success'));
        hideAuthModal();
        updateUserDisplay();
    } else {
        alert(getTranslation('invalid_otp'));
    }
}

function verifySignupOTP(e) {
    e.preventDefault();
    const enteredOTP = document.getElementById('signup-otp').value;
    const storedOTP = localStorage.getItem('signup_otp');
    const otpTime = localStorage.getItem('signup_otp_time');
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        alert(getTranslation('enter_otp'));
        return;
    }
    
    // Check if OTP expired (2 minutes)
    if (Date.now() - otpTime > 2 * 60 * 1000) {
        alert(getTranslation('otp_expired'));
        return;
    }
    
    if (enteredOTP === storedOTP) {
        const userData = JSON.parse(localStorage.getItem('signup_data'));
        
        // Save user
        saveUser(userData);
        
        localStorage.setItem('logged_in', 'true');
        localStorage.setItem('user_mobile', userData.mobile);
        
        // Give welcome loyalty points
        addLoyaltyPoints(userData.mobile, 100);
        
        alert(getTranslation('signup_success'));
        hideAuthModal();
        updateUserDisplay();
    } else {
        alert(getTranslation('invalid_otp'));
    }
}

function startOTPTimer(type) {
    const timerElement = document.getElementById(`${type}-otp-timer`);
    let timeLeft = 120; // 2 minutes in seconds
    
    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerElement.textContent = getTranslation('otp_expired');
        }
        
        timeLeft--;
    }, 1000);
}

function validateMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}

function saveUser(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
        ...userData,
        id: Date.now(),
        joined: new Date().toISOString(),
        loyaltyPoints: 100,
        orders: [],
        subscriptions: []
    });
    localStorage.setItem('users', JSON.stringify(users));
}

function loadUserData() {
    const mobile = localStorage.getItem('user_mobile');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.mobile === mobile);
}

function updateUserDisplay() {
    const isLoggedIn = localStorage.getItem('logged_in') === 'true';
    const userData = loadUserData();
    
    if (isLoggedIn && userData) {
        document.getElementById('user-points').textContent = userData.loyaltyPoints || 0;
        document.getElementById('loyalty-points-display').style.display = 'block';
    }
}

function loadLanguage() {
    const lang = localStorage.getItem('language') || 'en';
    document.getElementById('language-switcher').value = lang;
    // Language switching is handled in language.js
}

function generateWhatsAppMessage(cart) {
    const items = cart.items.map(item => {
        const product = products.find(p => p.id === item.id);
        return `${product.name} - ${item.quantity}kg x ₹${product.price} = ₹${item.quantity * product.price}`;
    }).join('\n');
    
    return `*Order Request - VeggieFresh*\n\n` +
           `Items:\n${items}\n\n` +
           `Subtotal: ₹${cart.subtotal}\n` +
           `Delivery: FREE\n` +
           `*Total: ₹${cart.total}*\n\n` +
           `Payment Method: COD\n` +
           `Delivery Address: [Please provide address]\n\n` +
           `Please confirm this order. Thank you!`;
}

function fastCheckout() {
    const cart = getCart();
    if (cart.items.length === 0) {
        alert(getTranslation('empty_cart'));
        return;
    }
    
    const isLoggedIn = localStorage.getItem('logged_in') === 'true';
    if (!isLoggedIn) {
        showAuthModal();
        return;
    }
    
    // Show checkout modal
    showCheckoutModal();
}

function showCheckoutModal() {
    // In a real app, show a checkout form
    alert(getTranslation('redirect_checkout'));
    // Redirect to checkout page or show checkout modal
}

function showSubscriptionModal(plan) {
    const plans = {
        daily: { name: 'Daily Plan', price: 299, period: 'week' },
        weekly: { name: 'Weekly Plan', price: 999, period: 'month' },
        monthly: { name: 'Monthly Plan', price: 3499, period: 'month' }
    };
    
    const selectedPlan = plans[plan];
    const message = `I want to subscribe to ${selectedPlan.name} (₹${selectedPlan.price}/${selectedPlan.period}).`;
    
    const phone = '919876543210';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function checkAbandonedCart() {
    const lastCartUpdate = localStorage.getItem('last_cart_update');
    if (!lastCartUpdate) return;
    
    const cart = getCart();
    if (cart.items.length === 0) return;
    
    const timeSinceUpdate = Date.now() - lastCartUpdate;
    const oneHour = 60 * 60 * 1000;
    
    if (timeSinceUpdate > oneHour) {
        // Send reminder (in real app, send via WhatsApp/SMS)
        console.log('Abandoned cart reminder');
        
        // Add notification to user
        if (Notification.permission === 'granted') {
            new Notification('Complete Your Order!', {
                body: 'Your cart items are waiting for you!',
                icon: 'assets/logo.png'
            });
        }
    }
}

// Helper function for translations
function getTranslation(key) {
    const lang = localStorage.getItem('language') || 'en';
    const translations = window.translations || {};
    return translations[lang]?.[key] || key;
}

// Initialize translations
window.translations = {
    en: {
        logo_text: "VeggieFresh",
        home: "Home",
        products: "Products",
        subscription: "Subscription",
        offers: "Today's Offers",
        contact: "Contact",
        whatsapp_order: "Order on WhatsApp",
        login_title: "Login / Sign Up",
        login: "Login",
        signup: "Sign Up",
        send_otp: "Send OTP",
        verify_otp: "Verify OTP",
        hero_title: "Fresh Vegetables Delivered Daily to Your Doorstep",
        hero_subtitle: "100% Organic • Local Farmers • Free Delivery • COD Available",
        daily_fresh: "DAILY FRESH",
        local_delivery: "LOCAL DELIVERY",
        shop_now: "Shop Now",
        featured_products: "Featured Products",
        all: "All",
        leafy: "Leafy Vegetables",
        root: "Root Vegetables",
        fruit_veg: "Fruit Vegetables",
        todays_offer: "Today's Offer",
        add_to_cart: "Add to Cart",
        subscribe_save: "Subscribe & Save 20%",
        subscription_desc: "Get fresh vegetables daily/weekly with our subscription plans",
        daily_plan: "Daily Plan",
        per_week: "/week",
        daily_fresh_delivery: "Daily fresh delivery",
        mix_vegetables: "Mix vegetables 2kg/day",
        free_delivery: "Free delivery",
        priority_support: "Priority support",
        subscribe_now: "Subscribe Now",
        most_popular: "MOST POPULAR",
        weekly_plan: "Weekly Plan",
        per_month: "/month",
        weekly_delivery: "3 times/week delivery",
        customizable_box: "Customizable vegetable box",
        extra_bonus: "+ ₹100 loyalty points monthly",
        monthly_plan: "Monthly Plan",
        flexible_delivery: "Flexible delivery schedule",
        premium_quality: "Premium quality vegetables",
        recipe_book: "Free recipe ebook",
        your_cart: "Your Cart",
        subtotal: "Subtotal",
        delivery: "Delivery",
        total: "Total",
        fast_checkout: "Fast Checkout",
        pay_with: "Pay with:",
        order_on_whatsapp: "Order on WhatsApp",
        contact_us: "Contact Us",
        address: "Bangalore, Karnataka",
        quick_links: "Quick Links",
        track_order: "Track Order",
        return_policy: "Return Policy",
        account: "Account",
        login_signup: "Login / Sign Up",
        my_orders: "My Orders",
        loyalty_points: "Loyalty Points",
        subscription_plans: "Subscription Plans",
        download_app: "Download App",
        app_ready: "Android App Ready!",
        all_rights_reserved: "All rights reserved.",
        your_points: "Your Loyalty Points:",
        invalid_mobile: "Please enter valid 10-digit mobile number",
        fill_required: "Please fill all required fields",
        otp_sent: "OTP sent to your mobile",
        enter_otp: "Please enter 6-digit OTP",
        otp_expired: "OTP expired. Please request again.",
        invalid_otp: "Invalid OTP. Please try again.",
        login_success: "Login successful!",
        signup_success: "Signup successful! Welcome bonus: 100 loyalty points",
        empty_cart: "Your cart is empty",
        redirect_checkout: "Redirecting to checkout..."
    },
    hi: {
        logo_text: "वेजीफ्रेश",
        home: "होम",
        products: "उत्पाद",
        subscription: "सदस्यता",
        offers: "आज के ऑफर",
        contact: "संपर्क करें",
        whatsapp_order: "व्हाट्सएप पर ऑर्डर करें",
        login_title: "लॉगिन / साइन अप",
        login: "लॉगिन",
        signup: "साइन अप",
        send_otp: "OTP भेजें",
        verify_otp: "OTP सत्यापित करें",
        hero_title: "ताजी सब्जियां रोज आपके दरवाजे पर डिलीवर",
        hero_subtitle: "100% ऑर्गेनिक • स्थानीय किसान • मुफ्त डिलीवरी • COD उपलब्ध",
        daily_fresh: "रोज ताजा",
        local_delivery: "स्थानीय डिलीवरी",
        shop_now: "अभी खरीदें",
        featured_products: "फीचर्ड उत्पाद",
        all: "सभी",
        leafy: "पत्तेदार सब्जियां",
        root: "जड़ वाली सब्जियां",
        fruit_veg: "फल सब्जियां",
        todays_offer: "आज का ऑफर",
        add_to_cart: "कार्ट में जोड़ें",
        subscribe_save: "सदस्यता लें और 20% बचाएं",
        subscription_desc: "हमारी सदस्यता योजनाओं के साथ रोज/साप्ताहिक ताजी सब्जियां प्राप्त करें",
        daily_plan: "दैनिक योजना",
        per_week: "/सप्ताह",
        daily_fresh_delivery: "रोज ताजी डिलीवरी",
        mix_vegetables: "मिक्स सब्जियां 2kg/दिन",
        free_delivery: "मुफ्त डिलीवरी",
        priority_support: "प्राथमिक समर्थन",
        subscribe_now: "अभी सब्सक्राइब करें",
        most_popular: "सबसे लोकप्रिय",
        weekly_plan: "साप्ताहिक योजना",
        per_month: "/महीना",
        weekly_delivery: "सप्ताह में 3 बार डिलीवरी",
        customizable_box: "कस्टमाइजेबल सब्जी बॉक्स",
        extra_bonus: "+ ₹100 लॉयल्टी पॉइंट्स मासिक",
        monthly_plan: "मासिक योजना",
        flexible_delivery: "लचीली डिलीवरी अनुसूची",
        premium_quality: "प्रीमियम क्वालिटी सब्जियां",
        recipe_book: "मुफ्त रेसिपी ईबुक",
        your_cart: "आपकी कार्ट",
        subtotal: "उप-योग",
        delivery: "डिलीवरी",
        total: "कुल",
        fast_checkout: "फास्ट चेकआउट",
        pay_with: "के साथ भुगतान करें:",
        order_on_whatsapp: "व्हाट्सएप पर ऑर्डर करें",
        contact_us: "हमसे संपर्क करें",
        address: "बेंगलुरु, कर्नाटक",
        quick_links: "क्विक लिंक्स",
        track_order: "ऑर्डर ट्रैक करें",
        return_policy: "रिटर्न पॉलिसी",
        account: "अकाउंट",
        login_signup: "लॉगिन / साइन अप",
        my_orders: "मेरे ऑर्डर",
        loyalty_points: "लॉयल्टी पॉइंट्स",
        subscription_plans: "सब्सक्रिप्शन प्लान",
        download_app: "ऐप डाउनलोड करें",
        app_ready: "एंड्रॉइड ऐप तैयार!",
        all_rights_reserved: "सर्वाधिकार सुरक्षित।",
        your_points: "आपके लॉयल्टी पॉइंट्स:",
        invalid_mobile: "कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें",
        fill_required: "कृपया सभी आवश्यक फ़ील्ड भरें",
        otp_sent: "आपके मोबाइल पर OTP भेजा गया",
        enter_otp: "कृपया 6-अंकीय OTP दर्ज करें",
        otp_expired: "OTP समाप्त। कृपया फिर से अनुरोध करें।",
        invalid_otp: "अमान्य OTP। कृपया पुनः प्रयास करें।",
        login_success: "लॉगिन सफल!",
        signup_success: "साइनअप सफल! स्वागत बोनस: 100 लॉयल्टी पॉइंट्स",
        empty_cart: "आपकी कार्ट खाली है",
        redirect_checkout: "चेकआउट पर रीडायरेक्ट हो रहा है..."
    },
    kn: {
        logo_text: "ವೆಜೀಫ್ರೆಶ್",
        home: "ಹೋಮ್",
        products: "ಉತ್ಪನ್ನಗಳು",
        subscription: "ಚಂದಾದಾರಿಕೆ",
        offers: "ಇಂದಿನ ಆಫರ್ಗಳು",
        contact: "ಸಂಪರ್ಕಿಸಿ",
        whatsapp_order: "ವಾಟ್ಸಾಪ್ನಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡಿ",
        login_title: "ಲಾಗಿನ್ / ಸೈನ್ ಅಪ್",
        login: "ಲಾಗಿನ್",
        signup: "ಸೈನ್ ಅಪ್",
        send_otp: "OTP ಕಳುಹಿಸಿ",
        verify_otp: "OTP ಪರಿಶೀಲಿಸಿ",
        hero_title: "ಪ್ರತಿದಿನ ನಿಮ್ಮ ಮನೆಗೆ ತಾಜಾ ತರಕಾರಿ ವಿತರಣೆ",
        hero_subtitle: "100% ಸಾವಯವ • ಸ್ಥಳೀಯ ರೈತರು • ಉಚಿತ ವಿತರಣೆ • COD ಲಭ್ಯ",
        daily_fresh: "ಪ್ರತಿದಿನ ತಾಜಾ",
        local_delivery: "ಸ್ಥಳೀಯ ವಿತರಣೆ",
        shop_now: "ಈಗ ಖರೀದಿಸಿ",
        featured_products: "ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ಉತ್ಪನ್ನಗಳು",
        all: "ಎಲ್ಲಾ",
        leafy: "ಎಲೆ ತರಕಾರಿಗಳು",
        root: "ಬೇರಿನ ತರಕಾರಿಗಳು",
        fruit_veg: "ಹಣ್ಣು ತರಕಾರಿಗಳು",
        todays_offer: "ಇಂದಿನ ಆಫರ್",
        add_to_cart: "ಕಾರ್ಟ್ಗೆ ಸೇರಿಸಿ",
        subscribe_save: "ಚಂದಾದಾರರಾಗಿ ಮತ್ತು 20% ಉಳಿಸಿ",
        subscription_desc: "ನಮ್ಮ ಚಂದಾದಾರಿಕೆ ಯೋಜನೆಗಳೊಂದಿಗೆ ಪ್ರತಿದಿನ/ಸಾಪ್ತಾಹಿಕ ತಾಜಾ ತರಕಾರಿ ಪಡೆಯಿರಿ",
        daily_plan: "ದೈನಂದಿನ ಯೋಜನೆ",
        per_week: "/ವಾರ",
        daily_fresh_delivery: "ಪ್ರತಿದಿನ ತಾಜಾ ವಿತರಣೆ",
        mix_vegetables: "ಮಿಶ್ರ ತರಕಾರಿಗಳು 2ಕೆಜಿ/ದಿನ",
        free_delivery: "ಉಚಿತ ವಿತರಣೆ",
        priority_support: "ಪ್ರಾಮುಖ್ಯತೆ ಬೆಂಬಲ",
        subscribe_now: "ಈಗ ಚಂದಾದಾರರಾಗಿ",
        most_popular: "ಅತ್ಯಂತ ಜನಪ್ರಿಯ",
        weekly_plan: "ಸಾಪ್ತಾಹಿಕ ಯೋಜನೆ",
        per_month: "/ತಿಂಗಳು",
        weekly_delivery: "ವಾರಕ್ಕೆ 3 ಬಾರಿ ವಿತರಣೆ",
        customizable_box: "ಕಸ್ಟಮೈಸಬಲ್ ತರಕಾರಿ ಬಾಕ್ಸ್",
        extra_bonus: "+ ₹100 ನಿಷ್ಠಾ ಪಾಯಿಂಟ್ಗಳು ಮಾಸಿಕ",
        monthly_plan: "ಮಾಸಿಕ ಯೋಜನೆ",
        flexible_delivery: "ನಮ್ಯ ವಿತರಣೆ ವೇಳಾಪಟ್ಟಿ",
        premium_quality: "ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟದ ತರಕಾರಿಗಳು",
        recipe_book: "ಉಚಿತ ರೆಸಿಪಿ ಈಬುಕ್",
        your_cart: "ನಿಮ್ಮ ಕಾರ್ಟ್",
        subtotal: "ಉಪಮೊತ್ತ",
        delivery: "ವಿತರಣೆ",
        total: "ಒಟ್ಟು",
        fast_checkout: "ಫಾಸ್ಟ್ ಚೆಕೌಟ್",
        pay_with: "ಜೊತೆ ಪಾವತಿಸಿ:",
        order_on_whatsapp: "ವಾಟ್ಸಾಪ್ನಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡಿ",
        contact_us: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
        address: "ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ",
        quick_links: "ತ್ವರಿತ ಲಿಂಕ್ಗಳು",
        track_order: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
        return_policy: "ರಿಟರ್ನ್ ಪಾಲಿಸಿ",
        account: "ಖಾತೆ",
        login_signup: "ಲಾಗಿನ್ / ಸೈನ್ ಅಪ್",
        my_orders: "ನನ್ನ ಆರ್ಡರ್ಗಳು",
        loyalty_points: "ನಿಷ್ಠಾ ಪಾಯಿಂಟ್ಗಳು",
        subscription_plans: "ಚಂದಾದಾರಿಕೆ ಯೋಜನೆಗಳು",
        download_app: "ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್ಲೋಡ್ ಮಾಡಿ",
        app_ready: "Android ಅಪ್ಲಿಕೇಶನ್ ಸಿದ್ಧವಾಗಿದೆ!",
        all_rights_reserved: "ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
        your_points: "ನಿಮ್ಮ ನಿಷ್ಠಾ ಪಾಯಿಂಟ್ಗಳು:",
        invalid_mobile: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ",
        fill_required: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
        otp_sent: "ನಿಮ್ಮ ಮೊಬೈಲ್ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ",
        enter_otp: "ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ",
        otp_expired: "OTP ಮುಕ್ತಾಯವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ವಿನಂತಿಸಿ.",
        invalid_otp: "ಅಮಾನ್ಯ OTP. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        login_success: "ಲಾಗಿನ್ ಯಶಸ್ವಿ!",
        signup_success: "ಸೈನ್ ಅಪ್ ಯಶಸ್ವಿ! ಸ್ವಾಗತ ಬೋನಸ್: 100 ನಿಷ್ಠಾ ಪಾಯಿಂಟ್ಗಳು",
        empty_cart: "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ",
        redirect_checkout: "ಚೆಕೌಟ್ಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ..."
    },
    mr: {
        logo_text: "वेजीफ्रेश",
        home: "होम",
        products: "उत्पादने",
        subscription: "सदस्यता",
        offers: "आजचे ऑफर",
        contact: "संपर्क साधा",
        whatsapp_order: "व्हाट्सअप वर ऑर्डर करा",
        login_title: "लॉगिन / साइन अप",
        login: "लॉगिन",
        signup: "साइन अप",
        send_otp: "OTP पाठवा",
        verify_otp: "OTP सत्यापित करा",
        hero_title: "प्रतिदिन ताजी भाजीपाला तुमच्या दारापर्यंत वितरीत",
        hero_subtitle: "100% ऑर्गेनिक • स्थानिक शेतकरी • विनामूल्य वितरण • COD उपलब्ध",
        daily_fresh: "दैनंदिन ताजे",
        local_delivery: "स्थानिक वितरण",
        shop_now: "आताच खरेदी करा",
        featured_products: "वैशिष्ट्यीकृत उत्पादने",
        all: "सर्व",
        leafy: "पालेभाज्या",
        root: "रूट भाज्या",
        fruit_veg: "फळ भाज्या",
        todays_offer: "आजचे ऑफर",
        add_to_cart: "कार्टमध्ये जोडा",
        subscribe_save: "सदस्यता घ्या आणि 20% वाचवा",
        subscription_desc: "आमच्या सदस्यता योजनांसह दररोज/साप्ताहिक ताजी भाजीपाला मिळवा",
        daily_plan: "दैनिक योजना",
        per_week: "/आठवडा",
        daily_fresh_delivery: "दररोज ताजे वितरण",
        mix_vegetables: "मिश्र भाज्या 2किलो/दिवस",
        free_delivery: "विनामूल्य वितरण",
        priority_support: "प्राधान्य समर्थन",
        subscribe_now: "आत्ताच सब्सक्राईब करा",
        most_popular: "सर्वात लोकप्रिय",
        weekly_plan: "साप्ताहिक योजना",
        per_month: "/महिना",
        weekly_delivery: "आठवड्यातून 3 वेळा वितरण",
        customizable_box: "सानुकूलित भाजीपाला बॉक्स",
        extra_bonus: "+ ₹100 लॉयल्टी पॉइंट्स मासिक",
        monthly_plan: "मासिक योजना",
        flexible_delivery: "लवचिक वितरण वेळापत्रक",
        premium_quality: "प्रीमियम क्वालिटी भाजीपाला",
        recipe_book: "मोफत रेसिपी ईबुक",
        your_cart: "तुमची कार्ट",
        subtotal: "उपयोग",
        delivery: "वितरण",
        total: "एकूण",
        fast_checkout: "फास्ट चेकआउट",
        pay_with: "यासह पैसे द्या:",
        order_on_whatsapp: "व्हाट्सअप वर ऑर्डर करा",
        contact_us: "आमच्याशी संपर्क साधा",
        address: "बंगळुरू, कर्नाटक",
        quick_links: "द्रुत दुवे",
        track_order: "ऑर्डर ट्रॅक करा",
        return_policy: "रिटर्न पॉलिसी",
        account: "खाते",
        login_signup: "लॉगिन / साइन अप",
        my_orders: "माझे ऑर्डर",
        loyalty_points: "लॉयल्टी पॉइंट्स",
        subscription_plans: "सदस्यता योजना",
        download_app: "अॅप डाउनलोड करा",
        app_ready: "Android अॅप तयार आहे!",
        all_rights_reserved: "सर्व हक्क राखीव.",
        your_points: "तुमचे लॉयल्टी पॉइंट्स:",
        invalid_mobile: "कृपया वैध 10-अंकी मोबाईल नंबर प्रविष्ट करा",
        fill_required: "कृपया सर्व आवश्यक फील्ड भरा",
        otp_sent: "तुमच्या मोबाईलवर OTP पाठवला गेला",
        enter_otp: "कृपया 6-अंकी OTP प्रविष्ट करा",
        otp_expired: "OTP कालबाह्य झाले. कृपया पुन्हा विनंती करा.",
        invalid_otp: "अवैध OTP. कृपया पुन्हा प्रयत्न करा.",
        login_success: "लॉगिन यशस्वी!",
        signup_success: "साइनअप यशस्वी! स्वागत बोनस: 100 लॉयल्टी पॉइंट्स",
        empty_cart: "तुमची कार्ट रिकामी आहे",
        redirect_checkout: "चेकआउट वर पुनर्निर्देशित केले जात आहे..."
    }
};