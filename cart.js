// Cart Management System
class CartSystem {
    constructor() {
        this.cart = this.getCart();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartDisplay();
        this.setupAbandonedCartCheck();
    }

    getCart() {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : {
            items: [],
            subtotal: 0,
            total: 0,
            deliveryCharge: 0,
            discount: 0,
            lastUpdated: Date.now()
        };
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        localStorage.setItem('last_cart_update', Date.now());
    }

    addToCart(productId, quantity = 1) {
        // Get product details
        const product = window.products.find(p => p.id === productId);
        if (!product) return;

        // Check stock
        if (product.stock < quantity) {
            alert(`Only ${product.stock} items available in stock`);
            return;
        }

        // Check if item already in cart
        const existingItemIndex = this.cart.items.findIndex(item => item.id === productId);

        if (existingItemIndex !== -1) {
            // Update quantity
            this.cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            this.cart.items.push({
                id: productId,
                quantity: quantity,
                price: product.price,
                name: product.name,
                image: product.image
            });
        }

        this.updateCartTotals();
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification(product.name, quantity);

        // Check for abandoned cart
        this.checkAbandonedCart();
    }

    removeFromCart(productId) {
        this.cart.items = this.cart.items.filter(item => item.id !== productId);
        this.updateCartTotals();
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const product = window.products.find(p => p.id === productId);
        if (!product) return;

        if (product.stock < newQuantity) {
            alert(`Only ${product.stock} items available in stock`);
            return;
        }

        const itemIndex = this.cart.items.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            this.cart.items[itemIndex].quantity = newQuantity;
            this.updateCartTotals();
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    updateCartTotals() {
        // Calculate subtotal
        this.cart.subtotal = this.cart.items.reduce((total, item) => {
            const product = window.products.find(p => p.id === item.id);
            return total + (product.price * item.quantity);
        }, 0);

        // Calculate delivery charge (free above ₹300)
        this.cart.deliveryCharge = this.cart.subtotal >= 300 ? 0 : 40;

        // Apply discount if any
        this.cart.discount = 0;

        // Calculate total
        this.cart.total = this.cart.subtotal + this.cart.deliveryCharge - this.cart.discount;

        // Update last updated timestamp
        this.cart.lastUpdated = Date.now();
    }

    updateCartDisplay() {
        // Update cart count
        const totalItems = this.cart.items.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;

        // Update cart items in sidebar
        this.renderCartItems();

        // Update cart totals
        document.getElementById('cart-subtotal').textContent = `₹${this.cart.subtotal}`;
        document.getElementById('cart-total').textContent = `₹${this.cart.total}`;
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const currentLang = localStorage.getItem('language') || 'en';

        if (this.cart.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="#products" class="btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.cart.items.map(item => {
            const product = window.products.find(p => p.id === item.id);
            if (!product) return '';

            const nameKey = currentLang === 'en' ? 'name' : `name_${currentLang}`;
            const productName = product[nameKey] || product.name;
            const itemTotal = product.price * item.quantity;

            return `
                <div class="cart-item" data-id="${product.id}">
                    <img src="${product.image || 'assets/default-vegetable.jpg'}" alt="${productName}">
                    <div class="cart-item-info">
                        <h4>${productName}</h4>
                        <div class="cart-item-price">₹${product.price}/kg</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn minus" data-id="${product.id}">-</button>
                            <span class="quantity">${item.quantity} kg</span>
                            <button class="quantity-btn plus" data-id="${product.id}">+</button>
                            <button class="remove-item" data-id="${product.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-total">₹${itemTotal}</div>
                </div>
            `;
        }).join('');

        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(button.getAttribute('data-id'));
                const isPlus = button.classList.contains('plus');
                const isMinus = button.classList.contains('minus');

                if (isPlus) {
                    this.updateQuantity(productId,
                        this.cart.items.find(item => item.id === productId).quantity + 1);
                } else if (isMinus) {
                    this.updateQuantity(productId,
                        this.cart.items.find(item => item.id === productId).quantity - 1);
                }
            });
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(button.getAttribute('data-id'));
                this.removeFromCart(productId);
            });
        });
    }

    showCartNotification(productName, quantity) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${quantity}kg ${productName} added to cart</span>
        `;

        // Add to body
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const productId = parseInt(e.target.closest('.add-to-cart').getAttribute('data-id'));
                this.addToCart(productId);
            }
        });

        // Fast checkout button
        document.getElementById('fast-checkout').addEventListener('click', () => {
            this.processFastCheckout();
        });
    }

    processFastCheckout() {
        if (this.cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('logged_in') === 'true';
        if (!isLoggedIn) {
            alert('Please login to proceed with checkout');
            document.getElementById('auth-modal').style.display = 'flex';
            return;
        }

        // Show checkout options
        this.showCheckoutOptions();
    }

    showCheckoutOptions() {
        const checkoutModal = document.createElement('div');
        checkoutModal.className = 'checkout-modal';
        checkoutModal.innerHTML = `
            <div class="checkout-container">
                <h3>Checkout Options</h3>
                <div class="checkout-options">
                    <div class="checkout-option" data-method="whatsapp">
                        <i class="fab fa-whatsapp"></i>
                        <span>Order on WhatsApp</span>
                    </div>
                    <div class="checkout-option" data-method="online">
                        <i class="fas fa-credit-card"></i>
                        <span>Online Payment</span>
                    </div>
                    <div class="checkout-option" data-method="cod">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Cash on Delivery</span>
                    </div>
                </div>
                <button class="btn-secondary close-checkout">Cancel</button>
            </div>
        `;

        document.body.appendChild(checkoutModal);

        // Add event listeners
        checkoutModal.querySelector('.close-checkout').addEventListener('click', () => {
            checkoutModal.remove();
        });

        checkoutModal.querySelectorAll('.checkout-option').forEach(option => {
            option.addEventListener('click', () => {
                const method = option.getAttribute('data-method');
                this.processCheckout(method);
                checkoutModal.remove();
            });
        });
    }

    processCheckout(method) {
        switch (method) {
            case 'whatsapp':
                this.checkoutViaWhatsApp();
                break;
            case 'online':
                this.checkoutOnline();
                break;
            case 'cod':
                this.checkoutCOD();
                break;
        }
    }

    checkoutViaWhatsApp() {
        const userMobile = localStorage.getItem('user_mobile');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.mobile === userMobile);

        let message = `*Order Request - VeggieFresh*\n\n`;
        message += `Customer: ${user ? user.name : 'Guest'}\n`;
        message += `Mobile: ${userMobile || 'Not provided'}\n\n`;
        message += `*Order Items:*\n`;

        this.cart.items.forEach(item => {
            const product = window.products.find(p => p.id === item.id);
            if (product) {
                message += `- ${product.name} (${item.quantity}kg) - ₹${product.price * item.quantity}\n`;
            }
        });

        message += `\nSubtotal: ₹${this.cart.subtotal}`;
        message += `\nDelivery: ${this.cart.deliveryCharge === 0 ? 'FREE' : `₹${this.cart.deliveryCharge}`}`;
        message += `\n*Total: ₹${this.cart.total}*\n\n`;
        message += `Payment Method: COD\n`;
        message += `Please confirm this order and provide delivery address.`;

        const phone = '919876543210'; // Your WhatsApp number
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    checkoutOnline() {
        // In real app, integrate with payment gateway
        alert('Redirecting to payment gateway...');
        // Simulate payment processing
        setTimeout(() => {
            this.completeOrder('online');
        }, 2000);
    }

    checkoutCOD() {
        // Show address form
        this.showAddressForm('cod');
    }

    showAddressForm(paymentMethod) {
        const addressModal = document.createElement('div');
        addressModal.className = 'address-modal';

        const userMobile = localStorage.getItem('user_mobile');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.mobile === userMobile);

        let savedAddresses = '';
        if (user && user.addresses && user.addresses.length > 0) {
            savedAddresses = `
                <div class="saved-addresses">
                    <h4>Saved Addresses</h4>
                    ${user.addresses.map((address, index) => `
                        <div class="saved-address" data-index="${index}">
                            <input type="radio" name="address" id="address-${index}" ${index === 0 ? 'checked' : ''}>
                            <label for="address-${index}">
                                <strong>${address.type}</strong><br>
                                ${address.address}, ${address.landmark}<br>
                                ${address.city}, ${address.state} - ${address.pincode}<br>
                                Phone: ${address.phone}
                            </label>
                        </div>
                    `).join('')}
                </div>
                <p class="or-text">OR</p>
            `;
        }

        addressModal.innerHTML = `
            <div class="address-container">
                <h3>Delivery Address</h3>
                ${savedAddresses}
                <form id="address-form">
                    <div class="form-row">
                        <input type="text" name="name" placeholder="Full Name" required 
                               value="${user ? user.name : ''}">
                        <input type="tel" name="phone" placeholder="Phone Number" required
                               value="${userMobile || ''}">
                    </div>
                    <textarea name="address" placeholder="Full Address" rows="3" required></textarea>
                    <input type="text" name="landmark" placeholder="Landmark">
                    <div class="form-row">
                        <input type="text" name="city" placeholder="City" required>
                        <input type="text" name="state" placeholder="State" required>
                        <input type="text" name="pincode" placeholder="Pincode" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="save_address" checked>
                            Save this address for future orders
                        </label>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="btn-primary">Place Order (${paymentMethod.toUpperCase()})</button>
                        <button type="button" class="btn-secondary cancel-address">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(addressModal);

        // Form submission
        addressModal.querySelector('#address-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const address = Object.fromEntries(formData.entries());

            if (address.save_address === 'on' && user) {
                this.saveAddress(userMobile, address);
            }

            this.completeOrder(paymentMethod, address);
            addressModal.remove();
        });

        // Cancel button
        addressModal.querySelector('.cancel-address').addEventListener('click', () => {
            addressModal.remove();
        });
    }

    saveAddress(mobile, addressData) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.mobile === mobile);

        if (userIndex !== -1) {
            if (!users[userIndex].addresses) {
                users[userIndex].addresses = [];
            }

            users[userIndex].addresses.push({
                ...addressData,
                type: 'Home',
                id: Date.now()
            });

            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    completeOrder(paymentMethod, address = null) {
        // Generate order ID
        const orderId = 'ORD' + Date.now();

        // Create order object
        const order = {
            id: orderId,
            date: new Date().toISOString(),
            items: [...this.cart.items],
            subtotal: this.cart.subtotal,
            deliveryCharge: this.cart.deliveryCharge,
            discount: this.cart.discount,
            total: this.cart.total,
            paymentMethod: paymentMethod,
            status: paymentMethod === 'cod' ? 'confirmed' : 'paid',
            address: address,
            trackingId: paymentMethod === 'cod' ? null : 'TRK' + Date.now()
        };

        // Save order
        this.saveOrder(order);

        // Update user data
        this.updateUserOrderData(order);

        // Clear cart
        this.clearCart();

        // Show success message
        this.showOrderSuccess(order);

        // Generate invoice
        this.generateInvoice(order);

        // Send WhatsApp confirmation
        this.sendOrderConfirmation(order);
    }

    saveOrder(order) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    updateUserOrderData(order) {
        const userMobile = localStorage.getItem('user_mobile');
        if (!userMobile) return;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.mobile === userMobile);

        if (userIndex !== -1) {
            if (!users[userIndex].orders) {
                users[userIndex].orders = [];
            }

            users[userIndex].orders.push(order.id);
            users[userIndex].totalOrders = (users[userIndex].totalOrders || 0) + 1;
            users[userIndex].totalSpent = (users[userIndex].totalSpent || 0) + order.total;

            // Add loyalty points (1 point per ₹10 spent)
            const pointsEarned = Math.floor(order.total / 10);
            users[userIndex].loyaltyPoints = (users[userIndex].loyaltyPoints || 0) + pointsEarned;

            localStorage.setItem('users', JSON.stringify(users));

            // Update UI
            if (window.authSystem) {
                window.authSystem.updateUIForLoggedInUser();
            }
        }
    }

    clearCart() {
        this.cart = {
            items: [],
            subtotal: 0,
            total: 0,
            deliveryCharge: 0,
            discount: 0,
            lastUpdated: Date.now()
        };
        this.saveCart();
        this.updateCartDisplay();
    }

    showOrderSuccess(order) {
        const successModal = document.createElement('div');
        successModal.className = 'success-modal';
        successModal.innerHTML = `
            <div class="success-container">
                <i class="fas fa-check-circle"></i>
                <h3>Order Placed Successfully!</h3>
                <p>Order ID: <strong>${order.id}</strong></p>
                <p>Total Amount: <strong>₹${order.total}</strong></p>
                <p>Payment Method: <strong>${order.paymentMethod.toUpperCase()}</strong></p>
                ${order.trackingId ? `<p>Tracking ID: <strong>${order.trackingId}</strong></p>` : ''}
                <div class="success-buttons">
                    <button class="btn-primary download-invoice" data-order="${order.id}">
                        Download Invoice
                    </button>
                    <button class="btn-secondary close-success">Continue Shopping</button>
                </div>
            </div>
        `;

        document.body.appendChild(successModal);

        // Close button
        successModal.querySelector('.close-success').addEventListener('click', () => {
            successModal.remove();
        });

        // Download invoice
        successModal.querySelector('.download-invoice').addEventListener('click', () => {
            this.downloadInvoice(order);
        });
    }

    generateInvoice(order) {
        // Generate PDF invoice
        const invoice = {
            id: order.id,
            date: new Date(order.date).toLocaleDateString('en-IN'),
            customer: localStorage.getItem('user_mobile'),
            items: order.items.map(item => {
                const product = window.products.find(p => p.id === item.id);
                return {
                    name: product ? product.name : 'Product',
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                };
            }),
            subtotal: order.subtotal,
            delivery: order.deliveryCharge,
            discount: order.discount,
            total: order.total,
            paymentMethod: order.paymentMethod,
            gst: Math.round(order.total * 0.18) // 18% GST
        };

        // Save invoice
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        return invoice;
    }

    downloadInvoice(order) {
        const invoice = this.generateInvoice(order);

        // Create invoice HTML
        let invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .invoice-header { text-align: center; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #2ecc71; }
                    .invoice-details { margin-bottom: 20px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .invoice-table th { background-color: #f2f2f2; }
                    .total-row { font-weight: bold; }
                    .thank-you { text-align: center; margin-top: 30px; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <div class="company-name">VeggieFresh</div>
                    <div>Fresh Vegetables Store</div>
                    <div>Bangalore, Karnataka</div>
                    <div>GSTIN: 29ABCDE1234F1Z5</div>
                </div>
                
                <div class="invoice-details">
                    <div><strong>Invoice No:</strong> ${invoice.id}</div>
                    <div><strong>Date:</strong> ${invoice.date}</div>
                    <div><strong>Customer:</strong> ${invoice.customer}</div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price (₹)</th>
                            <th>Total (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        invoice.items.forEach(item => {
            invoiceHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity} kg</td>
                    <td>${item.price}</td>
                    <td>${item.total}</td>
                </tr>
            `;
        });

        invoiceHTML += `
                    </tbody>
                </table>
                
                <div style="float: right; width: 300px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Subtotal:</span>
                        <span>₹${invoice.subtotal}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Delivery Charge:</span>
                        <span>₹${invoice.delivery}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Discount:</span>
                        <span>₹${invoice.discount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>GST (18%):</span>
                        <span>₹${invoice.gst}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; border-top: 2px solid #000; padding-top: 10px;">
                        <span>Total:</span>
                        <span>₹${invoice.total + invoice.gst}</span>
                    </div>
                </div>
                
                <div class="thank-you">
                    <p>Thank you for your order!</p>
                    <p>Visit again at www.veggiefresh.com</p>
                </div>
            </body>
            </html>
        `;

        // Create download link
        const blob = new Blob([invoiceHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    sendOrderConfirmation(order) {
        const userMobile = localStorage.getItem('user_mobile');
        if (!userMobile) return;

        let message = `*Order Confirmation - VeggieFresh*\n\n`;
        message += `Order ID: ${order.id}\n`;
        message += `Date: ${new Date(order.date).toLocaleDateString('en-IN')}\n`;
        message += `Total: ₹${order.total}\n`;
        message += `Payment: ${order.paymentMethod.toUpperCase()}\n\n`;
        message += `Your order has been confirmed and will be delivered soon.\n`;
        message += `Thank you for shopping with VeggieFresh!`;

        // In real app, send via WhatsApp Business API
        console.log(`Order confirmation to ${userMobile}: ${message}`);
    }

    setupAbandonedCartCheck() {
        // Check every 30 minutes for abandoned carts
        setInterval(() => {
            this.checkAbandonedCart();
        }, 30 * 60 * 1000);
    }

    checkAbandonedCart() {
        const lastUpdate = localStorage.getItem('last_cart_update');
        if (!lastUpdate) return;

        const timeSinceUpdate = Date.now() - lastUpdate;
        const oneHour = 60 * 60 * 1000;

        if (timeSinceUpdate > oneHour && this.cart.items.length > 0) {
            this.sendAbandonedCartReminder();
        }
    }

    sendAbandonedCartReminder() {
        const userMobile = localStorage.getItem('user_mobile');
        if (!userMobile) return;

        const itemsCount = this.cart.items.reduce((total, item) => total + item.quantity, 0);
        const totalAmount = this.cart.total;

        let message = `*Reminder from VeggieFresh*\n\n`;
        message += `You have ${itemsCount} items (₹${totalAmount}) in your cart.\n`;
        message += `Complete your order now and get 10% extra loyalty points!\n\n`;
        message += `Shop now: https://veggiefresh.com\n\n`;
        message += `Use code: CART10 for 10% discount`;

        // In real app, send via WhatsApp/SMS
        console.log(`Abandoned cart reminder to ${userMobile}: ${message}`);

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Complete Your Order!', {
                body: `You have ${itemsCount} items in your cart worth ₹${totalAmount}`,
                icon: 'assets/logo.png'
            });
        }
    }
}

// Initialize cart system
document.addEventListener('DOMContentLoaded', () => {
    window.cartSystem = new CartSystem();
});