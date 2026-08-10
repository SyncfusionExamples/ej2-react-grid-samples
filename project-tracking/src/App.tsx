import * as React from 'react';
import './App.css';
import {
    GridComponent,
    ColumnsDirective,
    ColumnDirective,
    Inject,
    Resize,
    Sort,
    Filter,
    Search,
    Page,
    Toolbar,
    ColumnChooser,
    Group,
    ContextMenu,
    Freeze,
    ColumnMenu,
    Edit,
    type SaveEventArgs,
    type ToolbarItems,
    type ContextMenuItem
} from '@syncfusion/ej2-react-grids';

import { data } from './datasource';

const toolbarItems: ToolbarItems[] = [
    'Add',
    'Edit',
    'Delete',
    'Update',
    'Cancel',
    'Search'
];

interface GridRowData {
    ProjectID?: string;
    ProjectName?: string;
    Department?: string;
    Status?: string;
    Priority?: string;
    StartDate?: Date | string;
    EndDate?: Date | string;
    Progress?: number;
    TeamMembers?: number;
    ResourceAllocation?: string;
    Budget?: number;
    LastUpdate?: Date | string;
    value?: string;
    TeamLead?: string;
}

const budgetTemplate = (props: GridRowData): JSX.Element => (
    <span className="budgetText">
        ${' '}
        {Number(props.Budget || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}
    </span>
);

const progressTemplate = (props: GridRowData): JSX.Element => {
    const progress = Math.min(100, Math.max(0, Number(props.Progress || 0)));
    const color =
        progress < 33
            ? '#dc2626'
            : progress < 66
            ? '#f59e0b'
            : '#059669';

    return (
        <div className="progressContainer">
            <div className="progressBar">
                <div
                    className="progressFill"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: color
                    }}
                />
            </div>
            <span className="progressText">{progress}%</span>
        </div>
    );
};


const teamMembersTemplate = (props: GridRowData): JSX.Element => (
    <div className="teamMembersContainer">
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon12px"
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="teamMembersText">{props.TeamMembers}</span>
    </div>
);

const contextMenuItems: ContextMenuItem[] = [  
    'AutoFit',
    'AutoFitAll',
    'SortAscending',
    'SortDescending',
    'Copy',
    'Edit',
    'Delete',
    'Save',
    'Cancel',
    'PdfExport',
    'ExcelExport',
    'CsvExport',
    'FirstPage',
    'PrevPage',
    'LastPage',
    'NextPage'
];

const statusParams = {
    params: {
        dataSource: [
            { Status: 'Planning' },
            { Status: 'In Progress' },
            { Status: 'On Hold' },
            { Status: 'Completed' },
            { Status: 'Open' },
            { Status: 'Cancelled' }
        ]
    }
};

const progressParams = {
    params: {
        min: 0,
        max: 100,
        decimals: 0,
        format: 'N',
        showClearButton: true,
        showSpinButton: false
    }
};

const teamMembersParams = {
    params: {
        min: 1,
        max: 20,
        decimals: 0,
        format: 'N',
        showClearButton: true,
        showSpinButton: false
    }
};

const numericParams = {
    params: {
        min: 0,
        decimals: 0,
        format: 'N',
        showClearButton: true,
        showSpinButton: false
    }
};

const ColumnMenuSample: React.FC = () => {
    const gridInstance = React.useRef<GridComponent | null>(null);

    const validateStartDate = (args: any): boolean => {
        if (!args.value) {
            return false;
        }

        const formObj =
            gridInstance.current?.editModule?.formObj?.element?.[
                'ej2_instances'
            ]?.[0];

        const endDateInput = formObj?.getInputElement?.('EndDate');
        const endDateValue = endDateInput?.value || '';

        if (!endDateValue) {
            return true;
        }

        const startDate = new Date(args.value);
        const endDate = new Date(endDateValue);

        return (
            !isNaN(startDate.getTime()) &&
            !isNaN(endDate.getTime()) &&
            startDate < endDate
        );
    };

    const validateEndDate = (): boolean => {
        const formObj =
            gridInstance.current?.editModule?.formObj?.element?.[
                'ej2_instances'
            ]?.[0];

        const startDateInput = formObj?.getInputElement?.('StartDate');
        const endDateInput = formObj?.getInputElement?.('EndDate');

        if (!startDateInput) {
            return false;
        }

        const startDateValue = startDateInput?.value || '';
        const endDateValue = endDateInput?.value || '';

        if (!startDateValue) {
            return true;
        }

        const startDate = new Date(startDateValue);
        const endDate = new Date(endDateValue);

        return (
            !isNaN(startDate.getTime()) &&
            !isNaN(endDate.getTime()) &&
            startDate < endDate
        );
    };

    const generateProjectId = (): string => {
        const nextIndex = data.length + 1;
        return `PRJ0${nextIndex}`;
    };

    const actionBegin = (args: SaveEventArgs): void => {
        if (args.requestType === 'add' && args.data) {
            (args.data as GridRowData).ProjectID = generateProjectId();
        }
    };

    return (
        <div className="column-menu-sample">
            <GridComponent
                id="columnMenuGrid"
                ref={(grid) => {
                    gridInstance.current = grid;
                }}
                dataSource={data}
                allowSorting={true}
                allowFiltering={true}
                allowResizing={true}
                allowReordering={true}
                allowPaging={true}
                showColumnMenu={true}
                showColumnChooser={true}
                toolbar={toolbarItems}
                editSettings={{
                    allowAdding: true,
                    allowDeleting: true,
                    allowEditing: true
                }}
                filterSettings={{ type: 'CheckBox' }}
                contextMenuItems={contextMenuItems}
                pageSettings={{ pageSize: 20, pageCount: 4 }}
                clipMode="EllipsisWithTooltip"
                height={430}
                actionBegin={actionBegin}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="ProjectID"
                        headerText="Project ID"
                        freeze="Left"
                        width={120}
                        minWidth={90}
                        maxWidth={220}
                        isPrimaryKey={true}
                        showInColumnChooser={false}
                        validationRules={{ required: true }}
                        textAlign="Left"
                    />

                    <ColumnDirective
                        field="ProjectName"
                        headerText="Project Name"
                        freeze="Left"
                        width={220}
                        minWidth={140}
                        maxWidth={320}
                        showInColumnChooser={false}
                        validationRules={{ required: true }}
                    />

                    <ColumnDirective
                        field="Department"
                        headerText="Department"
                        width={140}
                        minWidth={110}
                        maxWidth={220}
                        editType="dropdownedit"
                        validationRules={{ required: true }}
                    />

                    <ColumnDirective
                        field="Status"
                        headerText="Status"
                        width={140}
                        minWidth={110}
                        maxWidth={220}
                        defaultValue="Open"
                        textAlign="Center"
                        editType="dropdownedit"
                        edit={statusParams}
                    />

                    <ColumnDirective
                        field="Priority"
                        headerText="Priority"
                        width={120}
                        minWidth={100}
                        maxWidth={180}
                        defaultValue="Low"
                        textAlign="Center"
                        editType="dropdownedit"
                    />

                    <ColumnDirective
                        field="StartDate"
                        headerText="Start Date"
                        width={150}
                        minWidth={100}
                        maxWidth={220}
                        textAlign="Right"
                        defaultValue={new Date()}
                        format="yMd"
                        editType="datepickeredit"
                        validationRules={{
                            required: [
                                validateStartDate,
                                'Start date must be before the end date'
                            ]
                        }}
                    />

                    <ColumnDirective
                        field="EndDate"
                        headerText="End Date"
                        width={150}
                        minWidth={100}
                        maxWidth={220}
                        textAlign="Right"
                        format="yMd"
                        editType="datepickeredit"
                        validationRules={{
                            required: [
                                validateEndDate,
                                'End date must be after the start date'
                            ]
                        }}
                    />

                    <ColumnDirective
                        field="Progress"
                        headerText="Progress"
                        width={170}
                        minWidth={120}
                        maxWidth={260}
                        textAlign="Right"
                        template={progressTemplate}
                        defaultValue={0}
                        edit={progressParams}
                        editType="numericedit"
                        filter={{ type: 'Menu' }}
                        validationRules={{
                            required: true,
                            min: 0,
                            max: 100
                        }}
                    />

                    <ColumnDirective
                        field="TeamMembers"
                        headerText="Team Members"
                        width={170}
                        minWidth={100}
                        maxWidth={220}
                        textAlign="Right"
                        template={teamMembersTemplate}
                        defaultValue={1}
                        edit={teamMembersParams}
                        editType="numericedit"
                        filter={{ type: 'Menu' }}
                        validationRules={{
                            required: true,
                            min: 1,
                            max: 20
                        }}
                    />

                    <ColumnDirective
                        field="Budget"
                        headerText="Budget"
                        width={160}
                        minWidth={110}
                        maxWidth={240}
                        textAlign="Right"
                        template={budgetTemplate}
                        edit={numericParams}
                        editType="numericedit"
                        type="number"
                        filter={{ type: 'Menu' }}
                        validationRules={{
                            required: true,
                            min: 0
                        }}
                    />

                    <ColumnDirective
                        field="LastUpdate"
                        headerText="Last Update"
                        width={140}
                        minWidth={100}
                        maxWidth={220}
                        textAlign="Right"
                        defaultValue={new Date()}
                        format="yMd"
                        editType="datepickeredit"
                        validationRules={{ required: true }}
                    />
                </ColumnsDirective>

                <Inject
                    services={[
                        Edit,
                        Resize,
                        Sort,
                        Filter,
                        Search,
                        Page,
                        Toolbar,
                        ColumnChooser,
                        Group,
                        ContextMenu,
                        Freeze,
                        ColumnMenu
                    ]}
                />
            </GridComponent>
        </div>
    );
};

export default ColumnMenuSample;