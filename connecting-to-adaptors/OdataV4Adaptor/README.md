
# OData V4 + Syncfusion React Grid (ASP.NET Core + React)

This sample demonstrates how to run an ASP.NET Core OData V4 backend together with a React client using the Syncfusion React Grid component.

## 1. Prerequisites

### Visual Studio 2022
ASP.NET Core workload required.

### Node.js 14 or later
Check:
```
node --version
```

## 2. Install Client‑Side Node Modules

1. Open folder:
```
odatav4adaptor.client
```
2. Run:
```
npm install
```

## 3. Run the Solution from Visual Studio

1. Open:
```
ODataV4Adaptor.sln
```
2. Set `ODataV4Adaptor.Server` as startup project.
3. Press **F5** to run server + client.

The Grid will load data from:
```
https://localhost:<port>/odata/Orders
```

