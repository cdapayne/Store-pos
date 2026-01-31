// Admin functionality
let products = [];
let inventory = [];
let ingredients = [];
let orders = [];

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        
        // Load data for the selected tab
        switch(btn.dataset.tab) {
            case 'products':
                loadProducts();
                break;
            case 'inventory':
                loadInventory();
                break;
            case 'ingredients':
                loadIngredients();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'reports':
                loadReports();
                break;
        }
    };
});

// ========== PRODUCTS ==========

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts() {
    const productsDiv = document.getElementById('productsList');
    
    productsDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.category || '-'}</td>
                        <td>$${parseFloat(p.price).toFixed(2)}</td>
                        <td>${p.stock_quantity || 0}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-primary" onclick="editProduct('${p.id}')">Edit</button>
                                <button class="action-btn btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

document.getElementById('addProductBtn').onclick = () => {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').style.display = 'block';
};

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productImageUrl').value = product.image_url || '';
    document.getElementById('productModal').style.display = 'block';
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product');
    }
}

document.getElementById('productForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image_url: document.getElementById('productImageUrl').value
    };
    
    try {
        const url = id ? `/api/products/${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert(`Product ${id ? 'updated' : 'created'} successfully!`);
            document.getElementById('productModal').style.display = 'none';
            loadProducts();
        } else {
            alert('Error saving product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving product');
    }
};

// ========== INVENTORY ==========

async function loadInventory() {
    try {
        const response = await fetch('/api/inventory');
        inventory = await response.json();
        displayInventory();
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

function displayInventory() {
    const inventoryDiv = document.getElementById('inventoryList');
    
    inventoryDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Min Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${inventory.map(item => `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>$${parseFloat(item.price).toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit}</td>
                        <td>${item.min_quantity}</td>
                        <td>
                            <span class="status-badge ${item.quantity < item.min_quantity ? 'status-low' : 'status-ok'}">
                                ${item.quantity < item.min_quantity ? 'Low Stock' : 'OK'}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn btn-primary" onclick="updateInventory('${item.product_id}', ${item.quantity})">
                                Update
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function updateInventory(productId, currentQty) {
    const newQty = prompt(`Enter new quantity (current: ${currentQty}):`);
    if (newQty === null) return;
    
    try {
        const response = await fetch(`/api/inventory/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: parseInt(newQty) })
        });
        
        if (response.ok) {
            alert('Inventory updated successfully!');
            loadInventory();
        } else {
            alert('Error updating inventory');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating inventory');
    }
}

// ========== INGREDIENTS ==========

async function loadIngredients() {
    try {
        const response = await fetch('/api/ingredients');
        ingredients = await response.json();
        displayIngredients();
    } catch (error) {
        console.error('Error loading ingredients:', error);
    }
}

function displayIngredients() {
    const ingredientsDiv = document.getElementById('ingredientsList');
    
    ingredientsDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Cost/Unit</th>
                    <th>Min Qty</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${ingredients.map(ing => `
                    <tr>
                        <td>${ing.name}</td>
                        <td>${ing.quantity}</td>
                        <td>${ing.unit}</td>
                        <td>$${parseFloat(ing.cost_per_unit).toFixed(2)}</td>
                        <td>${ing.min_quantity}</td>
                        <td>
                            <span class="status-badge ${ing.quantity < ing.min_quantity ? 'status-low' : 'status-ok'}">
                                ${ing.quantity < ing.min_quantity ? 'Low' : 'OK'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-primary" onclick="editIngredient('${ing.id}')">Edit</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

document.getElementById('addIngredientBtn').onclick = () => {
    document.getElementById('ingredientModalTitle').textContent = 'Add Ingredient';
    document.getElementById('ingredientForm').reset();
    document.getElementById('ingredientId').value = '';
    document.getElementById('ingredientModal').style.display = 'block';
};

function editIngredient(id) {
    const ingredient = ingredients.find(i => i.id === id);
    if (!ingredient) return;
    
    document.getElementById('ingredientModalTitle').textContent = 'Edit Ingredient';
    document.getElementById('ingredientId').value = ingredient.id;
    document.getElementById('ingredientName').value = ingredient.name;
    document.getElementById('ingredientUnit').value = ingredient.unit;
    document.getElementById('ingredientQuantity').value = ingredient.quantity;
    document.getElementById('ingredientCost').value = ingredient.cost_per_unit;
    document.getElementById('ingredientMinQty').value = ingredient.min_quantity;
    document.getElementById('ingredientModal').style.display = 'block';
}

document.getElementById('ingredientForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('ingredientId').value;
    const ingredientData = {
        name: document.getElementById('ingredientName').value,
        unit: document.getElementById('ingredientUnit').value,
        quantity: parseFloat(document.getElementById('ingredientQuantity').value),
        cost_per_unit: parseFloat(document.getElementById('ingredientCost').value),
        min_quantity: parseFloat(document.getElementById('ingredientMinQty').value)
    };
    
    try {
        const url = id ? `/api/ingredients/${id}` : '/api/ingredients';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ingredientData)
        });
        
        if (response.ok) {
            alert(`Ingredient ${id ? 'updated' : 'created'} successfully!`);
            document.getElementById('ingredientModal').style.display = 'none';
            loadIngredients();
        } else {
            alert('Error saving ingredient');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving ingredient');
    }
};

// ========== ORDERS ==========

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        orders = await response.json();
        displayOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayOrders() {
    const ordersDiv = document.getElementById('ordersList');
    
    ordersDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.id.substring(0, 8)}</td>
                        <td>${order.order_type}</td>
                        <td>${order.customer_name || 'N/A'}</td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                        <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>
                            <span class="status-badge status-${order.payment_status}">
                                ${order.payment_status}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge status-${order.status}">
                                ${order.status}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn btn-primary" onclick="viewOrder('${order.id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function viewOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        const order = await response.json();
        
        const orderDetails = document.getElementById('orderDetails');
        orderDetails.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <strong>Order ID:</strong> ${order.id}<br>
                <strong>Type:</strong> ${order.order_type}<br>
                <strong>Customer:</strong> ${order.customer_name || 'N/A'}<br>
                <strong>Email:</strong> ${order.customer_email || 'N/A'}<br>
                <strong>Phone:</strong> ${order.customer_phone || 'N/A'}<br>
                <strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}<br>
                <strong>Payment Method:</strong> ${order.payment_method}<br>
                <strong>Payment Status:</strong> <span class="status-badge status-${order.payment_status}">${order.payment_status}</span><br>
                <strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            
            <h3>Items:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.product_name}</td>
                            <td>${item.quantity}</td>
                            <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                            <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 1rem; text-align: right;">
                <h3>Total: $${parseFloat(order.total_amount).toFixed(2)}</h3>
            </div>
        `;
        
        document.getElementById('orderModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading order:', error);
        alert('Error loading order details');
    }
}

// ========== REPORTS ==========

async function loadReports() {
    await Promise.all([
        loadSalesReport(),
        loadInventoryReport(),
        loadIngredientsReport(),
        loadProductSalesReport()
    ]);
}

async function loadSalesReport() {
    try {
        const response = await fetch('/api/reports/sales');
        const data = await response.json();
        
        const reportDiv = document.getElementById('salesReport');
        reportDiv.innerHTML = data.length === 0 
            ? '<p>No sales data available</p>'
            : `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Orders</th>
                            <th>Total Sales</th>
                            <th>Avg Order</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td>${row.date}</td>
                                <td>${row.order_count}</td>
                                <td>$${parseFloat(row.total_sales).toFixed(2)}</td>
                                <td>$${parseFloat(row.avg_order_value).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
    } catch (error) {
        console.error('Error loading sales report:', error);
    }
}

async function loadInventoryReport() {
    try {
        const response = await fetch('/api/reports/inventory');
        const data = await response.json();
        
        const reportDiv = document.getElementById('inventoryReport');
        reportDiv.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td>${row.name}</td>
                            <td>${row.category || '-'}</td>
                            <td>${row.quantity} ${row.unit}</td>
                            <td><span class="status-badge status-${row.status}">${row.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading inventory report:', error);
    }
}

async function loadIngredientsReport() {
    try {
        const response = await fetch('/api/reports/ingredients');
        const data = await response.json();
        
        const reportDiv = document.getElementById('ingredientsReport');
        reportDiv.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Ingredient</th>
                        <th>Quantity</th>
                        <th>Total Value</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td>${row.name}</td>
                            <td>${row.quantity} ${row.unit}</td>
                            <td>$${parseFloat(row.total_value).toFixed(2)}</td>
                            <td><span class="status-badge status-${row.status}">${row.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading ingredients report:', error);
    }
}

async function loadProductSalesReport() {
    try {
        const response = await fetch('/api/reports/product-sales');
        const data = await response.json();
        
        const reportDiv = document.getElementById('productSalesReport');
        reportDiv.innerHTML = data.length === 0
            ? '<p>No sales data available</p>'
            : `
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Units Sold</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td>${row.name}</td>
                                <td>${row.category || '-'}</td>
                                <td>${row.total_quantity}</td>
                                <td>$${parseFloat(row.total_revenue).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
    } catch (error) {
        console.error('Error loading product sales report:', error);
    }
}

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

// Initialize
loadProducts();
