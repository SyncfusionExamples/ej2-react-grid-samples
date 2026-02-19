import React from "react";
import { DataManager, WebMethodAdaptor } from "@syncfusion/ej2-data";
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Filter,
  Sort,
  Page,
  Toolbar,
  Edit,
} from "@syncfusion/ej2-react-grids";

function App() {
  // Configure DataManager with WebMethodAdaptor
  const data = new DataManager({
    url: "http://localhost:5095/api/grid", // Replace with your backend port
    adaptor: new WebMethodAdaptor(), // Use WebMethodAdaptor for value object pattern
    insertUrl: "http://localhost:5095/api/grid/Insert",
    updateUrl: "http://localhost:5095/api/grid/Update",
    removeUrl: "http://localhost:5095/api/grid/Remove",
    crudUrl: "http://localhost:5095/api/grid/CrudUpdate",
    batchUrl: "http://localhost:5095/api/grid/BatchUpdate",
  });

  const editSettings = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: "Batch",
  };
  const toolbarItems = ["Add", "Edit", "Delete", "Update", "Cancel", "Search"];

  return (
    <div className="App">
      <h2>Orders Data with WebMethodAdaptor</h2>
      <GridComponent
        dataSource={data}
        height={400}
        allowFiltering={true}
        allowSorting={true}
        allowPaging={true}
        toolbar={toolbarItems}
        editSettings={editSettings}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="OrderID"
            headerText="Order ID"
            isPrimaryKey={true}
            width="120"
            textAlign="Right"
          />
          <ColumnDirective
            field="CustomerID"
            headerText="Customer ID"
            width="150"
          />
          <ColumnDirective
            field="ShipCity"
            headerText="Ship City"
            width="150"
          />
          <ColumnDirective
            field="ShipCountry"
            headerText="Ship Country"
            width="150"
          />
        </ColumnsDirective>
        <Inject services={[Filter, Sort, Page, Toolbar, Edit]} />
      </GridComponent>
    </div>
  );
}

export default App;
