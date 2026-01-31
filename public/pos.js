// POS functionality
const TAX_RATE = 0.08; // 8% tax rate

let posCart = [];
let posProducts = [];

// Load products
async function loadPosProducts() {
    try {
        const response = await fetch('/api/products');
        posProducts = await response.json();
        displayPosProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayPosProducts(searchTerm = '') {
    const productsDiv = document.getElementById('posProducts');
    const filtered = searchTerm 
        ? posProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : posProducts;
    
    productsDiv.innerHTML = filtered.map(product => `
        <div class="pos-product-card" onclick="addToPosCart('${product.id}')">
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-stock">${product.stock_quantity || 0} in stock</div>
        </div>
    `).join('');
}

// Search functionality
document.getElementById('searchInput').oninput = (e) => {
    displayPosProducts(e.target.value);
};

// Add to POS cart
function addToPosCart(productId) {
    const product = posProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = posCart.find(item => item.product_id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        posCart.push({
            product_id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updatePosCartDisplay();
}

// Remove from POS cart
function removeFromPosCart(productId) {
    posCart = posCart.filter(item => item.product_id !== productId);
    updatePosCartDisplay();
}

// Update POS cart quantity
function updatePosCartQuantity(productId, change) {
    const item = posCart.find(item => item.product_id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromPosCart(productId);
        } else {
            updatePosCartDisplay();
        }
    }
}

// Update POS cart display
function updatePosCartDisplay() {
    const cartItemsDiv = document.getElementById('posCartItems');
    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    cartItemsDiv.innerHTML = posCart.length === 0 
        ? '<p style="text-align: center; color: #6c757d;">No items in cart</p>'
        : posCart.map(item => `
            <div class="pos-cart-item">
                <div class="pos-item-info">
                    <div class="pos-item-name">${item.name}</div>
                    <div class="pos-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
                </div>
                <div class="pos-item-controls">
                    <button class="qty-btn" onclick="updatePosCartQuantity('${item.product_id}', -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updatePosCartQuantity('${item.product_id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromPosCart('${item.product_id}')">×</button>
                </div>
            </div>
        `).join('');
    
    document.getElementById('posSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('posTax').textContent = tax.toFixed(2);
    document.getElementById('posTotal').textContent = total.toFixed(2);
    document.getElementById('posCheckoutTotal').textContent = total.toFixed(2);
}

// Clear POS cart
document.getElementById('posClearBtn').onclick = () => {
    if (posCart.length > 0 && confirm('Clear current sale?')) {
        posCart = [];
        updatePosCartDisplay();
    }
};

// POS checkout
const posCheckoutModal = document.getElementById('posCheckoutModal');
const receiptModal = document.getElementById('receiptModal');

document.getElementById('posCheckoutBtn').onclick = () => {
    if (posCart.length === 0) {
        alert('No items in cart!');
        return;
    }
    posCheckoutModal.style.display = 'block';
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

// POS checkout form
document.getElementById('posCheckoutForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const orderData = {
        order_type: 'in-person',
        customer_name: document.getElementById('posCustomerName').value || 'Walk-in Customer',
        payment_method: document.getElementById('posPaymentMethod').value,
        items: posCart
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Update payment status to paid
            await fetch(`/api/orders/${result.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_status: 'paid', status: 'completed' })
            });
            
            // Get and display receipt
            const receiptResponse = await fetch(`/api/orders/${result.id}/receipt`);
            const receipt = await receiptResponse.json();
            displayReceipt(receipt);
            
            posCart = [];
            updatePosCartDisplay();
            posCheckoutModal.style.display = 'none';
            document.getElementById('posCheckoutForm').reset();
        } else {
            alert('Error processing sale: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing sale. Please try again.');
    }
};

// Display receipt
function displayReceipt(receipt) {
    const receiptContent = document.getElementById('receiptContent');
    
    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h2>RECEIPT</h2>
            <p>Order #${receipt.order_id.substring(0, 8)}</p>
            <p>${new Date(receipt.date).toLocaleString()}</p>
        </div>
        
        <div style="margin: 1rem 0;">
            <strong>Customer:</strong> ${receipt.customer_name}<br>
            <strong>Payment:</strong> ${receipt.payment_method.replace('_', ' ').toUpperCase()}
        </div>
        
        <div class="receipt-items">
            ${receipt.items.map(item => `
                <div class="receipt-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        ${item.quantity} x $${parseFloat(item.unit_price).toFixed(2)}
                    </div>
                    <div>$${parseFloat(item.subtotal).toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="receipt-total">
            <span>TOTAL:</span>
            <span>$${parseFloat(receipt.total).toFixed(2)}</span>
        </div>
        
        <div style="text-align: center; margin-top: 2rem; color: #6c757d;">
            <p>Thank you for your business!</p>
        </div>
    `;
    
    receiptModal.style.display = 'block';
}

// Print receipt
document.getElementById('printReceiptBtn').onclick = () => {
    window.print();
};

// Initialize
loadPosProducts();
