# Syncfusion React Grid with Django REST Framework (Custom Binding) + Microsoft SQL Server

A clean, production‑oriented example showing how to connect **Syncfusion React Grid** to **Django REST Framework (DRF)** and **SQL Server** using **Custom Binding**. Supports server‑driven paging, sorting, filtering, searching, and full CRUD with a REST‑native contract (`GET` with query params + `POST/PUT/DELETE` for edits).

## Key Features

- **Custom Binding Pattern**: Manual control of REST requests using `dataStateChange` & `dataSourceChanged`
- **DRF Query-String Model**: Native `page`, `page_size`, `ordering`, `search`, and flexible filter operators
- **SQL Server Integration**: `mssql-django` + `pyodbc` with migrations
- **Advanced Grid Behavior**: Excel-style filtering, multi-select date filtering, paging, sorting, searching
- **Full CRUD**: POST, PUT, DELETE via DRF `ModelViewSet`
- **CORS Ready**: Seamless local React ↔ Django development

## Prerequisites

- **Node.js** LTS (20+) with npm/yarn  
- **React** 18+ (Vite)  
- **Python** 3.11+  
- **Django** 5.2+, **DRF**, **django-filter**, **corsheaders**  
- **Microsoft SQL Server** (works with LocalDB or remote instances)

---

## Quick Start

### 1) Clone the repository
```bash
git clone <your-repo-url>
cd <your-project>
```

---

## 2) Backend (Django + DRF + SQL Server)

Create a virtual environment & install packages:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install django djangorestframework django-filter django-cors-headers mssql-django pyodbc
```

**Configure SQL Server in `settings.py`:**

```python
DATABASES = {
    "default": {
        "ENGINE": "mssql",
        "NAME": "LibraryDB",
        "USER": "django_user",
        "PASSWORD": "Django@123",
        "HOST": "(localdb)\MSSQLLocalDB",
        "OPTIONS": {
            "driver": "ODBC Driver 18 for SQL Server",
            "trustServerCertificate": "yes",
        },
    }
}
```

Enable CORS:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

Run migrations & start API:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 8000
```

API available at:  
`http://localhost:8000/api/lendings/`

---

## 3) Frontend (React + Syncfusion Grid + Custom Binding)

Install packages:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Navigate to `http://localhost:5173`.

### Grid architecture:

- **Reads**: `dataStateChange → fetchLendings(state)` → DRF (`GET /lendings/?page=…&page_size=…&ordering=…`)
- **CRUD**: `dataSourceChanged → POST/PUT/DELETE` → DRF
- **Excel Filter UI**: filter-choice requests receive lightweight `result` arrays

The client uses a shared service (`apiClient.ts`) to convert Grid state into DRF query parameters including:

- `page`, `page_size`
- `ordering` (`author_name,-borrowed_date`)
- `search`
- field filters using operators (`__icontains`, `__gte`, `__lte`, `__in`, etc.)
- CSV date-set filtering using `<field>__in=YYYY-MM-DD,YYYY-MM-DD,…`

---

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| `django_server/settings.py` | SQL Server, DRF, CORS configuration |
| `django_server/urls.py` | Registers `lendings/` ViewSet |
| `library/models.py` | `BookLending` model |
| `library/serializers.py` | Serializer + UTC Zulu date formatting |
| `library/views.py` | REST ViewSet with ordering/search/filter/paging + `{ result, count }` |
| `client/src/services/apiClient.ts` | Custom Binding request builder & CRUD |
| `client/src/components/OrdersGrid.tsx` | Grid wired to DRF via Custom Binding |
| `client/src/index.css` | Syncfusion Bootstrap 5.3 theme imports |

---

## Common Tasks

### Add
1. Toolbar → **Add**
2. Fill fields → **Save**  
Grid triggers `dataSourceChanged → POST`.

### Edit
1. Select row → **Edit**
2. Modify → **Update**  
Grid triggers `PUT`.

### Delete
1. Select → **Delete**
2. Confirm  
Grid triggers `DELETE`.

### Filtering / Searching / Sorting
- Excel filter menu with operators & date multi-select  
- Search bar queries DRF `SearchFilter`  
- Header click sorting → `ordering` query param

---

## Troubleshooting

**ODBC / SQL Errors**
- Install **ODBC Driver 18 for SQL Server**
- Ensure driver architecture matches Python (64‑bit recommended)

**CORS failures**
- Ensure `corsheaders` is in `INSTALLED_APPS` + middleware
- Confirm `http://localhost:5173` in `CORS_ALLOWED_ORIGINS`

**Filter/Date issues**
- DRF uses strict ISO formats; serializers convert all dates to `YYYY-MM-DDT00:00:00Z`
- Multi-select dates appear as `<field>__in=2026-01-01,2026-01-05`

**Pagination not working**
- Ensure frontend sends `skip` & `take`
- Backend must read `page` & `page_size`

## Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://minhaskamal.github.io/DownGit

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-backends/syncfusion-reactgrid-with-django-server

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.

5. **Reference** 
    
    For more details or to explore the project, visit the official [DownGit GitHub repository](https://github.com/MinhasKamal/DownGit).

