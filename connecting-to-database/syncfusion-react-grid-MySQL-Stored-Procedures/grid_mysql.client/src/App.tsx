import React from 'react';
import {
  GridComponent, ColumnsDirective, ColumnDirective, Inject, Edit, Toolbar, Page, Sort, Filter, Search,
  type FilterSettingsModel, type EditSettingsModel, type ToolbarItems,
} from '@syncfusion/ej2-react-grids';
import { DataManager } from '@syncfusion/ej2-data';
import { CustomAdaptor } from './CustomAdaptor';

const App: React.FC = () => {
  const dateDefault = new Date();
  const transactionIdRules = { required: true, maxLength: 50 };
  const customerIdRules = { required: true, number: true };
  const orderIdRules = { number: true };
  const invoiceNumberRules = { maxLength: 50 };
  const descriptionRules = { maxLength: 500 };
  const amountRules = { required: true, number: true };
  const currencyCodeRules = { maxLength: 10 };
  const transactionTypeRules = { maxLength: 50 };
  const paymentGatewayRules = { maxLength: 100 };
  const statusRules = { maxLength: 50 };

  const dataManager = new DataManager({
    url: 'http://localhost:5283/api/grid/url',
    insertUrl: 'http://localhost:5283/api/grid/insert',
    updateUrl: 'http://localhost:5283/api/grid/update',
    removeUrl: 'http://localhost:5283/api/grid/remove',
    batchUrl: 'http://localhost:5283/api/grid/batch',
    adaptor: new CustomAdaptor(),
  });

    const filterSettings: FilterSettingsModel = { type: 'Excel' }
    const editSettings: EditSettingsModel = { allowAdding: true, allowEditing: true, allowDeleting: true, mode: "Batch" };
  const toolbar: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];

  return (
    <div>
      <GridComponent id="transactionsGrid" dataSource={dataManager} allowSorting={true} allowFiltering={true} allowPaging={true} editSettings={editSettings} toolbar={toolbar} filterSettings={filterSettings}>
        <ColumnsDirective>
          <ColumnDirective field="Id" headerText="ID" width="80" isPrimaryKey={true} allowEditing={false} textAlign="Right" />
          <ColumnDirective field="TransactionId" headerText="Transaction ID" width="160" validationRules={transactionIdRules} />
          <ColumnDirective field="CustomerId" headerText="Customer ID" width="130" textAlign="Right" editType="numericedit" validationRules={customerIdRules} />
          <ColumnDirective field="OrderId" headerText="Order ID" width="120" textAlign="Right" editType="numericedit" validationRules={orderIdRules} />
          <ColumnDirective field="InvoiceNumber" headerText="Invoice #" width="150" validationRules={invoiceNumberRules} />
          <ColumnDirective field="Description" headerText="Description" width="220" validationRules={descriptionRules} />
          <ColumnDirective field="Amount" headerText="Amount" width="130" textAlign="Right" editType="numericedit" format="N2" validationRules={amountRules} />
          <ColumnDirective field="CurrencyCode" headerText="Currency" width="110" validationRules={currencyCodeRules} />
          <ColumnDirective field="TransactionType" headerText="Type" width="120" validationRules={transactionTypeRules} />
          <ColumnDirective field="PaymentGateway" headerText="Gateway" width="140" validationRules={paymentGatewayRules} />
          <ColumnDirective field="CreatedAt" headerText="Created At" type="datetime" format="dd/MM/yyyy HH:mm:ss a" width="190" editType="datetimepickeredit" defaultValue={dateDefault} />
          <ColumnDirective field="CompletedAt" headerText="Completed At" type="datetime" format="dd/MM/yyyy HH:mm:ss a" width="190" editType="datetimepickeredit" />
          <ColumnDirective field="Status" headerText="Status" width="130" validationRules={statusRules} defaultValue="SUCCESS" />
        </ColumnsDirective>
        <Inject services={[Edit, Toolbar, Page, Sort, Filter, Search]} />
      </GridComponent>
    </div>
  );
};

export default App;