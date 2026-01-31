const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');

console.log('Adding sample data...\n');

// Sample products
const products = [
    {
        id: uuidv4(),
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, and cheese',
        price: 12.99,
        category: 'Food'
    },
    {
        id: uuidv4(),
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, basil, and tomato sauce',
        price: 15.99,
        category: 'Food'
    },
    {
        id: uuidv4(),
        name: 'Caesar Salad',
        description: 'Romaine lettuce with Caesar dressing and croutons',
        price: 9.99,
        category: 'Food'
    },
    {
        id: uuidv4(),
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 4.99,
        category: 'Sides'
    },
    {
        id: uuidv4(),
        name: 'Coca Cola',
        description: 'Classic soft drink',
        price: 2.99,
        category: 'Beverages'
    },
    {
        id: uuidv4(),
        name: 'Iced Coffee',
        description: 'Cold brew coffee with ice',
        price: 4.49,
        category: 'Beverages'
    },
    {
        id: uuidv4(),
        name: 'Chocolate Cake',
        description: 'Rich chocolate layer cake',
        price: 6.99,
        category: 'Desserts'
    },
    {
        id: uuidv4(),
        name: 'Apple Pie',
        description: 'Homemade apple pie with cinnamon',
        price: 5.99,
        category: 'Desserts'
    }
];

console.log('Creating products...');
const productStmt = db.prepare(`
    INSERT INTO products (id, name, description, price, category)
    VALUES (?, ?, ?, ?, ?)
`);

for (const product of products) {
    productStmt.run(product.id, product.name, product.description, product.price, product.category);
    console.log(`  ✓ ${product.name}`);
}

// Initialize inventory for all products
console.log('\nSetting up inventory...');
const inventoryStmt = db.prepare(`
    INSERT INTO inventory (product_id, quantity, unit, min_quantity)
    VALUES (?, ?, ?, ?)
`);

for (const product of products) {
    const quantity = Math.floor(Math.random() * 50) + 20; // Random quantity between 20-70
    inventoryStmt.run(product.id, quantity, 'units', 10);
    console.log(`  ✓ ${product.name}: ${quantity} units`);
}

// Sample ingredients
const ingredients = [
    { id: uuidv4(), name: 'Beef Patty', unit: 'lbs', quantity: 50, cost_per_unit: 5.99, min_quantity: 10 },
    { id: uuidv4(), name: 'Cheese', unit: 'lbs', quantity: 30, cost_per_unit: 4.50, min_quantity: 5 },
    { id: uuidv4(), name: 'Lettuce', unit: 'lbs', quantity: 20, cost_per_unit: 2.99, min_quantity: 5 },
    { id: uuidv4(), name: 'Tomato', unit: 'lbs', quantity: 25, cost_per_unit: 3.49, min_quantity: 5 },
    { id: uuidv4(), name: 'Pizza Dough', unit: 'lbs', quantity: 40, cost_per_unit: 1.99, min_quantity: 10 },
    { id: uuidv4(), name: 'Mozzarella', unit: 'lbs', quantity: 35, cost_per_unit: 5.99, min_quantity: 8 },
    { id: uuidv4(), name: 'Tomato Sauce', unit: 'oz', quantity: 200, cost_per_unit: 0.50, min_quantity: 50 },
    { id: uuidv4(), name: 'Basil', unit: 'oz', quantity: 10, cost_per_unit: 2.00, min_quantity: 5 },
    { id: uuidv4(), name: 'Potatoes', unit: 'lbs', quantity: 100, cost_per_unit: 0.99, min_quantity: 20 },
    { id: uuidv4(), name: 'Coffee Beans', unit: 'lbs', quantity: 15, cost_per_unit: 12.99, min_quantity: 5 }
];

console.log('\nCreating ingredients...');
const ingredientStmt = db.prepare(`
    INSERT INTO ingredients (id, name, unit, quantity, cost_per_unit, min_quantity)
    VALUES (?, ?, ?, ?, ?, ?)
`);

for (const ingredient of ingredients) {
    ingredientStmt.run(ingredient.id, ingredient.name, ingredient.unit, ingredient.quantity, 
                       ingredient.cost_per_unit, ingredient.min_quantity);
    console.log(`  ✓ ${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`);
}

// Link ingredients to products (recipes)
console.log('\nLinking ingredients to products (recipes)...');
const productIngredientStmt = db.prepare(`
    INSERT INTO product_ingredients (id, product_id, ingredient_id, quantity_needed)
    VALUES (?, ?, ?, ?)
`);

// Classic Burger recipe
const burger = products.find(p => p.name === 'Classic Burger');
const beefPatty = ingredients.find(i => i.name === 'Beef Patty');
const cheese = ingredients.find(i => i.name === 'Cheese');
const lettuce = ingredients.find(i => i.name === 'Lettuce');
const tomato = ingredients.find(i => i.name === 'Tomato');

productIngredientStmt.run(uuidv4(), burger.id, beefPatty.id, 0.5);
productIngredientStmt.run(uuidv4(), burger.id, cheese.id, 0.1);
productIngredientStmt.run(uuidv4(), burger.id, lettuce.id, 0.05);
productIngredientStmt.run(uuidv4(), burger.id, tomato.id, 0.1);
console.log('  ✓ Classic Burger recipe');

// Pizza recipe
const pizza = products.find(p => p.name === 'Margherita Pizza');
const dough = ingredients.find(i => i.name === 'Pizza Dough');
const mozzarella = ingredients.find(i => i.name === 'Mozzarella');
const sauce = ingredients.find(i => i.name === 'Tomato Sauce');
const basil = ingredients.find(i => i.name === 'Basil');

productIngredientStmt.run(uuidv4(), pizza.id, dough.id, 1);
productIngredientStmt.run(uuidv4(), pizza.id, mozzarella.id, 0.5);
productIngredientStmt.run(uuidv4(), pizza.id, sauce.id, 8);
productIngredientStmt.run(uuidv4(), pizza.id, basil.id, 0.5);
console.log('  ✓ Margherita Pizza recipe');

// French Fries recipe
const fries = products.find(p => p.name === 'French Fries');
const potatoes = ingredients.find(i => i.name === 'Potatoes');
productIngredientStmt.run(uuidv4(), fries.id, potatoes.id, 0.75);
console.log('  ✓ French Fries recipe');

// Coffee recipe
const coffee = products.find(p => p.name === 'Iced Coffee');
const coffeeBeans = ingredients.find(i => i.name === 'Coffee Beans');
productIngredientStmt.run(uuidv4(), coffee.id, coffeeBeans.id, 0.05);
console.log('  ✓ Iced Coffee recipe');

console.log('\n✅ Sample data added successfully!');
console.log('\nYou can now:');
console.log('  - Browse products at http://localhost:3000/');
console.log('  - Use POS at http://localhost:3000/pos');
console.log('  - Manage everything at http://localhost:3000/admin');
