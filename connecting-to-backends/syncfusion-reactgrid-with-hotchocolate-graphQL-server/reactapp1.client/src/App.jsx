import { DataManager, GraphQLAdaptor } from '@syncfusion/ej2-data';
import { ColumnDirective, ColumnsDirective, GridComponent, Sort, Toolbar, Inject, Filter, Page, Edit } from '@syncfusion/ej2-react-grids';
import './App.css';

function App() {
    // Create DataManager with Syncfusion's built-in GraphQLAdaptor
    const data = new DataManager({ 
      url: '/graphql',
      adaptor: new GraphQLAdaptor({
        response: {
          result: 'orders.result',  // Path to the result data
          count: 'orders.count'     // Path to the count
        },
        query: `query GetOrders($datamanager: DataManagerInput) {
          orders(datamanager: $datamanager) {
            result {
              orderID
              customerID
              employeeID
              shipCountry
            }
            count
          }
        }`,
        getMutation: function (action) {
          if (action === 'insert') {
            return `mutation CreateOrder($value: OrdersDetailsInput!) {
              addOrder(input: $value) {
                orderID
                customerID
                employeeID
                shipCountry
              }
            }`;
          }
          if (action === 'update') {
            return `mutation UpdateOrder($key: Int!, $keyColumn: String, $value: OrdersDetailsInput!) {
              updateOrder(key: $key, keyColumn: $keyColumn, input: $value) {
                orderID
                customerID
                employeeID
                shipCountry
              }
            }`;
          }
          if (action === 'remove') {
            return `mutation DeleteOrder($key: Int!) {
              deleteOrder(orderID: $key)
            }`;
          }
          return '';
        }
      }),
      crossDomain: true
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
        <h2>Orders Grid (GraphQL + HotChocolate)</h2>
        <GridComponent 
          dataSource={data} 
          editSettings={editSettings} 
          allowFiltering={true} 
          toolbar={toolbar} 
          allowSorting={true} 
          allowPaging={true} 
          pageSettings={pageSettings}
        >
          <ColumnsDirective>
            <ColumnDirective field='orderID' headerText='Order ID' isPrimaryKey={true} width='150' textAlign='Right' validationRules={orderIDRules} />
            <ColumnDirective field='customerID' headerText='Customer ID' width='150' validationRules={customerIDRules} />
            <ColumnDirective field='employeeID' headerText='Employee ID' width='150' />
            <ColumnDirective field='shipCountry' headerText='Ship Country' width='150' />
          </ColumnsDirective>
          <Inject services={[Toolbar, Sort, Filter, Page, Edit]} />
        </GridComponent>
      </div>
    );
}

export default App;
