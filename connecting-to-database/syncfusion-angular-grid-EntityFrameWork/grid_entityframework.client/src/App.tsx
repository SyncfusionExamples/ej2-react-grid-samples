// File: src/components/TicketsGrid.tsx
import React, { useMemo } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Toolbar,
  Edit,
  Sort,
  Filter,
  Page,
  type EditSettingsModel,
} from '@syncfusion/ej2-react-grids';
import { DataManager } from '@syncfusion/ej2-data';
import { CustomAdaptor } from './CustomAdaptor';

const App: React.FC = () => {
  const dataManager = useMemo(() => new DataManager({
    url: 'http://localhost:5018/api/tickets/url',
    insertUrl: 'http://localhost:5018/api/tickets/insert',
    updateUrl: 'http://localhost:5018/api/tickets/update',
    removeUrl: 'http://localhost:5018/api/tickets/remove',
    batchUrl: 'http://localhost:5018/api/tickets/batch',
    adaptor: new CustomAdaptor(),
  }), []);

  const toolbar: string[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];

  const editSettings: EditSettingsModel = {
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    // mode: 'Batch',
  };

  return (
    <GridComponent
      dataSource={dataManager}
      allowSorting={true}
      allowFiltering={true}
      allowPaging={true}
      editSettings={editSettings}
      toolbar={toolbar}
      height={400}
    >
      <ColumnsDirective>
        <ColumnDirective field="SNo" headerText="S.No" width={70} textAlign="Right" />
        <ColumnDirective field="TicketId" headerText="ID" width={50} isPrimaryKey={true} isIdentity={true} />
        <ColumnDirective field="PublicTicketId" headerText="Ticket ID" width={120} textAlign="Right" validationRules={{ required: true }} />
        <ColumnDirective field="Title" headerText="Title" width={150} />
        <ColumnDirective field="Department" headerText="Department" width={110} />
        <ColumnDirective field="Assignee" headerText="Assignee" width={150} />
        <ColumnDirective field="Status" headerText="Status" width={120} defaultValue={'Open'} validationRules={{ required: true }} />
        <ColumnDirective field="Priority" headerText="Priority" width={120} defaultValue={'Medium'} validationRules={{ required: true }} />
        <ColumnDirective field="CreatedAt" headerText="Created At" editType="datetimepickeredit" type="datetime" width={180} format="dd/MM/yyyy hh:mm:ss a" validationRules={{ required: true }} />
        <ColumnDirective field="UpdatedAt" headerText="Updated At" editType="datetimepickeredit" type="datetime" width={180} format="dd/MM/yyyy hh:mm:ss a" validationRules={{ required: true }} />
      </ColumnsDirective>
      <Inject services={[Toolbar, Edit, Sort, Filter, Page]} />
    </GridComponent>
  );
};

export default App;