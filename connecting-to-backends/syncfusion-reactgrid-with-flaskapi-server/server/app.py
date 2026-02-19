from flask import Flask, request, jsonify
from flask_cors import CORS
import json, os, unicodedata
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), "task_data.json")
PRIMARY_KEY = "TaskId"
DATE_FIELDS = {"DueDate"}
NUMBER_FIELDS = {"EstimatedHours", "TaskId"}
BOOL_FIELDS = {"IsActive"}

# Load tasks from JSON file
def load_tasks():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# Save tasks to JSON file
def save_tasks(rows):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

tasks = load_tasks()

# Parse date/time strings to naive UTC datetime
def parse_datetime_utc(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value, tz=timezone.utc).replace(tzinfo=None)
    if isinstance(value, str):
        v = value.strip()
        try:
            if v.endswith("Z"):
                dt = datetime.fromisoformat(v.replace("Z", "+00:00"))
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
            if "T" in v and ("+" in v[10:] or "-" in v[10:]):
                dt = datetime.fromisoformat(v)
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
        except Exception:
            pass
        try:
            return datetime.strptime(v[:10], "%Y-%m-%d")
        except Exception:
            return None
    return value

# Coerce values by field type (date/number/bool/other)
def coerce_value(field, value):
    if field in DATE_FIELDS:
        return parse_datetime_utc(value)
    if field in NUMBER_FIELDS:
        try:
            return float(value) if value is not None else None
        except Exception:
            return None
    if field in BOOL_FIELDS:
        return bool(value)
    return value

# Remove diacritics for accent-insensitive comparisons
def _strip_accents(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

# Compare two values with operator, case, and accent options
def compare(op, left, right, ignore_case=True, ignore_accent=False):
    if isinstance(left, str) and isinstance(right, str):
        if ignore_case:
            left, right = left.lower(), right.lower()
        if ignore_accent:
            left, right = _strip_accents(left), _strip_accents(right)

    if op == "equal": return left == right
    if op == "notequal": return left != right
    if op == "greaterthan": return left > right
    if op == "greaterthanorequal": return left >= right
    if op == "lessthan": return left < right
    if op == "lessthanorequal": return left <= right
    if op == "startswith": return str(left).startswith(str(right))
    if op == "endswith": return str(left).endswith(str(right))
    if op == "contains": return str(right) in str(left)
    if op == "in": return left in right if isinstance(right, (list, tuple, set)) else False
    return False

# Evaluate a simple predicate against a row
def eval_simple_predicate(item, predicate):
    field = predicate.get("field")
    op = (predicate.get("operator") or "equal").lower()
    value = predicate.get("value")
    ignore_case = predicate.get("ignoreCase", True)
    ignore_accent = predicate.get("ignoreAccent", False)
    left = item.get(field)
    left_t = coerce_value(field, left)
    right_t = coerce_value(field, value)
    return compare(op, left_t, right_t, ignore_case, ignore_accent)

# Evaluate a complex predicate with nested predicates and condition
def eval_complex_predicate(item, predicate):
    condition = (predicate.get("condition") or "and").lower()
    nested_predicates = predicate.get("predicates", [])
    results = []
    for p in nested_predicates:
        if p.get("isComplex"):
            results.append(eval_complex_predicate(item, p))
        else:
            results.append(eval_simple_predicate(item, p))
    return all(results) if condition == "and" else any(results)

# Apply where predicates (supports simple and complex)
def apply_filter(rows, where):
    if not where:
        return rows
    def match(item):
        if len(where) == 1 and where[0].get("isComplex"):
            return eval_complex_predicate(item, where[0])
        checks = []
        for predicate in where:
            if predicate.get("isComplex"):
                checks.append(eval_complex_predicate(item, predicate))
            else:
                checks.append(eval_simple_predicate(item, predicate))
        return all(checks)
    return [r for r in rows if match(r)]

# Apply search operations across fields with case/accent options
def apply_search(rows, search):
    if not search:
        return rows
    result = rows
    for s in search:
        key = str(s.get("key", ""))
        fields = s.get("fields", [])
        operator = (s.get("operator") or "contains").lower()
        ignore_case = s.get("ignoreCase", True)
        ignore_accent = s.get("ignoreAccent", False)

        norm_key = key.lower() if ignore_case else key
        if ignore_accent:
            norm_key = _strip_accents(norm_key)

        filtered = []
        for item in result:
            found = False
            for field in fields:
                val = item.get(field)
                if val is None:
                    continue
                sval = str(val)
                if ignore_case:
                    sval = sval.lower()
                if ignore_accent:
                    sval = _strip_accents(sval)

                if operator == "contains" and norm_key in sval: found = True; break
                if operator == "startswith" and sval.startswith(norm_key): found = True; break
                if operator == "endswith" and sval.endswith(norm_key): found = True; break
                if operator == "equal" and sval == norm_key: found = True; break
            if found:
                filtered.append(item)
        result = filtered
    return result

# Apply sorting rules (multi-column)
def apply_sort(rows, sorted_rules):
    if not sorted_rules:
        return rows
    result = rows[:]
    for rule in reversed(sorted_rules):
        name = rule.get("name")
        direction = (rule.get("direction") or "ascending").lower()
        reverse = direction == "descending"
        def key_fn(x):
            return coerce_value(name, x.get(name))
        result.sort(key=key_fn, reverse=reverse)
    return result

# Apply paging using skip and take
def apply_paging(rows, skip, take):
    skip = int(skip or 0)
    if take in (None, "", 0):
        return rows
    return rows[skip: skip + int(take)]

# GET /tasks: list with filter/search/sort/paging; returns array or {result,count}
@app.get("/tasks")
def list_tasks():
    grid_state_raw = request.args.get("gridState")
    try:
        grid_state = json.loads(grid_state_raw) if grid_state_raw else {}
    except Exception:
        grid_state = {}

    filter_predicates = grid_state.get("where") or []
    search_queries = grid_state.get("search") or []
    sort_descriptors = grid_state.get("sorted") or []
    skip = grid_state.get("skip", 0)
    take = grid_state.get("take", 0)
    requires_counts = bool(grid_state.get("requiresCounts"))

    result = tasks
    result = apply_filter(result, filter_predicates)
    result = apply_search(result, search_queries)
    total_count = len(result)
    result = apply_sort(result, sort_descriptors)
    result = apply_paging(result, skip, take)

    if requires_counts:
        return jsonify({"result": result, "count": total_count})
    return jsonify(result)

# POST /tasks: create a new task
@app.post("/tasks")
def create_task():
    row = request.get_json(silent=True) or {}
    if not row.get(PRIMARY_KEY):
        max_id = max((r.get(PRIMARY_KEY, 0) for r in tasks), default=0)
        row[PRIMARY_KEY] = int(max_id) + 1
    tasks.append(row)
    save_tasks(tasks)
    return jsonify(row), 201

# PUT /tasks/<int:item_id>: update an existing task
@app.put("/tasks/<int:item_id>")
def update_task(item_id: int):
    row = request.get_json(silent=True) or {}
    for i, current in enumerate(tasks):
        if int(current.get(PRIMARY_KEY)) == int(item_id):
            row[PRIMARY_KEY] = item_id
            tasks[i] = row
            save_tasks(tasks)
            return jsonify(row)
    return jsonify({"message": "not found"}), 404

# DELETE /tasks/<int:item_id>: delete a task
@app.delete("/tasks/<int:item_id>")
def delete_task(item_id: int):
    for i, current in enumerate(tasks):
        if int(current.get(PRIMARY_KEY)) == int(item_id):
            deleted = tasks.pop(i)
            save_tasks(tasks)
            return jsonify(deleted)
    return jsonify({"message": "not found"}), 404

# Run Flask development server
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)