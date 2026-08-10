import { ColumnDirective, ColumnsDirective, GridComponent, Filter, Inject, Sort, Toolbar, VirtualScroll, Edit, Search, FilterSettings, type FilterSettingsModel, type EditSettingsModel, type PageSettingsModel, type ToolbarItems } from '@syncfusion/ej2-react-grids';
import { TextBoxComponent, NumericTextBoxComponent, TextAreaComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import * as React from 'react';
import { menuFilterData as data } from './datasource';
import type { MenuFilterRecord } from './datasource';
import './App.css';

const toDateInputValue = (val?: string | Date | null): string => {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (!d) return '';
  return d.toISOString().split('T')[0];
};

const todayISO = () => new Date().toISOString().split('T')[0];
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const generateNextBookingId = (): string => {
  const maxNum = data.reduce((max, item) => {
    const num = parseInt(String(item.bookingId || '').replace(/\D/g, ''), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 1000);
  return `B${maxNum + 1}`;
};

const roomRates: Record<string, number> = {
  'Standard Room': 120,
  'Superior Room': 170,
  'Deluxe Room': 220,
  'Executive Room': 300,
  'Premium Suite': 450,
  'Family Suite': 550,
  'Penthouse Suite': 750,
};

const calculateAmount = (roomType: string, checkIn?: string | Date | null, checkOut?: string | Date | null): number | null => {
  const parseLocal = (val?: string | Date | null): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? undefined : new Date(val.getFullYear(), val.getMonth(), val.getDate());
    }
    const str = String(val).trim();
    if (!str) return undefined;
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const start: Date | undefined = parseLocal(checkIn);
  const end: Date | undefined = parseLocal(checkOut);
  if (!start || !end) return null;
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  const days = Math.max(1, diffDays);
  const rate = roomRates[roomType] || 120;
  return days * rate;
};

type FormState = {
  bookingId: string;
  guestName: string;
  roomNumber: number;
  roomType: string;
  checkInDate: string;
  checkoutDate: string;
  amount: number;
  paymentStatus: string;
  specialRequest: string;
};

const DialogEditTemplate: React.FC<Partial<MenuFilterRecord>> = (props) => {
  const checkInDefault = todayISO();
  const checkOutDefault = tomorrowISO();
  const [form, setForm] = React.useState(() => ({
    bookingId: props.bookingId || generateNextBookingId(),
    guestName: props.guestName || '',
    roomNumber: props.roomNumber || '',
    roomType: props.roomType || 'Standard Room',
    checkInDate: toDateInputValue(props.checkInDate) || checkInDefault,
    checkoutDate: toDateInputValue(props.checkoutDate) || checkOutDefault,
    amount: props.amount != null ? props.amount : 120,
    paymentStatus: props.paymentStatus || 'Pending',
    specialRequest: props.specialRequest || '',
  } as FormState));

  const onChange = (e: { target: { name: keyof FormState; value: string | number | Date | null } }) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'roomType' || name === 'checkoutDate') {
        const computed = calculateAmount(updated.roomType, updated.checkInDate, updated.checkoutDate);
        updated.amount = computed != null ? computed : prev.amount;
      }
      return updated;
    });
  };

  const roomTypes = ['Standard Room', 'Superior Room', 'Deluxe Room', 'Executive Room', 'Premium Suite',  'Family Suite', 'Penthouse Suite'];
  const paymentStatuses = ['Paid', 'Pending', 'Partially Paid'];

  const toDate = (val?: string | Date | null): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const checkInDateObj = toDate(form.checkInDate);
  const checkOutDateObj = toDate(form.checkoutDate);

  return (
    <div className="menu-dialog-template">
      <div className="dialog-two-col">

        <div className="dialog-field">
          <label>Booking ID</label>
          <TextBoxComponent name="bookingId" data-name="bookingId" value={form.bookingId} enabled={false} />
        </div>

        <div className="dialog-field">
          <label>Guest Name</label>
          <TextBoxComponent name="guestName" data-name="guestName" value={form.guestName} change={(e) => onChange({ target: { name: 'guestName', value: e.value } })} />
        </div>

        <div className="dialog-field">
          <label>Room Number</label>
          <NumericTextBoxComponent name="roomNumber" data-name="roomNumber" value={form.roomNumber} min={101} format='N0' showSpinButton={false} change={(e) => onChange({ target: { name: 'roomNumber', value: e.value } })} />
        </div>

        <div className="dialog-field">
          <label>Room Type</label>
          <DropDownListComponent name="roomType" data-name="roomType" dataSource={roomTypes} value={form.roomType} change={(e) => onChange({ target: { name: 'roomType', value: e.value } })} />
        </div>

        <div className="dialog-field">
          <label>Check In</label>
          <DatePickerComponent name="checkInDate" data-name="checkInDate" value={checkInDateObj} enabled={false} format='yyyy-MM-dd' />
        </div>

        <div className="dialog-field">
          <label>Check Out</label>
          <DatePickerComponent name="checkoutDate" data-name="checkoutDate" value={checkOutDateObj} min={checkInDateObj} format='yyyy-MM-dd' change={(e) => onChange({ target: { name: 'checkoutDate', value: e.value && e.value.toISOString ? e.value.toISOString().split('T')[0] : e.value } })} />
        </div>

        <div className="dialog-field">
          <label>Amount</label>
          <NumericTextBoxComponent name="amount" data-name="amount" value={form.amount} min={0} format='N2' showSpinButton={false} enabled={false} />
        </div>

        <div className="dialog-field">
          <label>Payment Status</label>
          <DropDownListComponent name="paymentStatus" data-name="paymentStatus" dataSource={paymentStatuses} value={form.paymentStatus} change={(e) => onChange({ target: { name: 'paymentStatus', value: e.value } })} />
        </div>

        <div className="dialog-field-full">
          <label>Special Request</label>
          <TextAreaComponent name="specialRequest" data-name="specialRequest" value={form.specialRequest} rows={4} placeholder="Enter one or more special requests..." change={(e) => onChange({ target: { name: 'specialRequest', value: e.value } })} />
        </div>

      </div>
    </div>
  );
};

function MenuFilterSample() {
  const filterSettings: FilterSettingsModel = { type: 'Menu' };
  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Dialog',
    template: (props: Partial<MenuFilterRecord>) => <DialogEditTemplate {...props} />
  };
  const toolbarOptions: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
  const pageSettings: PageSettingsModel = {
    pageSize: 10,
    pageCount: 5
  };
  const filterOptions = { operator: 'in' };

  function actionBegin(args: { requestType?: string; data?: Partial<MenuFilterRecord> }): void {
    if (args.requestType === 'add') {
      const checkIn = todayISO();
      const checkOut = tomorrowISO();
      args.data = {
        bookingId: generateNextBookingId(),
        roomType: 'Standard Room',
        checkInDate: new Date(),
        checkoutDate: new Date(Date.now() + 86400000),
        amount: calculateAmount('Standard Room', checkIn, checkOut) ?? 120,
        paymentStatus: 'Pending',
        ...args.data,
      };
    }
  }

  const paymentStatusTemplate = (props: Partial<MenuFilterRecord>) => {
    const paymentStatus = props.paymentStatus || '';
    const statusKey = paymentStatus.toLowerCase();
    let icon = '';
    let statusClass = '';

    if (statusKey.includes('pending')) {
      icon = '⏳';
      statusClass = 'badge-pending';
    } else if (statusKey.includes('paid') && !statusKey.includes('partially')) {
      icon = '✓';
      statusClass = 'badge-paid';
    } else if (statusKey.includes('partially')) {
      icon = '◑';
      statusClass = 'badge-partial';
    } else {
      statusClass = 'badge-default';
    }

    return (
      <span className={`status-badge badge-pill ${statusClass}`}>
        <span className="status-icon">{icon}</span>
        <span className="status-text">{paymentStatus}</span>
      </span>
    );
  };

  function load(args: { enableSeamlessScrolling?: boolean }): void {
    args.enableSeamlessScrolling = true;
  }

  return (
    <div id="menu-filter-sample">
      <GridComponent
        id="menu-filter-grid"
        dataSource={data}
        allowFiltering={true}
        filterSettings={filterSettings}
        allowSorting={true}
        editSettings={editSettings}
        toolbar={toolbarOptions}
        pageSettings={pageSettings}
        clipMode='EllipsisWithTooltip'
        height={465}
        rowHeight={50}
        enableVirtualization={true}
        load={load.bind(this)}
        actionBegin={actionBegin}
      >
        <ColumnsDirective>
          <ColumnDirective field="bookingId" isPrimaryKey={true} headerText="Booking ID" width="130" textAlign="Left" />
          <ColumnDirective field="guestName" headerText="Guest Name" width="180" textAlign="Left" editType="dropdownedit" validationRules={{ required: true }}/>
          <ColumnDirective field="roomNumber" headerText="Room No" width="140" textAlign="Center" filter={ filterOptions } editType="numericedit" edit={{ params: { min: 101, decimals: 0, format: 'N', showSpinButton: false } }} validationRules={{ required: [true, 'Room Number is required'] }}/>
          <ColumnDirective field="roomType" headerText="Room Type" width="170" textAlign="Left" filter={ filterOptions } editType="dropdownedit" />
          <ColumnDirective field="checkInDate" headerText="Check In" type="date" width="140" format="yMd" textAlign="Center" editType='datepickeredit'  />
          <ColumnDirective field="checkoutDate" headerText="Check Out" type="date" width="140" format="yMd" textAlign="Center" editType='datepickeredit' />
          <ColumnDirective field="amount" headerText="Amount" width="130" format="C2" textAlign="Right" editType="numericedit" edit={{ params: { min: 0, decimals: 2, format: 'N2', showSpinButton: false } }} />
          <ColumnDirective field="paymentStatus" headerText="Payment Status" width="180" template={paymentStatusTemplate} textAlign='Center' filter={ filterOptions } editType="dropdownedit" />
          <ColumnDirective field="specialRequest" headerText="Special Request" width="200" textAlign="Left" filter={ filterOptions } clipMode='EllipsisWithTooltip' />
        </ColumnsDirective>
        <Inject services={[Filter, Sort, Toolbar, VirtualScroll, Edit, Search]} />
      </GridComponent>
    </div>
  );
}

export default MenuFilterSample;
