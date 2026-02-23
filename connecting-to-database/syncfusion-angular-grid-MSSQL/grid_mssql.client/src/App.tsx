import React from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
  Edit,
  Toolbar,
  type FilterSettingsModel
} from '@syncfusion/ej2-react-grids';
import { DataManager } from '@syncfusion/ej2-data';
import './app.css';
import { CustomAdaptor } from './CustomAdaptor';

const BASE_URL = 'http://localhost:5239/api/tickets';

const dataManager = new DataManager({
  url: `${BASE_URL}`,
  insertUrl: `${BASE_URL}/insert`,
  updateUrl: `${BASE_URL}/update`,
  removeUrl: `${BASE_URL}/remove`,
  batchUrl: `${BASE_URL}/batch`,
  adaptor: new CustomAdaptor()
});

const toolbar: string[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
const editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true };
const filterSettings: FilterSettingsModel = { type: 'Excel' };

const validationRules = {
  ticketId: { required: true },
  title: { required: true },
  status: { required: true },
  priority: { required: true },
  category: { required: true },
  department: { required: true },
  createdBy: { required: true },
  assignee: { required: true },
  dueDate: { required: true },
  responseDue: { required: true }
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d);
};

const getStatusClass = (row: TicketRow): string => {
  const map: Record<string, string> = { Open: 'status-open', Closed: 'status-closed', Pending: 'status-pending' };
  return map[row.Status] ?? '';
};

const getStatusDescription = (row: TicketRow): string => `Status: ${row.Status}`;

const getPriorityClass = (row: TicketRow): string => {
  const map: Record<string, string> = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' };
  return map[row.Priority] ?? '';
};

const getPriorityDescription = (row: TicketRow): string => `Priority: ${row.Priority}`;

const getCategoryClass = (row: TicketRow): string => {
  const map: Record<string, string> = { Bug: 'chip-bug', Feature: 'chip-feature', Task: 'chip-task' };
  return map[row.Category] ?? '';
};

const publicTicketIdTemplate = (data: TicketRow) => (
  <a className="status-text status-ticket-id">{data.PublicTicketId}</a>
);

const statusTemplate = (data: TicketRow) => (
  <span className={`status-text ${getStatusClass(data)}`} title={getStatusDescription(data)}>
    {data.Status}
  </span>
);

const priorityTemplate = (data: TicketRow) => (
  <span className={`priority-pill ${getPriorityClass(data)}`} title={getPriorityDescription(data)}>
    <span className="priority-icon" aria-hidden="true" />
    {data.Priority}
  </span>
);

const categoryTemplate = (data: TicketRow) => (
  <span className={`chip ${getCategoryClass(data)}`}>{data.Category}</span>
);

const responseDueTemplate = (data: TicketRow) => (
  <span className="response-due">{data.ResponseDue ? formatDateTime(data.ResponseDue) : ''}</span>
);

const App: React.FC = () => {
  return (
    <div className="host">
      <GridComponent id="grid" width="100%" height={400} dataSource={dataManager}
        allowSorting allowFiltering allowPaging toolbar={toolbar}
        editSettings={editSettings} filterSettings={filterSettings}>
        <ColumnsDirective>
          <ColumnDirective field="TicketId" headerText="ID" isPrimaryKey
            width={80} textAlign='Right' showInColumnChooser={false}
            showColumnMenu={false} visible validationRules={validationRules.ticketId} />
          <ColumnDirective field="PublicTicketId" headerText="Ticket ID" width={130}
            textAlign="Right" allowEditing={false} template={publicTicketIdTemplate} />
          <ColumnDirective field="Title" headerText="Subject" width={280}
            clipMode="EllipsisWithTooltip" validationRules={validationRules.title} />
          <ColumnDirective field="Status" headerText="Status" width={180}
            editType="dropdownedit" template={statusTemplate}
            validationRules={validationRules.status} />
          <ColumnDirective field="Priority" headerText="Priority" width={160}
            editType="dropdownedit" template={priorityTemplate}
            validationRules={validationRules.priority} />
          <ColumnDirective field="Category" headerText="Category" width={180}
            editType="dropdownedit" template={categoryTemplate}
            validationRules={validationRules.category} />
          <ColumnDirective field="Department" headerText="Department" width={170}
            editType="dropdownedit" validationRules={validationRules.department} />
          <ColumnDirective field="CreatedBy" headerText="Requested By" width={180}
            editType="dropdownedit" validationRules={validationRules.createdBy} />
          <ColumnDirective field="Assignee" headerText="Agent" width={160}
            editType="dropdownedit" validationRules={validationRules.assignee} />
          <ColumnDirective field="DueDate" headerText="Resolution Due" width={200}
            type="dateTime" format="MMM d, yyyy, h:mm a"
            editType="datetimepickeredit" validationRules={validationRules.dueDate} />
          <ColumnDirective field="ResponseDue" headerText="Response Due" width={200}
            format="MMM d, yyyy, h:mm a" editType="datetimepickeredit" template={responseDueTemplate}
            validationRules={validationRules.responseDue} />
          <ColumnDirective field="UpdatedAt" headerText="Last Modified" width={200}
            type="dateTime" format="MMM d, yyyy, h:mm a" editType="datetimepickeredit" />
          <ColumnDirective field="CreatedAt" headerText="Created On" width={200}
            type="dateTime" format="MMM d, yyyy, h:mm a" editType="datetimepickeredit" />
        </ColumnsDirective>
        <Inject services={[Page, Filter, Sort, Edit, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default App;

export interface TicketRow {
  TicketId: number | string;
  PublicTicketId: string;
  Title: string;
  Status: string;
  Priority: string;
  Category: string;
  Department: string;
  CreatedBy: string;
  Assignee: string;
  DueDate?: string | Date | null;
  ResponseDue?: string | Date | null;
  UpdatedAt?: string | Date | null;
  CreatedAt?: string | Date | null;
}