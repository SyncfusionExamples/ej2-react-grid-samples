import React from 'react';
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import {
    ColumnDirective, ColumnsDirective, GridComponent, AggregatesDirective, AggregateDirective, AggregateColumnsDirective, AggregateColumnDirective,
    Page, Inject, Filter, Toolbar, Search, Sort, Group, Aggregate, Edit
} from '@syncfusion/ej2-react-grids';
import './App.css';

function App() {
    const editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true };
    const toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
    const orderIDRules = { required: true };
    const customerIDRules = { required: true, minLength: 3 };

    const captionTemplate = (props) => {
        return (<span>Max: ${props.Max}</span>);
    };

    // Configure DataManager with UrlAdaptor.
    const data = new DataManager({
        url: 'https://localhost:7007/api/data',  // Replace 7007 with the backend port.
        insertUrl: 'https://localhost:7007/api/data/Insert',
        updateUrl: 'https://localhost:7007/api/data/Update',
        removeUrl: 'https://localhost:7007/api/data/Remove',
        adaptor: new UrlAdaptor()                // Specify UrlAdaptor for custom REST API.
    });

    return (
        <div className="App">
            <h2>Orders Data with UrlAdaptor</h2>
            <GridComponent dataSource={data} height={400} allowPaging={true} allowFiltering={true} toolbar={toolbar} allowSorting={true}
                allowGrouping={true} editSettings={editSettings}>
                <ColumnsDirective>
                    <ColumnDirective
                        field='OrderID'
                        headerText='Order ID'
                        isPrimaryKey={true}
                        width='120'
                        textAlign='Right'
                        validationRules={orderIDRules}
                    />
                    <ColumnDirective
                        field='CustomerID'
                        headerText='Customer ID'
                        width='150'
                        textAlign='Right'
                        validationRules={customerIDRules}
                    />
                    <ColumnDirective
                        field='ShipCity'
                        headerText='Ship City'
                        width='150'
                        textAlign='Right'
                    />
                    <ColumnDirective
                        field='Freight'
                        headerText='Freight'
                        format='C2'
                        width='150'
                        textAlign='Right'
                    />
                    <ColumnDirective
                        field='ShipCountry'
                        headerText='Ship Country'
                        width='150'
                        textAlign='Right'
                    />
                </ColumnsDirective>
                <AggregatesDirective>
                    <AggregateDirective>
                        <AggregateColumnsDirective>
                            <AggregateColumnDirective field='Freight' type='Max' groupCaptionTemplate={captionTemplate} />
                        </AggregateColumnsDirective>
                    </AggregateDirective>
                </AggregatesDirective>
                <Inject services={[Page, Filter, Toolbar, Search, Sort, Group, Aggregate, Edit]} />
            </GridComponent>
        </div>
    );
}

export default App;