import React, { useEffect, useState } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Toolbar, Edit, Page, Sort, Filter } from "@syncfusion/ej2-react-grids";
import { DataManager, RemoteSaveAdaptor } from "@syncfusion/ej2-data";
import "./App.css";

const serviceUrl = "https://localhost:7030/api/Orders"; // Replace with actual backend URL.

const App = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch(serviceUrl)
            .then((response) => response.json())
            .then((result) => {
                setData(new DataManager({
                    json: result,
                    adaptor: new RemoteSaveAdaptor(),
                    updateUrl: `${serviceUrl}/Update`,
                    insertUrl: `${serviceUrl}/Insert`,
                    removeUrl: `${serviceUrl}/Remove`,
                }));
            })
            .catch((error) => console.error("Error fetching data:", error));
    },
        []);
    const editSettings = {
        allowEditing: true,
        allowAdding: true,
        allowDeleting: true,
        newRowPosition: "Top",
    };
    const toolbarOptions = ["Add", "Edit", "Delete", "Update", "Cancel", "Search"];

    return (
        <div>
            {data && (
                <GridComponent id="grid" dataSource={data} editSettings={editSettings} toolbar={toolbarOptions} allowSorting={true} allowPaging={true} allowFiltering={true}>
                    <ColumnsDirective>
                        <ColumnDirective field="OrderID" headerText="Order ID" textAlign="Right" width="120" isPrimaryKey={true} />
                        <ColumnDirective field="CustomerID" headerText="Customer ID" width="150" />
                        <ColumnDirective field="ShipCity" headerText="Ship City" width="150" />
                        <ColumnDirective field="ShipName" headerText="Ship Name" width="150" />
                    </ColumnsDirective>
                    <Inject services={[Toolbar, Edit, Page, Sort, Filter]} />
                </GridComponent>
            )}
        </div>
    );
};
export default App;