# Connecting the Syncfusion React Grid with Flask REST backend

Flask is a lightweight, flexible Python web framework used for building RESTful APIs with simplicity and extensibility. In a REST architecture, the client communicates with the backend using standard HTTP methods and structured JSON payloads. This makes Flask a natural fit for the Syncfusion React Grid, where every grid action is serialized into a predictable request format and processed on the server.

**Key REST concepts:**

- **Resources**: Logical endpoints such as `/tasks` that represent collections or entities.
- **HTTP Methods**: `GET`, `POST`, `PUT`, and `DELETE` for standard CRUD operations.
- **Request / Response Payloads**: JSON structures carrying grid operation metadata and results.
- **Status Codes**: Standard HTTP codes indicating success or failure of operations.

---

## Prerequisites

| Software / Package | Recommended version | Purpose |
|-------------------|---------------------|--------|
| Python            | 3.11 or later       | Backend runtime |
| Flask             | Latest              | Web framework |
| Flask-CORS        | Latest              | Cross-Origin Resource Sharing support |
| Node.js           | 20.x LTS or later   | React tooling |
| npm               | 10.x or later       | Package manager |

---

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Grid_FlaskAPI
   ```

2. **Run the Flask backend**
   ```bash
   cd server
   pip install flask flask-cors
   python app.py
   ```
   The backend is now running at http://localhost:5000/.

3. **Run the React client**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open the URL shown in the terminal (typically http://localhost:5173/).

---

## Configuration

The Syncfusion React Grid communicates with the backend using direct HTTP requests. All grid operations (paging, sorting, filtering, searching, and CRUD) are sent as HTTP requests to REST endpoints.

**Grid State Parameters (Query String & Request Body):**

| Parameters       | Description |
|------------------|-------------|
| `requiresCounts` | Includes the total record count in the response when set to true |
| `skip`           | Number of records to skip |
| `take`           | Number of records to retrieve |
| `sorted`         | Sorting field(s) and direction |
| `where`          | Filtering predicates |
| `search`         | Search fields and keywords |
| `action`         | Indicates `add`, `edit`, or `delete` for CRUD operations |

**REST Endpoints:**

| Method | Endpoint       | Purpose |
|--------|---|---------|
| `GET`  | `/tasks`                | Retrieve tasks with paging, sorting, filtering, and search |
| `POST` | `/tasks`                | Create a new task |
| `PUT`  | `/tasks/<task_id>`      | Update an existing task |
| `DELETE` | `/tasks/<task_id>`    | Delete a task |

---

## Project Layout

| File / Folder | Purpose |
|---------------|---------|
| `server/app.py` | Flask application entry point with all route handlers |
| `server/task_data.json` | JSON file storing task dataset |
| `client/src/App.tsx` | React component with Grid configuration and data binding |
| `client/src/main.tsx` | React entry point |
| `client/src/App.css` | Component styles |
| `client/index.css` | Global styles including Syncfusion theme |
| `client/vite.config.ts` | Vite configuration |
| `client/package.json` | React project dependencies |

---

## Common Tasks

### Add a Record
- Click **Add** in the grid toolbar
- Enter task details in the dialog
- Click **Save** to persist the record

### Edit a Record
- Select a row → Click **Edit**
- Modify field values in the dialog
- Click **Update** to save changes

### Delete a Record
- Select a row → Click **Delete**
- Confirm the deletion

### Search / Filter / Sort
- Use the **Search** toolbar item for text search across task fields
- Use column **Excel Filter** for advanced filtering conditions
- Click column headers to sort ascending or descending

---
