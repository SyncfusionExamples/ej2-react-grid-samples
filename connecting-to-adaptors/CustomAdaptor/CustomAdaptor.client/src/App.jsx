import { DataManager, ODataV4Adaptor } from '@syncfusion/ej2-data';
import { CustomAdaptor } from './CustomAdaptor';
import { ColumnDirective, ColumnsDirective, GridComponent, Filter, Sort, Page, Edit, Toolbar, Inject } from '@syncfusion/ej2-react-grids';

function App() {
    const data = new DataManager({
        url: 'https://localhost:7284/odata/Orders', // Here xxxx represents the port number
        adaptor: new CustomAdaptor()
    });

    const editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' };
    const toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
    const orderIDRules = { required: true };
    const customerIDRules = { required: true, minLength: 3 }

    return <GridComponent dataSource={data} allowFiltering={true} allowSorting={true} allowPaging={true} toolbar={toolbar} editSettings={editSettings}>
        <ColumnsDirective>
            <ColumnDirective field='SNo' headerText='SNO' width='150' allowSearching={false} allowFiltering={false} allowSorting={false} isIdentity={true} />
            <ColumnDirective field='OrderID' headerText='Order ID' isPrimaryKey={true} width='150' textAlign='Right' validationRules={orderIDRules}></ColumnDirective>
            <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' validationRules={customerIDRules}></ColumnDirective>
            <ColumnDirective field='EmployeeID' headerText='Employee ID' width='150' />
            <ColumnDirective field='ShipCountry' headerText='Ship Country' width='150' />
               {/* Include additional columns here */}
        </ColumnsDirective>
        <Inject services={[Filter, Sort, Page, Edit, Toolbar]} />
    </GridComponent>
};
export default App;