# Connecting the Syncfusion React Grid with GraphQL backend in Node.js

GraphQL is a query language that allows applications to request exactly the data needed, nothing more and nothing less. Unlike traditional REST APIs that return fixed data structures, GraphQL enables the client to specify the shape and content of the response.

**Key GraphQL concepts:**

- **Queries**: A query is a request to read data. Queries do not modify data; they only retrieve it.
- **Mutations**: A mutation is a request to modify data. Mutations create, update, or delete records.
- **Resolvers**: Each query or mutation is handled by a resolver, which is a function responsible for fetching data or executing an operation. **Query resolvers** handle **read operations**, while **mutation resolvers** handle **write operations**.
- **Schema**: Defines the structure of the API. The schema describes available data types, the fields within those types, and the operations that can be executed. Query definitions specify the way data can be retrieved, and mutation definitions specify the way data can be modified.

## Prerequisites

| Software / Package          | Recommended version          | Purpose                                 |
|-----------------------------|------------------------------|--------------------------------------   |
| Node.js                     | 20.x LTS or later            | Runtime                                 |
| npm / yarn / pnpm           | 11.x or later                | Package manager                         | 
| Vite                        | 7.3.1                        | Use this to create the React application |
| TypeScript                  | 5.x or later                 | Server‑side and client‑side type safety |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```


2. **Running the application**
 **Run the GraphQL server**
- Run the below commands to run the server.
  ```bash
    cd GraphQLServer
    npm start
  ```
- The server is now running at http://localhost:4205/.

**Run the client**
 - Execute the below commands to run the client application.
  ```bash
  cd GridClient
  npm start
  ```
- Open http://localhost:4200/ in the browser.


## Configuration

The Syncfusion `GraphQLAdaptor` converts grid actions → GraphQL queries/mutations automatically and expects the backend to follow a specific structure.

Below is the complete reference, extracted from your uploaded backend guide.

**DataManager**

The Syncfusion DataManager sends a single JSON payload containing all operation metadata.

| Parameters       | Description                                                                     |
| ---------------- | ------------------------------------------------------------------------------- |
| `requiresCounts` | If it is "true" then the total count of records will be included in response. |
| `skip`           | Holds the number of records to skip.                                            |
| `take`           | Holds the number of records to take.                                            |
| `sorted`         | Contains details about current sorted column and its direction.                 |
| `where`          | Contains details about current filter column name and its constraints.          |
| `group`          | Contains details about current Grouped column names.                            |
| `search`         | Contains details about current search data.                                     |
| `aggregates`     | Contains details about aggregate data.                                          |

---

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| `GraphQLServer/src/schema.graphql` | GraphQL schema definition |
| `GraphQLServer/src/types.ts` | TypeScript type definitions for GraphQL schema |
| `GraphQLServer/src/resolvers.ts` | GraphQL resolvers implementation |
| `GridClient/src/index.css` | Global CSS styles |
| `GridClient/src/components/ProductGrid.tsx` | React component for displaying the product grid |
| `GridClient/src/components/EditDialogTemplate.tsx` | React component template for edit dialogs |
| `GridClient/src/components/ShowMoreDetailsDialog.tsx` | React component for showing detailed product information |
| `GridClient/src/data/data.ts` | Client-side data handling utilities |
| `GridClient/src/models/product-details.ts` | TypeScript model for product details |

---

## Common Tasks

### Add a Record
1. Click **Add** in the grid toolbar
2. Fill out fields (productName, productId, category, rating, etc.)
3. Click **Save** to create the record

### Edit a Record
1. Select a row → **Edit**
2. Modify fields → **Update**

### Delete a Record
1. Select a row → **Delete**
2. Confirm deletion

### Search / Filter / Sort
- Use the **Search** box (toolbar) to match across configured columns
- Use column filter icons for equals/contains/date filters
- Click column headers to sort ascending/descending

## Reference
The [user guide](https://ej2.syncfusion.com/react/documentation/grid/connecting-to-backends/graphql-nodejs-server) provides detailed directions in a clear, step-by-step format.

## Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://downgit.github.io/#/home

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-backends/syncfusion-reactgrid-with-graphql-server

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.
