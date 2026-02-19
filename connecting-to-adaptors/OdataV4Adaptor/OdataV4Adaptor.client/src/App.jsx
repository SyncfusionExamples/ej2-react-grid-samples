import { DataManager, ODataV4Adaptor } from '@syncfusion/ej2-data';
import { ColumnDirective, ColumnsDirective, GridComponent, Sort, Toolbar, Inject, Filter, Page, Edit } from '@syncfusion/ej2-react-grids';
import './App.css';

function App() {
    // Create DataManager with ODataV4Adaptor
    const data = new DataManager({ 
      url: 'https://localhost:7118/odata/orders', // Replace xxxx with your port number
      adaptor: new ODataV4Adaptor(), // This handles all OData communication
      crossDomain: true // Allow cross-domain requests
    });
    const pageSettings = { pageSize: 10, pageSizes: true };
    // Configure editing options
    const editSettings = { 
      allowEditing: true,   // Enable edit button
      allowAdding: true,    // Enable add button
      allowDeleting: true,  // Enable delete button
      mode: 'Normal',       // Inline editing mode
      showDeleteConfirmDialog: true  // Enable confirmation dialog
    };
    
    // Configure toolbar buttons
    const toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
    
    // Validation rules
    const orderIDRules = { required: true };
    const customerIDRules = { required: true, minLength: 3 };

    return (
      <div style={{ margin: '20px' }}>
        <h2>Orders Grid</h2>
        <GridComponent dataSource={data} editSettings={editSettings} allowFiltering={true} toolbar={toolbar} allowSorting={true} allowPaging={true} pageSettings={pageSettings}>
          <ColumnsDirective>
            <ColumnDirective field='OrderID' headerText='Order ID' isPrimaryKey={true} width='150' textAlign='Right' validationRules={orderIDRules} />
            <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' validationRules={customerIDRules} />
            <ColumnDirective field='EmployeeID' headerText='Employee ID' width='150' />
            <ColumnDirective field='ShipCountry' headerText='Ship Country' width='150' />
          </ColumnsDirective>
          <Inject services={[Toolbar, Sort, Filter, Page, Edit]} />
        </GridComponent>
      </div>
    );
}

export default App;
