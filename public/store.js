// Store functionality
let cart = [];
let products = [];

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts();
        loadCategories();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts(filter = 'all') {
    const productsDiv = document.getElementById('products');
    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(p => p.category === filter);
    
    productsDiv.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="addToCart('${product.id}')">
            <div class="product-image">${product.image_url || '🛍️'}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description || ''}</div>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-stock">Stock: ${product.stock_quantity || 0}</div>
            </div>
        </div>
    `).join('');
}

// Load categories
function loadCategories() {
    const categories = [...new Set(products.map(p => p.category).filter(c => c))];
    const categoryDiv = document.getElementById('categoryFilter');
    
    categoryDiv.innerHTML = `
        <button class="category-btn active" data-category="all" onclick="filterByCategory('all')">All Products</button>
        ${categories.map(cat => `
            <button class="category-btn" data-category="${cat}" onclick="filterByCategory('${cat}')">${cat}</button>
        `).join('')}
    `;
}

// Filter by category
function filterByCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    displayProducts(category);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.product_id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            product_id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.product_id !== productId);
    updateCartDisplay();
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.product_id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

// Update cart display
function updateCartDisplay() {
    document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartItemsDiv = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartItemsDiv.innerHTML = cart.length === 0 
        ? '<p>Your cart is empty</p>'
        : cart.map(item => `
            <div class="pos-cart-item">
                <div class="pos-item-info">
                    <div class="pos-item-name">${item.name}</div>
                    <div class="pos-item-price">$${parseFloat(item.price).toFixed(2)}</div>
                </div>
                <div class="pos-item-controls">
                    <button class="qty-btn" onclick="updateCartQuantity('${item.product_id}', -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity('${item.product_id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.product_id}')">Remove</button>
                </div>
            </div>
        `).join('');
    
    document.getElementById('cartTotal').textContent = total.toFixed(2);
    document.getElementById('checkoutTotal').textContent = total.toFixed(2);
}

// Modal functionality
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const cartBtn = document.getElementById('cartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

cartBtn.onclick = () => {
    cartModal.style.display = 'block';
};

checkoutBtn.onclick = () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
};

clearCartBtn.onclick = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        updateCartDisplay();
    }
};

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        this.closest('.modal').style.display = 'none';
    };
});

window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Checkout form
document.getElementById('checkoutForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const orderData = {
        order_type: 'online',
        customer_name: document.getElementById('customerName').value,
        customer_email: document.getElementById('customerEmail').value,
        customer_phone: document.getElementById('customerPhone').value,
        payment_method: document.getElementById('paymentMethod').value,
        items: cart
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Update payment status to paid (in real app, this would be after payment gateway confirms)
            await fetch(`/api/orders/${result.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_status: 'paid', status: 'completed' })
            });
            
            alert(`Order placed successfully! Order ID: ${result.id}\nTotal: $${result.total.toFixed(2)}`);
            cart = [];
            updateCartDisplay();
            checkoutModal.style.display = 'none';
            document.getElementById('checkoutForm').reset();
        } else {
            alert('Error placing order: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error placing order. Please try again.');
    }
};

// Initialize
loadProducts();
