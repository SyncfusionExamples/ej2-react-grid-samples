"""
Seed script to generate 2,000 sample inventory records
Run this script to populate the database with sample data
"""

import random
import sys
from datetime import datetime, timedelta
from app import app, db, Product

# Product data templates
CATEGORIES = [
    'Electronics', 'Accessories', 'Storage', 'Networking', 
    'Software', 'Components', 'Peripherals', 'Smart Devices'
]

PRODUCTS_TEMPLATES = [
    'Wireless Mouse', 'USB-C Cable', 'SSD Drive', 'Network Router',
    'LED Monitor', 'Mechanical Keyboard', 'USB Hub', 'Webcam',
    'Headphones', 'Graphics Card', 'RAM Module', 'Motherboard',
    'Power Supply', 'Case Fan', 'Cooling Pad', 'Desk Lamp',
    'Phone Stand', 'Cable Organizer', 'Screen Protector', 'Adapter',
    'Hard Drive', 'Processor', 'Laptop', 'Tablet',
    'Smart Watch', 'Fitness Tracker', 'Bluetooth Speaker', 'Phone Charger'
]

STATUSES = ['In Stock', 'In Stock', 'In Stock', 'Out of Stock', 'Discontinued']

def generate_product_id():
    """Generate a unique product identifier."""
    return f"PROD-{random.randint(100000, 999999)}"

def generate_products(count=2000):
    """Generate sample product records"""
    products = []
    
    for i in range(count):
        category = random.choice(CATEGORIES)
        product_name = f"{random.choice(PRODUCTS_TEMPLATES)} {random.choice(['Pro', 'Plus', 'Max', 'Ultra', 'Lite', 'Standard'])}"
        
        product = Product(
            productName=product_name,
            category=category,
            productId=f"PROD-{str(i+1).zfill(6)}",
            price=round(random.uniform(9.99, 2999.99), 2),
            stock=random.randint(0, 5000),
            status=random.choice(STATUSES),
            createdAt=datetime.utcnow() - timedelta(days=random.randint(0, 365)),
            updatedAt=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        products.append(product)
    
    return products

def seed_database():
    """Populate database with sample data"""
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        Product.query.delete()
        db.session.commit()
        
        # Generate and insert sample data
        print("Generating 2,000 sample products...")
        products = generate_products(2000)
        
        print("Inserting data into database...")
        db.session.bulk_save_objects(products)
        db.session.commit()
        
        # Verify insertion
        count = Product.query.count()
        print(f"[OK] Successfully seeded database with {count} products!")

if __name__ == '__main__':
    # Force UTF-8 stdout so this script works on Windows consoles too.
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except (AttributeError, OSError):
        pass
    seed_database()
