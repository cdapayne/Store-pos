# Store POS System

A comprehensive all-in-one Point of Sale (POS) and online ordering system for retail stores and restaurants. This system integrates in-person and online sales, inventory management, ingredient tracking, and reporting capabilities.

## Features

### 🛍️ Online Store
- Customer-facing web store for online ordering
- Product browsing with category filters
- Shopping cart functionality
- Online checkout with multiple payment methods
- Order tracking

### 💳 Point of Sale (POS)
- In-person sales interface
- Quick product search
- Real-time cart management
- Multiple payment methods (cash, card, mobile)
- Receipt generation and printing
- Tax calculation

### 📦 Inventory Management
- Real-time inventory tracking
- Low stock alerts
- Automatic inventory updates on sales
- Multi-unit support

### 🥘 Ingredient Tracking
- Track ingredients for food products
- Recipe management (link ingredients to products)
- Automatic ingredient deduction on sales
- Cost per unit tracking
- Low ingredient alerts

### 📊 Reports & Analytics
- Sales reports (daily, with order counts and totals)
- Inventory status reports
- Ingredient usage and status
- Top-selling products analysis
- Revenue tracking

### 🧾 Receipt Generation
- Professional receipt formatting
- Order details and itemization
- Payment method tracking
- Print functionality

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite with better-sqlite3
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Data Format**: JSON API

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/cdapayne/Store-pos.git
cd Store-pos
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on port 3000 (or the PORT environment variable if set).

## Usage

Once the server is running, you can access:

- **Online Store**: http://localhost:3000/ 
  - Browse products, add to cart, and checkout
  - For customers to place online orders

- **POS Interface**: http://localhost:3000/pos
  - For in-person sales
  - Search products, manage cart, process payments
  - Generate receipts

- **Admin Panel**: http://localhost:3000/admin
  - Manage products, inventory, and ingredients
  - View orders and reports
  - Configure system settings

## Getting Started

### Initial Setup

1. **Add Products**: Go to Admin Panel → Products tab → Add Product
   - Enter product name, description, price, and category
   - Products are automatically added to inventory

2. **Set Inventory**: Admin Panel → Inventory tab
   - Set initial stock quantities
   - Configure minimum quantity alerts

3. **Add Ingredients** (Optional, for food businesses): Admin Panel → Ingredients tab
   - Add ingredients with quantities and units
   - Link ingredients to products for automatic tracking

4. **Start Selling**:
   - Use POS interface for in-person sales
   - Share online store link with customers for online orders

### Processing Sales

#### In-Person (POS):
1. Search and click products to add to cart
2. Adjust quantities as needed
3. Click "Checkout"
4. Enter customer name (optional) and payment method
5. Complete sale to generate receipt

#### Online Orders:
1. Customers browse and add products to cart
2. At checkout, enter delivery information
3. Select payment method
4. Order is automatically processed and inventory updated

### Managing Orders

- View all orders in Admin Panel → Orders tab
- Click "View" to see order details
- Track payment status and order status

### Viewing Reports

Admin Panel → Reports tab provides:
- Sales trends and totals
- Inventory levels and alerts
- Ingredient status
- Best-selling products

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Inventory
- `GET /api/inventory` - Get all inventory
- `PUT /api/inventory/:productId` - Update inventory

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Create ingredient
- `PUT /api/ingredients/:id` - Update ingredient
- `GET /api/products/:id/ingredients` - Get product recipe
- `POST /api/products/:id/ingredients` - Add ingredient to product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/:id/receipt` - Get order receipt

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/ingredients` - Ingredients report
- `GET /api/reports/product-sales` - Product sales report

## Database Schema

The system uses SQLite with the following main tables:

- **products**: Product information (name, price, category, etc.)
- **inventory**: Stock quantities and tracking
- **ingredients**: Ingredient inventory
- **product_ingredients**: Recipe links (which ingredients make which products)
- **orders**: Order records with customer and payment info
- **order_items**: Individual items in each order
- **transactions**: Payment transaction records

## Development

For development with auto-reload:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Customization

### Payment Integration
The system has placeholder payment methods. To integrate real payment processing:
1. Add payment gateway SDK (Stripe, Square, PayPal, etc.)
2. Update checkout forms to collect payment details
3. Modify order creation endpoints to process payments

### Tax Configuration
Default tax rate is 8% in the POS system. To change:
- Edit `public/pos.js`, line 64: `const tax = subtotal * 0.08;`

### Styling
- Modify `public/styles.css` to customize the look and feel
- Color scheme uses purple gradient (`#667eea` to `#764ba2`)

## Future Enhancements

Potential additions:
- User authentication and role-based access
- Multi-location support
- Supplier management
- Purchase order tracking
- Email notifications
- SMS notifications
- Barcode scanning
- Loyalty programs
- Discount/promotion management
- Advanced analytics and charts
- Export reports to PDF/Excel
- Integration with accounting software

## License

MIT License

## Support

For issues, questions, or contributions, please open an issue on GitHub.