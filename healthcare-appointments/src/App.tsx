import * as React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Toolbar, Edit, Page, Sort, Filter, type SelectionSettingsModel, type FilterSettingsModel, type EditSettingsModel, type ToolbarItems } from '@syncfusion/ej2-react-grids';
import { appointmentData } from './datasource';
import type { Appointment } from './datasource';
import './App.css';

function CellEdit() {
    const gridRef = React.useRef<GridComponent | null>(null);
    const toolbarOptions: ToolbarItems[] = ['Add', 'Delete', 'Update', 'Cancel', 'Search'];
    const filterSettings : FilterSettingsModel= { type: 'CheckBox' };
    const selectionSettings: SelectionSettingsModel  = { mode: 'Cell', type: 'Single' };
    const editSettings: EditSettingsModel = {
        allowEditing: true,
        allowAdding: true,
        allowDeleting: true,
        mode: 'Cell'
    };
    const doctorTemplate = (props: Appointment) => {
        const doctorList = [
            'Dr. Smitha', 'Dr. Johnson', 'Dr. Garcia', 'Dr. Brianna',
            'Dr. Williams', 'Dr. Martinez', 'Dr. Davis', 'Dr. Joanna'
        ];
        const index = doctorList.indexOf(props.Doctor) + 1;
        return (<div className="doctor-cell">
        <img src={`../images/doctor/${index}.png`} alt={props.Doctor} className="doctor-img" style={{width: "28px", height: "28px"}}/>
        <span>{props.Doctor}</span>
      </div>);
    };
    const statusTemplate = (props: Appointment) => {
        let cls = 'waiting';
        if (props.Status === 'Booked')
            cls = 'booked';
        else if (props.Status === 'Canceled')
            cls = 'canceled';
        else if (props.Status === 'Completed')
            cls = 'completed';
        return (<div>
        <span className={`badge ${cls}`}>{props.Status}</span>
      </div>);
    };
    const typeTemplate = (props: Appointment) => {
        let cls = 'consult';
        if (props.Type === 'Emergency') {
            cls = 'emergency';
        }
        else if (props.Type === 'Lab Test') {
            cls = 'lab';
        }
        else if (props.Type === 'Follow-up') {
            cls = 'follow';
        }
        else if (props.Type === 'Routine Check') {
            cls = 'routine';
        }
        return (<span className={`type ${cls}`}>
         {props.Type}
      </span>);
    };
    function actionBegin(args: { requestType?: string; action?: string; data?: Partial<Appointment> }) {
        if (args.requestType === 'save' && args.action === 'add' && args.data) {
            args.data.ApptID = 'APT-' + (Date.now() % 100000);
        }
    }
    const onActionComplete = (args: { requestType?: string; columnName?: string; rowIndex?: number; data?: Partial<Appointment> }) => {
        if (args.requestType === 'save' && args.columnName === 'Doctor' && args.data) {
            const doctorRoomMap = {
                'Dr. Smitha': 'R1',
                'Dr. Johnson': 'R2',
                'Dr. Garcia': 'R6',
                'Dr. Brianna': 'R4',
                'Dr. Williams': 'R3',
                'Dr. Martinez': 'R7',
                'Dr. Davis': 'R8',
                'Dr. Joanna': 'R5',
            };
            gridRef.current?.updateCell(args.rowIndex as number, 'Room', doctorRoomMap[args.data.Doctor as string]);
        }
    };
    const validateAppointmentTime = (args: { value: Date | string | null }) => {
        if (!args.value)
            return false;
        const hour = new Date(args.value).getHours();
        return hour >= 9 && hour <= 20;
    };
    return (
          <GridComponent id="CellEdit" ref={gridRef} dataSource={appointmentData} selectionSettings={selectionSettings} allowPaging={true} pageSettings={{pageSize: 20, pageCount:5}} allowSorting={true} allowFiltering={true} filterSettings={filterSettings} editSettings={editSettings} toolbar={toolbarOptions} height={435} rowHeight={40} actionComplete={onActionComplete} clipMode="EllipsisWithTooltip" actionBegin={actionBegin}>
            <ColumnsDirective>
              <ColumnDirective field="ApptID" headerText="Appointment ID" isPrimaryKey={true} visible={false} validationRules={{ required: true }}></ColumnDirective>
              <ColumnDirective field="Patient" headerText="Patient" width="150" validationRules={{ required: true }}></ColumnDirective>
              <ColumnDirective field="Doctor" headerText="Doctor" width="160" template={doctorTemplate} editType="dropdownedit" defaultValue="Dr. Martinez" validationRules={{ required: true }}></ColumnDirective>
              <ColumnDirective field="AppointmentTime" headerText="Appointment Time" editType="datetimepickeredit" width="200" format={{ type: 'dateTime', format: 'M/d/y hh:mm a' }} textAlign='Right' validationRules={{ required: true,
            timeRule: [
                validateAppointmentTime,
                'Appointment allowed only between 9AM – 9PM'
            ]
        }}></ColumnDirective>
              <ColumnDirective field="Type" headerText="Type" width="150" template={typeTemplate} editType="dropdownedit" validationRules={{ required: true }} defaultValue="Emergency"></ColumnDirective>
              <ColumnDirective field="Status" headerText="Status" width="130" template={statusTemplate} editType="dropdownedit" validationRules={{ required: true }} defaultValue="Pending"></ColumnDirective>
              <ColumnDirective field="Room" headerText="Room No" width="120" editType="dropdownedit" defaultValue={"R1"} validationRules={{ required: true }}></ColumnDirective>
              <ColumnDirective field="Fee" headerText="Fee" textAlign="Right" width="90" format="C2" editType="numericedit" edit={{ params: { showSpinButton: false } }} validationRules={{ required: true, min: 50, max: 500 }}></ColumnDirective>
              <ColumnDirective field="Notes" headerText="Notes" width="260" validationRules={{ required: true }}></ColumnDirective>
            </ColumnsDirective>
            <Inject services={[Toolbar, Edit, Page, Sort, Filter]}/>
        </GridComponent>
    );
}
export default CellEdit;