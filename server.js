const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
initDatabase();

// ========== PRODUCT ENDPOINTS ==========

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, i.quantity as stock_quantity, i.unit
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
    `).all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, i.quantity as stock_quantity, i.unit
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = ?
    `).get(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', (req, res) => {
  try {
    const id = uuidv4();
    const { name, description, price, category, image_url } = req.body;
    
    db.prepare(`
      INSERT INTO products (id, name, description, price, category, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, description, price, category, image_url);
    
    // Initialize inventory
    db.prepare(`
      INSERT INTO inventory (product_id, quantity)
      VALUES (?, 0)
    `).run(id);
    
    res.status(201).json({ id, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { name, description, price, category, image_url } = req.body;
    
    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, category = ?, image_url = ?
      WHERE id = ?
    `).run(name, description, price, category, image_url, req.params.id);
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== INVENTORY ENDPOINTS ==========

// Get all inventory
app.get('/api/inventory', (req, res) => {
  try {
    const inventory = db.prepare(`
      SELECT i.*, p.name as product_name, p.price
      FROM inventory i
      JOIN products p ON i.product_id = p.id
    `).all();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory
app.put('/api/inventory/:productId', (req, res) => {
  try {
    const { quantity } = req.body;
    
    db.prepare(`
      UPDATE inventory
      SET quantity = ?, last_updated = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `).run(quantity, req.params.productId);
    
    res.json({ message: 'Inventory updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== INGREDIENTS ENDPOINTS ==========

// Get all ingredients
app.get('/api/ingredients', (req, res) => {
  try {
    const ingredients = db.prepare('SELECT * FROM ingredients').all();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ingredient
app.post('/api/ingredients', (req, res) => {
  try {
    const id = uuidv4();
    const { name, unit, quantity, cost_per_unit, min_quantity } = req.body;
    
    db.prepare(`
      INSERT INTO ingredients (id, name, unit, quantity, cost_per_unit, min_quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, unit, quantity || 0, cost_per_unit || 0, min_quantity || 10);
    
    res.status(201).json({ id, message: 'Ingredient created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ingredient
app.put('/api/ingredients/:id', (req, res) => {
  try {
    const { name, unit, quantity, cost_per_unit, min_quantity } = req.body;
    
    db.prepare(`
      UPDATE ingredients
      SET name = ?, unit = ?, quantity = ?, cost_per_unit = ?, min_quantity = ?
      WHERE id = ?
    `).run(name, unit, quantity, cost_per_unit, min_quantity, req.params.id);
    
    res.json({ message: 'Ingredient updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product ingredients (recipe)
app.get('/api/products/:id/ingredients', (req, res) => {
  try {
    const ingredients = db.prepare(`
      SELECT pi.*, i.name, i.unit, i.quantity as available_quantity
      FROM product_ingredients pi
      JOIN ingredients i ON pi.ingredient_id = i.id
      WHERE pi.product_id = ?
    `).all(req.params.id);
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add ingredient to product
app.post('/api/products/:id/ingredients', (req, res) => {
  try {
    const id = uuidv4();
    const { ingredient_id, quantity_needed } = req.body;
    
    db.prepare(`
      INSERT INTO product_ingredients (id, product_id, ingredient_id, quantity_needed)
      VALUES (?, ?, ?, ?)
    `).run(id, req.params.id, ingredient_id, quantity_needed);
    
    res.status(201).json({ id, message: 'Ingredient added to product successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ORDER ENDPOINTS ==========

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order with items
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const items = db.prepare(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);
    
    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', (req, res) => {
  try {
    const orderId = uuidv4();
    const { order_type, customer_name, customer_email, customer_phone, items, payment_method } = req.body;
    
    // Calculate total and validate stock
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }
      
      // Check inventory availability
      const inventory = db.prepare('SELECT quantity FROM inventory WHERE product_id = ?').get(item.product_id);
      if (!inventory || inventory.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${inventory?.quantity || 0}, Requested: ${item.quantity}` });
      }
      
      const subtotal = product.price * item.quantity;
      total += subtotal;
      
      orderItems.push({
        id: uuidv4(),
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal
      });
    }
    
    // Create order
    db.prepare(`
      INSERT INTO orders (id, order_type, customer_name, customer_email, customer_phone, total_amount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, order_type, customer_name, customer_email, customer_phone, total, payment_method);
    
    // Create order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of orderItems) {
      insertItem.run(item.id, item.order_id, item.product_id, item.quantity, item.unit_price, item.subtotal);
      
      // Update inventory
      db.prepare(`
        UPDATE inventory
        SET quantity = quantity - ?, last_updated = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).run(item.quantity, item.product_id);
      
      // Update ingredient inventory if product has ingredients
      const productIngredients = db.prepare(`
        SELECT ingredient_id, quantity_needed
        FROM product_ingredients
        WHERE product_id = ?
      `).all(item.product_id);
      
      for (const pi of productIngredients) {
        db.prepare(`
          UPDATE ingredients
          SET quantity = quantity - ?
          WHERE id = ?
        `).run(pi.quantity_needed * item.quantity, pi.ingredient_id);
      }
    }
    
    res.status(201).json({ id: orderId, total, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { status, payment_status } = req.body;
    
    if (!status && !payment_status) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    if (status) {
      if (status === 'completed') {
        db.prepare(`
          UPDATE orders
          SET status = ?, completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(status, req.params.id);
      } else {
        db.prepare(`
          UPDATE orders
          SET status = ?
          WHERE id = ?
        `).run(status, req.params.id);
      }
    }
    
    if (payment_status) {
      db.prepare(`
        UPDATE orders
        SET payment_status = ?
        WHERE id = ?
      `).run(payment_status, req.params.id);
    }
    
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== REPORTS ENDPOINTS ==========

// Sales report
app.get('/api/reports/sales', (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as total_sales,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE payment_status = 'paid'
    `;
    
    const params = [];
    if (start_date) {
      query += ' AND created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND created_at <= ?';
      params.push(end_date);
    }
    
    query += ' GROUP BY DATE(created_at) ORDER BY date DESC';
    
    const report = db.prepare(query).all(...params);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory report
app.get('/api/reports/inventory', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT 
        p.name,
        p.category,
        i.quantity,
        i.unit,
        i.min_quantity,
        CASE WHEN i.quantity < i.min_quantity THEN 'low' ELSE 'ok' END as status
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      ORDER BY i.quantity ASC
    `).all();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ingredients report
app.get('/api/reports/ingredients', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT 
        name,
        quantity,
        unit,
        min_quantity,
        cost_per_unit,
        quantity * cost_per_unit as total_value,
        CASE WHEN quantity < min_quantity THEN 'low' ELSE 'ok' END as status
      FROM ingredients
      ORDER BY quantity ASC
    `).all();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product sales report
app.get('/api/reports/product-sales', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT 
        p.name,
        p.category,
        COUNT(oi.id) as times_sold,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY p.id
      ORDER BY total_revenue DESC
    `).all();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== RECEIPT ENDPOINT ==========

// Get receipt for order
app.get('/api/orders/:id/receipt', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const items = db.prepare(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);
    
    const receipt = {
      order_id: order.id,
      order_type: order.order_type,
      date: order.created_at,
      customer_name: order.customer_name,
      items: items.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      })),
      total: order.total_amount,
      payment_method: order.payment_method,
      payment_status: order.payment_status
    };
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/pos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pos.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Store POS Server running on port ${PORT}`);
  console.log(`POS Interface: http://localhost:${PORT}/pos`);
  console.log(`Online Store: http://localhost:${PORT}/`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin`);
});
