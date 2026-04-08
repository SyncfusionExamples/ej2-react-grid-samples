# Syncfusion Angular Grid with SignalR

The Syncfusion Angular Grid component supports real-time data binding using SignalR, enabling automatic grid updates as data changes on the server. This capability proves essential for applications requiring live updates and multi-client synchronization.

## Key Features

- **Real-Time Communication**: Establish persistent connections for instant data updates across all connected clients.
- **Bidirectional**: Support both server-to-client (broadcasting) and client-to-server (commands) communication.
- **Automatic Transport Selection**: Intelligently choose the best transport protocol (WebSockets, SSE, Long Polling) based on browser and server capabilities.
- **Scalable Broadcasting**: Efficiently broadcast updates to multiple clients simultaneously using SignalR groups.
- **Built-in Reconnection**: Automatically handles client reconnection with exponential back off retry logic.
- **No Page Refresh Required**: Update UI dynamically without reloading the page.
Cross-Platform: Works across browsers, mobile devices, and desktop applications.

## Prerequisites


| **Software / Package**         | **Recommended version**          | **Purpose**                                 |
|-----------------------------|------------------------------|--------------------------------------   |
| Node.js                     | 20.x LTS or later            | Runtime                                 |
| npm / yarn / pnpm           | 9.x or later                 | Package manager                         | 
| Angular CLI                 | 17.x                         | Build and serve the Angular client     |
| TypeScript                  | 5.x or later                 | Server‑side and client‑side type safety |

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Running the application**

**Run the Server:**

- Run the below commands to run the server.
  
    ```bash
    cd SignalR.Server
    dotnet run
    ```
- The server runs at **http://localhost:5083/** by default.

**Run the client**
 
 - Execute the below commands to run the client application.
  
    ```bash
    cd signalr.client
    npm install
    npm run dev
    ```
- Open **https://127.0.0.1:58982/** in the browser.


## Project Layout

| **File/Folder** | **Purpose** |
|-------------|---------|
| `signalr.client/package.json` | Client package manifest and dev/start scripts (`npm start`, `npm run dev`). |
| `signalr.client/src/main.ts` | Angular standalone bootstrap (bootstraps `AppComponent` with providers). |
| `signalr.client/src/app/app.component.ts` | Client grid logic (DataManager, SignalR hub connection, `setCellValue` updates). |
| `signalr.client/src/app/app.component.html` | Grid markup and column definitions for the Syncfusion grid. |
| `signalr.client/src/app/app.component.css` | Client UI styles and cell styling classes. |
| `SignalR.Server/` | ASP.NET Core backend with SignalR hubs, APIs, and background update service. |
| `SignalR.Server/Program.cs` | Server startup: DI, SignalR, controllers, CORS, and hub mappings (`/stockHub`). |
| `SignalR.Server/Controllers/StockController.cs` | Syncfusion `UrlDatasource` endpoint and other REST endpoints (GetAll, GetById, statistics). |
| `SignalR.Server/Hubs/StockHub.cs` | SignalR hub that sends `InitializeStocks` and manages subscriptions. |
| `SignalR.Server/Models/Stock.cs` | Server `Stock` model including raw values and `*Display` formatted fields. |
| `SignalR.Server/Services/StockUpdateService.cs` | Background service that simulates price updates and broadcasts them to the `StockTraders` group. |


## Common Tasks

### Search / Filter / Sort
- Use the **Search** box (toolbar) to match across configured columns
- Use column filter icons for equals/contains/date filters
- Click column headers to sort ascending/descending

## Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://downgit.github.io/#/home

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    -  Example : https://github.com/SyncfusionExamples/ej2-angular-grid-samples/tree/master/connecting-to-backends/syncfusion-angular-grid-apollo-server

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.