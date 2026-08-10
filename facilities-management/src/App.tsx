import * as React from 'react';
import {
    ColumnDirective,
    ColumnsDirective,
    GridComponent,
    Filter,
    Inject,
    RowDD,
    Selection,
    Sort,
    Group,
    Edit,
    Toolbar,
    Reorder,
    CommandColumn
} from '@syncfusion/ej2-react-grids';
import { facilityData } from './datasource';
import './App.css';

interface FacilityDataItem {
    ticketNo?: string;
    maintenanceItem?: string;
    assignedTo?: string;
    location?: string;
    priority?: string;
    requestDate?: Date;
    dueDate?: Date;
    status?: string;
}

function App() {
    const gridRef = React.useRef<GridComponent | null>(null);

    const filterSettings = { type: 'Menu' };
    const toolbarOptions = ['Search'];
    const editSettings = { allowEditing: true };

    const groupOptions = {
        columns: ['assignedTo', 'status']
    };

    const sortingOptions = {
        columns: [{ field: 'status', direction: 'Descending' }]
    };

    const titleRule = {
        required: true,
        minLength: 5
    };

    const validationRule = {
        required: true
    };

    const editParams = {
        params: { popupHeight: '300px' }
    };

    const commands = [
        {
            type: 'Edit',
            buttonOption: {
                iconCss: 'e-icons e-edit',
                cssClass: 'e-flat'
            }
        },
        {
            type: 'Save',
            buttonOption: {
                iconCss: 'e-icons e-update',
                cssClass: 'e-flat'
            }
        },
        {
            type: 'Cancel',
            buttonOption: {
                iconCss: 'e-icons e-cancel-icon',
                cssClass: 'e-flat'
            }
        }
    ];

    function priorityDetail(props: FacilityDataItem) {
        if (props.priority === 'High') {
            return (
                <div className="RowDragAndDrop statusvalue e-highcolor">
                    <span className="statustxt e-highcolor">High</span>
                </div>
            );
        }

        if (props.priority === 'Low') {
            return (
                <div className="RowDragAndDrop statusvalue e-lowcolor">
                    <span className="statustxt e-lowcolor">Low</span>
                </div>
            );
        }

        if (props.priority === 'Medium') {
            return (
                <div className="RowDragAndDrop statusvalue e-mediumcolor">
                    <span className="statustxt e-mediumcolor">Medium</span>
                </div>
            );
        }

        if (props.priority === 'Urgent') {
            return (
                <div className="RowDragAndDrop statusvalue e-urgentcolor">
                    <span className="statustxt e-urgentcolor">Urgent</span>
                </div>
            );
        }

        return null;
    }

    return (
        <div className="control-pane">
            <div className="control-section" id="RowDragAndDrop">
                <GridComponent
                    dataSource={facilityData}
                    ref={grid => {
                        gridRef.current = grid;
                    }}
                    allowRowDragAndDrop={true}
                    allowReordering={true}
                    rowHeight={45}
                    width="100%"
                    height="430"
                    allowGrouping={true}
                    allowSorting={true}
                    allowFiltering={true}
                    filterSettings={filterSettings}
                    groupSettings={groupOptions}
                    sortSettings={sortingOptions}
                    toolbar={toolbarOptions}
                    editSettings={editSettings}
                >
                    <ColumnsDirective>
                        <ColumnDirective
                            field="ticketNo"
                            headerText="Ticket ID"
                            width="120"
                            clipMode="EllipsisWithTooltip"
                            isPrimaryKey={true}
                            validationRules={validationRule}
                        />

                        <ColumnDirective
                            field="maintenanceItem"
                            headerText="Task Description"
                            width="280"
                            clipMode="EllipsisWithTooltip"
                            validationRules={titleRule}
                        />

                        <ColumnDirective
                            field="assignedTo"
                            headerText="Assigned To"
                            width="170"
                            clipMode="EllipsisWithTooltip"
                            editType="dropdownedit"
                            edit={editParams}
                            validationRules={validationRule}
                        />

                        <ColumnDirective
                            field="location"
                            headerText="Location"
                            width="150"
                            clipMode="EllipsisWithTooltip"
                            editType="dropdownedit"
                            edit={editParams}
                            validationRules={validationRule}
                        />

                        <ColumnDirective
                            field="priority"
                            headerText="Priority"
                            width="120"
                            clipMode="EllipsisWithTooltip"
                            textAlign="Center"
                            editType="dropdownedit"
                            edit={editParams}
                            validationRules={validationRule}
                            template={priorityDetail}
                        />

                        <ColumnDirective
                            field="requestDate"
                            headerText="Request Date"
                            width="150"
                            clipMode="EllipsisWithTooltip"
                            format="yMd"
                            textAlign="Right"
                            editType="datepickeredit"
                            allowEditing={false}
                        />

                        <ColumnDirective
                            field="dueDate"
                            headerText="Due Date"
                            width="140"
                            clipMode="EllipsisWithTooltip"
                            format="yMd"
                            textAlign="Right"
                            editType="datepickeredit"
                        />

                        <ColumnDirective
                            field="status"
                            headerText="Status"
                            width="140"
                            clipMode="EllipsisWithTooltip"
                            textAlign="Center"
                            editType="dropdownedit"
                            edit={editParams}
                            validationRules={validationRule}
                        />

                        <ColumnDirective
                            headerText="Manage Records"
                            width="140"
                            commands={commands}
                        />
                    </ColumnsDirective>

                    <Inject
                        services={[
                            RowDD,
                            Selection,
                            Sort,
                            Filter,
                            Group,
                            Edit,
                            Toolbar,
                            Reorder,
                            CommandColumn
                        ]}
                    />
                </GridComponent>
            </div>
        </div>
    );
}

export default App;