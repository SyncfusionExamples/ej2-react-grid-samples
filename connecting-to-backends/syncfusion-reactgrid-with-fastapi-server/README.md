# Connecting the Syncfusion React Grid with FastAPI REST backend

FastAPI is a modern, high‑performance Python web framework used for building RESTful APIs with automatic validation and OpenAPI documentation. In a REST architecture, the client communicates with the backend using standard HTTP methods and structured JSON payloads. This makes FastAPI a natural fit for the Syncfusion React Grid, where every grid action is serialized into a predictable request format and processed on the server.

**Key REST concepts:**

- **Resources**: Logical endpoints such as `/products` that represent collections or entities.
- **HTTP Methods**: `POST` for data operations, along with standard REST semantics.
- **Request / Response Payloads**: JSON structures carrying grid operation metadata and results.
- **Status Codes**: Standard HTTP codes indicating success or failure of operations.

---

## Prerequisites

| Software / Package | Recommended version | Purpose |
|-------------------|---------------------|--------|
| Python            | 3.11 or later       | Backend runtime |
| FastAPI           | Latest              | REST API framework |
| Uvicorn           | Latest              | ASGI server |
| Node.js           | 20.x LTS or later   | React tooling |
| npm               | 10.x or later       | Package manager |

---

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Run the FastAPI backend**
   ```bash
   cd server
   uvicorn main:app --reload --port 8000
   ```
   The backend is now running at http://localhost:8000/.

3. **Run the React client**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open the URL shown in the terminal (typically http://localhost:5173/).

---

## Configuration

The Syncfusion React Grid communicates with the backend using the **DataManager** combined with the **UrlAdaptor**. All grid operations (paging, sorting, filtering, searching, and CRUD) are sent as a single POST request to a REST endpoint.

**DataManager request payload (common keys):**

| Parameters       | Description |
|------------------|-------------|
| `requiresCounts` | Includes the total record count in the response when set to true |
| `skip`           | Number of records to skip |
| `take`           | Number of records to retrieve |
| `sorted`         | Sorting field(s) and direction |
| `where`          | Filtering predicates |
| `search`         | Search fields and keywords |
| `select`         | Fields to project |
| `action`         | Indicates `insert`, `update`, or `remove` for CRUD |

---

## Project Layout

| File / Folder | Purpose |
|---------------|---------|
| `server/main.py` | FastAPI application entry point |
| `server/products_data.json` | Sample product dataset |
| `server/routers/products.py` | Single REST endpoint handling grid operations |
| `server/routers/services` | Server‑side helpers for paging, sorting, filtering, search, and CRUD |
| `client/src/App.tsx` | React Grid configuration |
| `client/src/index.css` | Global styles including Syncfusion theme |

---

## Common Tasks

### Add a Record
- Click **Add** in the grid toolbar
- Enter product details
- Click **Save** to persist the record

### Edit a Record
- Select a row → **Edit**
- Modify field values → **Update**

### Delete a Record
- Select a row → **Delete**
- Confirm deletion

### Search / Filter / Sort
- Use the **Search** toolbar item for text search
- Use column filters for advanced conditions
- Click column headers to sort ascending or descending


## Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://minhaskamal.github.io/DownGit

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/Ej2-EditReadmeFiles/connecting-to-backends/syncfusion-reactgrid-with-fastapi-server

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.
5. **Reference** 
    
    For more details or to explore the project, visit the official [DownGit GitHub repository](https://github.com/MinhasKamal/DownGit).



---
