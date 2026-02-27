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
  Group,
  type FilterSettingsModel,
  type PageSettingsModel
} from '@syncfusion/ej2-react-grids';
import { DataManager } from '@syncfusion/ej2-data';
import './app.css';
import { CustomAdaptor } from './CustomAdaptor';

const BASE_URL = 'https://localhost:7225/api/rooms';

const dataManager = new DataManager({
  url: `${BASE_URL}`,
  insertUrl: `${BASE_URL}/insert`,
  updateUrl: `${BASE_URL}/update`,
  removeUrl: `${BASE_URL}/remove`,
  batchUrl: `${BASE_URL}/batch`,
  adaptor: new CustomAdaptor()
});

const toolbar: string[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
const editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Batch' as const };
const filterSettings: FilterSettingsModel = { type: 'Excel' };

const guestNameValidation = { required: true, minLength: 3 };

const paymentStatusTemplate = (data: ReservationRow) => (
  <span>
    {data.PaymentStatus}
  </span>
);

const reservationStatusTemplate = (data: ReservationRow) => (
  <span>
    {data.ReservationStatus}
  </span>
);

const App: React.FC = () => {
  return (
    <div className="container-fluid p-4">
      <GridComponent
        id="grid"
        width="100%"
        height="500px"
        dataSource={dataManager}
        allowSorting
        allowFiltering
        allowGrouping
        allowPaging
        toolbar={toolbar}
        editSettings={editSettings}
        filterSettings={filterSettings}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="Id"
            headerText="ID"
            isPrimaryKey
            isIdentity
            visible={false}
          />
          <ColumnDirective
            field="ReservationId"
            headerText="Reservation ID"
            width={170}
            allowEditing={false}
          />
          <ColumnDirective
            field="GuestName"
            headerText="Guest Name"
            width={160}
            validationRules={guestNameValidation}
          />
          <ColumnDirective
            field="GuestEmail"
            headerText="Email"
            width={200}
          />
          <ColumnDirective
            field="CheckInDate"
            headerText="Check-In"
            width={140}
            type="date"
            format="dd-MMM-yyyy"
            editType="datepickeredit"
          />
          <ColumnDirective
            field="CheckOutDate"
            headerText="Check-Out"
            width={140}
            type="date"
            format="dd-MMM-yyyy"
            editType="datepickeredit"
          />
          <ColumnDirective
            field="RoomType"
            headerText="Room Type"
            width={130}
            editType="dropdownedit"
          />
          <ColumnDirective
            field="RoomNumber"
            headerText="Room Number"
            width={150}
          />
          <ColumnDirective
            field="AmountPerDay"
            headerText="Amount Per Day"
            width={170}
            format="N2"
            textAlign="Right"
            editType="numericedit"
          />
          <ColumnDirective
            field="NoOfDays"
            headerText="Number of Days"
            width={170}
            textAlign="Right"
          />
          <ColumnDirective
            field="TotalAmount"
            headerText="Total Amount"
            width={160}
            format="N2"
            textAlign="Right"
          />
          <ColumnDirective
            field="PaymentStatus"
            headerText="Payment"
            width={110}
            editType="dropdownedit"
            template={paymentStatusTemplate}
          />
          <ColumnDirective
            field="ReservationStatus"
            headerText="Status"
            width={120}
            editType="dropdownedit"
            template={reservationStatusTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Filter, Sort, Group, Edit, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default App;

export interface ReservationRow {
  Id: number;
  ReservationId: string;
  GuestName: string;
  GuestEmail: string;
  CheckInDate?: string | Date | null;
  CheckOutDate?: string | Date | null;
  RoomType: string;
  RoomNumber: string;
  AmountPerDay: number;
  NoOfDays: number;
  TotalAmount: number;
  PaymentStatus: string;
  ReservationStatus: string;
}