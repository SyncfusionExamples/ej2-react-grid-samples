"""
Flask REST API for Inventory Management Application
Provides CRUD operations and supports server-side data binding for Syncfusion DataGrid
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from functools import wraps
import os
import json

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///inventory.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# ============================================================================
# Models
# ============================================================================

class Product(db.Model):
    """Product model for inventory management"""
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    productName = db.Column(db.String(255), nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    # Business-facing product identifier, e.g. PROD-000001
    productId = db.Column('productId', db.String(50), unique=True, nullable=False, index=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(50), nullable=False, default='In Stock')
    # Optional supplier name (safe to read; column added on first request if missing)
    supplier = db.Column(db.String(100), nullable=True)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert product object to dictionary"""
        return {
            'id': self.id,
            'productName': self.productName,
            'category': self.category,
            'productId': self.productId,
            'price': self.price,
            'stock': self.stock,
            'status': self.status,
            'supplier': self.supplier,
            'createdAt': self.createdAt.isoformat(),
            'updatedAt': self.updatedAt.isoformat()
        }


def _ensure_supplier_column():
    """Add the supplier column if it does not exist yet.
    Safe to call multiple times — failures are logged and ignored."""
    try:
        with db.engine.connect() as conn:
            result = conn.execute(db.text("PRAGMA table_info(products)")).fetchall()
            columns = [row[1] for row in result]
            if 'supplier' not in columns:
                conn.execute(db.text("ALTER TABLE products ADD COLUMN supplier VARCHAR(100)"))
                conn.commit()
                app.logger.info('[_ensure_supplier_column] Added supplier column.')
    except Exception as ex:
        app.logger.warning(f'[_ensure_supplier_column] Could not alter table: {ex}')
# ============================================================================
# Helper Functions
# ============================================================================

def apply_filters(query, filters):
    """Apply dynamic filters to query.

    Accepts Syncfusion operator names like 'startsWith', 'endsWith',
    'contains', 'equal', 'notEqual', 'greaterThan', 'lessThan',
    'greaterThanOrEqual', 'lessThanOrEqual' (case-insensitive).
    String operators use case-insensitive LIKE matching.
    """
    if isinstance(filters, list):
        for filter_item in filters:
            field = filter_item.get('field')
            operator = str(filter_item.get('operator', 'equal') or 'equal').lower()
            value = filter_item.get('value')

            if field and hasattr(Product, field):
                column = getattr(Product, field)

                if operator == 'equal':
                    query = query.filter(column == value)
                elif operator in ('notequal', 'notequals'):
                    query = query.filter(column != value)
                elif operator == 'startswith':
                    query = query.filter(column.ilike(f'{value}%'))
                elif operator == 'endswith':
                    query = query.filter(column.ilike(f'%{value}'))
                elif operator == 'contains':
                    query = query.filter(column.ilike(f'%{value}%'))
                elif operator == 'greaterthan':
                    query = query.filter(column > value)
                elif operator == 'lessthan':
                    query = query.filter(column < value)
                elif operator == 'greaterthanorequal':
                    query = query.filter(column >= value)
                elif operator == 'lessthanorequal':
                    query = query.filter(column <= value)
                else:
                    # Unknown operator: fall back to equality for safety
                    query = query.filter(column == value)
    return query

def apply_sorting(query, sorting):
    """Apply dynamic sorting to query.

    Accepts either {"field": "..."} or {"name": "..."} keys so the
    client can use the Syncfusion Pure React Grid "field" convention
    or the older EJ2 "name" convention.
    """
    if sorting and len(sorting) > 0:
        for sort_item in sorting:
            field = sort_item.get('field') or sort_item.get('name')
            direction = sort_item.get('direction', 'asc') or 'asc'

            if field and hasattr(Product, field):
                column = getattr(Product, field)
                dir_normalized = str(direction).lower()
                if dir_normalized == 'desc' or dir_normalized == 'descending':
                    query = query.order_by(column.desc())
                else:
                    query = query.order_by(column.asc())
    else:
        query = query.order_by(Product.id.asc())
    
    return query

def handle_search(query, search_key):
    """Handle search across multiple fields.

    Accepts the search value as either a plain string or a JSON-encoded
    array of strings (Syncfusion Pure React Grid sends an array). When
    provided as a list, searches are combined with OR over each term.
    """
    if not search_key:
        return query

    # Coerce: support plain string, JSON string, or already-decoded list passed in
    terms: list[str] = []
    if isinstance(search_key, list):
        terms = [str(t) for t in search_key if t]
    elif isinstance(search_key, str):
        try:
            decoded = json.loads(search_key)
            if isinstance(decoded, list):
                terms = [str(t) for t in decoded if t]
            else:
                terms = [str(decoded)]
        except (json.JSONDecodeError, TypeError):
            terms = [search_key]

    if not terms:
        return query

    or_clauses = []
    for term in terms:
        pattern = f'%{term}%'
        # Use ilike for case-insensitive matching across searchable text fields
        or_clauses.append(Product.productName.ilike(pattern))
        or_clauses.append(Product.productId.ilike(pattern))
        or_clauses.append(Product.category.ilike(pattern))

    if or_clauses:
        query = query.filter(db.or_(*or_clauses))

    return query

# ============================================================================
# API Routes
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

@app.route('/api/products', methods=['GET'])
def get_products():
    """
    Get products with server-side data binding support
    Supports paging, filtering, sorting, and searching
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - take: Number of records to take (default: 10)
    - sortBy: Sorting information as JSON
    - where: Filtering information as JSON
    - search: Search keyword
    """
    try:
        # Get pagination parameters
        skip = request.args.get('skip', default=0, type=int)
        take = request.args.get('take', default=10, type=int)
        
        # Get filtering, sorting, and search parameters
        where = request.args.get('where', default=None, type=str)
        sorted_by = request.args.get('sorted', default=None, type=str)
        # `search` may arrive as a JSON array string (Pure React Grid) or plain string.
        # We'll let handle_search do the parsing to keep the contract flexible.
        search_key = request.args.get('search', default=None, type=str)

        # Debug: log raw query parameters so client-side mapping can be verified
        app.logger.info(
            '[/api/products] raw params skip=%s take=%s sorted=%s where=%s search=%s',
            skip,
            take,
            sorted_by,
            where,
            search_key,
        )
        app.logger.info('[/api/products] full RawQueryString=%s', request.query_string.decode('utf-8'))

        # Build base query
        query = Product.query

        # Apply search
        if search_key:
            query = handle_search(query, search_key)

        # Apply filters
        if where:
            try:
                filters = json.loads(where)
                query = apply_filters(query, filters)
            except json.JSONDecodeError:
                pass
        
        # Get total count after applying search and filters (so paging uses correct total)
        total = query.count()
        
        # Apply sorting
        if sorted_by:
            try:
                sorting = json.loads(sorted_by)
                query = apply_sorting(query, sorting)
            except json.JSONDecodeError:
                query = query.order_by(Product.id.asc())
        else:
            query = query.order_by(Product.id.asc())
        
        # Apply pagination
        products = query.offset(skip).limit(take).all()
        
        return jsonify({
            'result': [product.to_dict() for product in products],
            'count': total
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<string:productId>', methods=['GET'])
def get_product(productId):
    """Get a single product by its business key."""
    try:
        product = Product.query.filter_by(productId=productId).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(product.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NOTE: Per-field validation lives on the client.
# The Server only enforces database integrity constraints (unique productId value, required columns, numeric coercion).
# `_validate_product_payload` is kept for internal use but no longer blocks write requests.


def _validate_product_payload(data: dict) -> dict:
    """Optional internal helper. No longer used to block writes from the API.
    Kept for potential future server-side validation needs."""
    return {}


@app.route('/api/products', methods=['POST'])
def create_product():
    """Create a new product. No per-field validation here — that is handled client-side."""
    try:
        data = request.get_json() or {}

        _ensure_supplier_column()
        product_id = str(data['productId']).strip()
        if Product.query.filter_by(productId=product_id).first():
            return jsonify({'error': 'Product ID already exists', 'fields': {'productId': 'Product ID already exists'}}), 400

        product = Product(
            productName=str(data['productName']).strip(),
            category=str(data['category']).strip(),
            productId=product_id,
            price=float(data['price']),
            stock=int(data['stock']),
            status=str(data['status']).strip(),
            supplier=data.get('supplier', None)
        )

        db.session.add(product)
        db.session.commit()

        return jsonify(product.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/products/<string:productId>', methods=['PUT'])
def update_product(productId):
    """Update an existing product. No per-field validation here — that is handled client-side."""
    try:
        product = Product.query.filter_by(productId=productId).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        data = request.get_json() or {}

        _ensure_supplier_column()

        for field in ('productName', 'category', 'price', 'stock', 'status', 'supplier'):
            if field in data:
                setattr(product, field, data[field])

        product.updatedAt = datetime.utcnow()
        db.session.commit()

        return jsonify(product.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<string:productId>', methods=['DELETE'])
def delete_product(productId):
    """Delete a product by its business key."""
    try:
        product = Product.query.filter_by(productId=productId).first()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get inventory statistics"""
    try:
        total_products = Product.query.count()
        total_stock = db.session.query(db.func.sum(Product.stock)).scalar() or 0
        total_value = db.session.query(db.func.sum(Product.price * Product.stock)).scalar() or 0
        in_stock_count = Product.query.filter_by(status='In Stock').count()
        
        return jsonify({
            'totalProducts': total_products,
            'totalStock': total_stock,
            'totalValue': total_value,
            'inStockProducts': in_stock_count
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        _ensure_supplier_column()
    app.run(debug=True, host='0.0.0.0', port=5000)
