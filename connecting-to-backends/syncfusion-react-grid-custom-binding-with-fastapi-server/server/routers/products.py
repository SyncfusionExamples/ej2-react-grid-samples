from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pathlib import Path
import json

router = APIRouter()

# Data file path
DATA_FILE = Path(__file__).parent.parent / 'products_data.json'

# In-memory data store
products: List[Dict[str, Any]] = []


def load_products() -> None:
    """Load products from JSON file."""
    global products
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r', encoding='utf-8') as file:
            products = json.load(file)


def save_products() -> None:
    """Save products to JSON file."""
    with open(DATA_FILE, 'w', encoding='utf-8') as file:
        json.dump(products, file, indent=2)


# Load data on startup
load_products()


def evaluate_condition(item: Dict, condition: Any) -> bool:
    """
    Recursively evaluate filter conditions.
    Handles both simple and complex (nested) filter structures from Syncfusion Grid.
    """
    if not condition:
        return True
    
    # Handle list of conditions
    if isinstance(condition, list):
        if not condition:
            return True
        
        # If list has only one item, evaluate it
        if len(condition) == 1:
            return evaluate_condition(item, condition[0])
        
        # Multiple conditions in list - default to AND logic
        return all(evaluate_condition(item, cond) for cond in condition)
    
    # Handle dictionary condition
    if isinstance(condition, dict):
        is_complex = condition.get('isComplex', False)
        
        # Complex condition with predicates (nested conditions)
        if is_complex:
            predicates = condition.get('predicates', [])
            condition_operator = condition.get('condition', 'and').lower()
            
            if not predicates:
                return True
            
            # Evaluate all predicates
            results = [evaluate_condition(item, pred) for pred in predicates]
            
            # Apply the condition operator (and/or)
            if condition_operator == 'or':
                return any(results)
            else:  # 'and'
                return all(results)
        
        # Simple condition - evaluate field operator value
        else:
            field = condition.get('field')
            operator = condition.get('operator', 'equal')
            value = condition.get('value')
            ignore_case = condition.get('ignoreCase', True)
            
            if field not in item:
                return False
            
            item_value = item[field]
            
            # Handle case sensitivity for string comparisons
            if ignore_case and isinstance(item_value, str) and isinstance(value, str):
                item_value = item_value.lower()
                value = value.lower()
            
            # Apply operator
            if operator == 'equal':
                return item_value == value
            elif operator == 'notequal':
                return item_value != value
            elif operator == 'greaterthan':
                return item_value > value
            elif operator == 'lessthan':
                return item_value < value
            elif operator == 'greaterthanorequal':
                return item_value >= value
            elif operator == 'lessthanorequal':
                return item_value <= value
            elif operator == 'contains':
                item_str = str(item_value).lower() if ignore_case else str(item_value)
                val_str = str(value).lower() if ignore_case else str(value)
                return val_str in item_str
            elif operator == 'startswith':
                item_str = str(item_value).lower() if ignore_case else str(item_value)
                val_str = str(value).lower() if ignore_case else str(value)
                return item_str.startswith(val_str)
            elif operator == 'endswith':
                item_str = str(item_value).lower() if ignore_case else str(item_value)
                val_str = str(value).lower() if ignore_case else str(value)
                return item_str.endswith(val_str)
            else:
                # Unknown operator - default to true
                return True
    
    return True


def apply_filter(items: List[Dict], where_clause: Optional[List]) -> List[Dict]:
    """Apply filtering based on Syncfusion where clause."""
    if not where_clause:
        return items
    
    filtered_items = []
    for item in items:
        if evaluate_condition(item, where_clause):
            filtered_items.append(item)
    
    return filtered_items


def apply_search(items: List[Dict], search_fields: Optional[Any]) -> List[Dict]:
    """Apply search across specified fields."""
    if not search_fields or not items:
        return items
    
    # Extract search key from search_fields
    search_key = search_fields[0] if isinstance(search_fields, list) else search_fields
    if isinstance(search_key, dict):
        search_key = search_key.get('key', '')
    
    if not search_key:
        return items
    
    search_key_lower = str(search_key).lower()
    all_fields = list(items[0].keys()) if items else []
    filtered_items = []
    
    for item in items:
        for field in all_fields:
            if field in item and search_key_lower in str(item[field]).lower():
                filtered_items.append(item)
                break
    
    return filtered_items


def apply_sort(items: List[Dict], sorted_columns: Optional[List]) -> List[Dict]:
    """Apply sorting based on column specifications."""
    if not sorted_columns:
        return items
    
    sorted_items = items.copy()
    
    # Sort in reverse order of columns (last column first) for stable multi-column sort
    for sort_spec in reversed(sorted_columns):
        field = sort_spec.get('name')
        direction = sort_spec.get('direction', 'ascending')
        
        sorted_items = sorted(
            sorted_items,
            key=lambda x: x.get(field, ''),
            reverse=(direction.lower() == 'descending')
        )
    
    return sorted_items


def apply_pagination(items: List[Dict], skip: int, take: int) -> List[Dict]:
    """Apply pagination to items."""
    return items[skip:skip + take]


@router.get('')
def get_products(gridState: Optional[str] = None):
    """
    Get products with optional grid state for filtering, sorting, and pagination.
    """
    if not gridState:
        return {'result': products, 'count': len(products)}
    
    try:
        state = json.loads(gridState)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail='Invalid gridState JSON')
    
    # Extract grid state parameters
    skip = state.get('skip', 0)
    take = state.get('take', 12)
    where_clause = state.get('where')
    sorted_columns = state.get('sorted')
    search_fields = state.get('search')
    
    # Process data
    product_list = products.copy()
    
    # Apply search
    product_list = apply_search(product_list, search_fields)
    
    # Apply filters
    product_list = apply_filter(product_list, where_clause)
    
    # Get total count after filtering
    total_count = len(product_list)
    
    # Apply sorting
    product_list = apply_sort(product_list, sorted_columns)
    
    # Apply pagination
    paginated_products = apply_pagination(product_list, skip, take)
    
    return {'result': paginated_products, 'count': total_count}


@router.post('')
def create_product(product: Dict[str, Any]):
    """Create a new product."""
    # Generate new ID
    new_id = max([p.get('id', 0) for p in products], default=0) + 1
    product['id'] = new_id
    
    products.append(product)
    save_products()
    
    return product


@router.put('/{product_id}')
def update_product(product_id: int, product: Dict[str, Any]):
    """Update an existing product."""
    for index, existing_product in enumerate(products):
        if existing_product.get('id') == product_id:
            product['id'] = product_id
            products[index] = product
            save_products()
            return product
    
    raise HTTPException(status_code=404, detail='Product not found')


@router.delete('/{product_id}')
def delete_product(product_id: int):
    """Delete a product."""
    for index, product in enumerate(products):
        if product.get('id') == product_id:
            deleted_product = products.pop(index)
            save_products()
            return deleted_product
    
    raise HTTPException(status_code=404, detail='Product not found')
