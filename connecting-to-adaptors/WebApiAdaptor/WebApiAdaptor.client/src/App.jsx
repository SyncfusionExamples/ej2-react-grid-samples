import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Filter, Toolbar, Sort, Edit, Page } from '@syncfusion/ej2-react-grids';

function App() {
    // Create DataManager with WebApiAdaptor
    const data = new DataManager({
        url: 'https://localhost:7222/api/Orders', // Replace xxxx with your port number
        adaptor: new WebApiAdaptor(), // This handles Web API communication
        crossDomain: true // Allow cross-domain requests
    });
    const editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' };
    const toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
    const orderIDRules = { required: true };
    const customerIDRules = { required: true, minLength: 3 };
    return (
        <div style={{ margin: '20px' }}>
            <h2>Orders Grid</h2>
            <GridComponent dataSource={data} allowFiltering={true} height={320} toolbar={toolbar} allowSorting={true} allowPaging={true} editSettings={editSettings}>
                <ColumnsDirective>
                    <ColumnDirective
                        field='OrderID'
                        headerText='Order ID'
                        isPrimaryKey={true}
                        width='150'
                        textAlign='Right'>
                    </ColumnDirective>
                    <ColumnDirective
                        field='CustomerID'
                        headerText='Customer ID'
                        width='150'>
                    </ColumnDirective>
                    <ColumnDirective
                        field='ShipCity'
                        headerText='Ship City'
                        width='150'>
                    </ColumnDirective>
                    <ColumnDirective
                        field='ShipCountry'
                        headerText='Ship Country'
                        width='150'>
                    </ColumnDirective>
                </ColumnsDirective>
                <Inject services={[Filter, Toolbar, Sort, Edit, Page]} />
            </GridComponent>
        </div>
    );
}

export default App;
