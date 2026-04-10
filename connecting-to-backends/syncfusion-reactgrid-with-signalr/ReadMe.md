# Syncfusion React Grid with SignalR

The Syncfusion<sup style="font-size:70%">&reg;</sup> React Grid supports real-time data binding using SignalR, a powerful library for bi-directional communication between servers and clients. This approach enables live data updates without page refreshes, making it ideal for applications that require instant information delivery such as stock tickers, live dashboards, and real-time notifications.

**What is SignalR?**

[SignalR](https://learn.microsoft.com/en-us/aspnet/signalr/) is an open-source .NET library that simplifies adding real-time web functionality to applications. It automatically handles the best transport method (WebSockets, Server-Sent Events, or Long Polling) and provides a high-level API for server-to-client and client-to-server communication. SignalR enables persistent two-way connections between clients and servers, allowing instant data synchronization without polling.

**Key benefits of SignalR**

- **Real-time communication**: Establish persistent connections for instant data updates across all connected clients.
- **Bidirectional**: Support both server-to-client (broadcasting) and client-to-server communication.
- **Automatic transport selection**: Intelligently choose the best transport protocol (WebSockets, SSE, Long Polling) based on browser and server capabilities.
- **Scalable broadcasting**: Efficiently broadcast updates to multiple clients simultaneously using SignalR groups.
- **Built-in reconnection**: Automatically handles client reconnection with exponential back off retry logic.
- **No page refresh required**: Update UI dynamically without reloading the page.
- **Cross-platform**: Works across browsers, mobile devices, and desktop applications.

## Prerequisites


| **Software / Package**         | **Recommended version**          | **Purpose**                                 |
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
- Open **http://localhost:5173/** in the browser.


## Project Layout

| **File/Folder** | **Purpose** |
|-------------|---------|
| `signalr.client/package.json` | Client package manifest and dev/start scripts |
| `signalr.client/tsconfig.json` / `tsconfig.app.json` | TypeScript configuration files for the client |
| `signalr.client/src/main.tsx` | React application entry point |
| `signalr.client/src/index.css` | Global styles for the client app |
| `signalr.client/src/components/StockGrid.tsx` | React component that renders the Syncfusion Grid and uses SignalR for live updates |
| `signalr.client/src/styles/StockGrid.css` | Styles for the `StockGrid` component (chips, colors, layout) |
| `SignalR.Server/Program.cs` | Server entry configuring services, middleware, and SignalR hubs (maps `/stockHub`) |
| `SignalR.Server/Controllers/StockController.cs` | API endpoints for initial grid datasource |
| `SignalR.Server/Hubs/StockHub.cs` | Lightweight SignalR hub; injects `StockDataService`, manages group membership (`StockTraders`) and sends initial `InitializeStocks` |
| `SignalR.Server/Models/Stock.cs` | Server-side `Stock` model with raw fields and `*Display` formatted fields |
| `SignalR.Server/Services/StockUpdateService.cs` | Background service that simulates price updates and broadcasts updates to the `StockTraders` group |
| `SignalR.Server/Services/StockDataService.cs` | Small service wrapper around `Stock.GetAllStocks()` used by `StockHub` |
| `SignalR.Server/appsettings.json` / `appsettings.Development.json` | Server configuration files |
| `SignalR.Server/SignalR.Server.csproj` | Server project file with dependencies and build settings |


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
    -  Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-backends/syncfusion-reactgrid-with-django-server

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.
