import * as React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, VirtualScroll, ContextMenu, Sort, Selection, Inject, Filter, Freeze, Toolbar, Edit } from '@syncfusion/ej2-react-grids';
import { supportData } from './datasource';
import './App.css';

interface SupportDataItem {
    Rating?: string;
    Priority?: string;
    Status?: string;
    TypeofRequest?: string;
}

function App() {
    const gridInstance = React.useRef<GridComponent | null>(null);
    const filterSettings = { type: 'Excel' };
    const contextMenuItems = ['PinRow', 'UnpinRow'];
    const toolbarOptions = ['Edit', 'Delete', 'Update', 'Cancel'];
    const editSettings = { allowEditing: true, allowDeleting: true };
    const editparams = { params: { popupHeight: '300px' } };
    const titleRule = { required: true, minLength: 5 };
    const validationRule = { required: true };

    function isRowPinned(data: SupportDataItem | null) {
        return !!data && (data.Rating === 'Very Dissatisfied' || data.Rating === 'Dissatisfied');
    }

    const requestTemplate = (props: SupportDataItem) => {
        const imageUrl = new URL(`./supportType/${props.TypeofRequest}.svg`, import.meta.url).href;
        return (
            <div className="e-request-info">
                {/* <img src={`../../../images/supportType/${props.TypeofRequest}.svg`} alt={props.TypeofRequest} /> */}
                <img src={imageUrl} alt={props.TypeofRequest} />
                <span>{props.TypeofRequest}</span>
            </div>
        );
    };
    function ratingDetail(props: SupportDataItem) {
        if (props.Rating === 'Satisfied') {
            return (
                <div className="statusvalue e-satisfiedcolor">
                    <span className="statustxt e-satisfiedcolor">Satisfied</span>
                </div>
            );
        }
        if (props.Rating === 'Very Satisfied') {
            return (
                <div className="statusvalue e-verysatisfiedcolor">
                    <span className="statustxt e-verysatisfiedcolor">Very Satisfied</span>
                </div>
            );
        }
        if (props.Rating === 'Dissatisfied') {
            return (
                <div className="statusvalue e-dissatisfiedcolor">
                    <span className="statustxt e-dissatisfiedcolor">Dissatisfied</span>
                </div>
            );
        }
        if (props.Rating === 'Very Dissatisfied') {
            return (
                <div className="statusvalue e-verydissatisfiedcolor">
                    <span className="statustxt e-verydissatisfiedcolor">Very Dissatisfied</span>
                </div>
            );
        }
        if (props.Rating === 'Neutral') {
            return (
                <div className="statusvalue e-neutralcolor">
                    <span className="statustxt e-neutralcolor">Neutral</span>
                </div>
            );
        }
        return null;
    }

    function priorityDetail(props: SupportDataItem) {
        if (props.Priority === 'High') {
            return (
                <div className="statusvalue e-highcolor">
                    <span className="statustxt e-highcolor">High</span>
                </div>
            );
        }
        if (props.Priority === 'Low') {
            return (
                <div className="statusvalue e-lowcolor">
                    <span className="statustxt e-lowcolor">Low</span>
                </div>
            );
        }
        if (props.Priority === 'Medium') {
            return (
                <div className="statusvalue e-mediumcolor">
                    <span className="statustxt e-mediumcolor">Medium</span>
                </div>
            );
        }
        if (props.Priority === 'Urgent') {
            return (
                <div className="statusvalue e-urgentcolor">
                    <span className="statustxt e-urgentcolor">Urgent</span>
                </div>
            );
        }
        return null;
    }

    function statusDetail(props: SupportDataItem) {
        if (props.Status === 'Open') {
            return (
                <div className="statusvalue e-opencolor">
                    <span className="statustxt e-opencolor">Open</span>
                </div>
            );
        }
        if (props.Status === 'In Progress') {
            return (
                <div className="statusvalue e-inprogresscolor">
                    <span className="statustxt e-inprogresscolor">In Progress</span>
                </div>
            );
        }
        if (props.Status === 'Closed') {
            return (
                <div className="statusvalue e-closedcolor">
                    <span className="statustxt e-closedcolor">Closed</span>
                </div>
            );
        }
        if (props.Status === 'Resolved') {
            return (
                <div className="statusvalue e-resolvedcolor">
                    <span className="statustxt e-resolvedcolor">Resolved</span>
                </div>
            );
        }
        return null;
    }

    function load(args: { enableSeamlessScrolling: boolean }) {
        args.enableSeamlessScrolling = true;
    }

    return (<div className='control-pane'>
            <div className='control-section'>
                <GridComponent id="RowPinning" rowHeight={50}
                    dataSource={supportData}
                    ref={grid => {
                        gridInstance.current = grid;
                    }}
                    enableVirtualization={true}
                    contextMenuItems={contextMenuItems}
                    height={260}
                    isRowPinned={isRowPinned}
                    allowSorting={true}
                    allowKeyboard={false}
                    allowFiltering={true}
                    filterSettings={filterSettings}
                    toolbar={toolbarOptions}
                    editSettings={editSettings}
                    load={load}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="TicketID" headerText="Ticket ID" width="140" isPrimaryKey={true} validationRules={validationRule} freeze="Left"/>
                        <ColumnDirective field="Title" headerText="Title" width="210" validationRules={titleRule}/>
                        <ColumnDirective field="Assignee" headerText="Assignee" width="140"/>
                        <ColumnDirective field="Status" headerText="Status" width="140" textAlign="Center" editType="dropdownedit" edit={editparams} validationRules={validationRule} template={statusDetail}/>
                        <ColumnDirective field="Priority" headerText="Priority" width="140" textAlign="Center" editType="dropdownedit" edit={editparams} validationRules={validationRule} template={priorityDetail}/>
                        <ColumnDirective field="Category" headerText="Category" width="130"/>
                        <ColumnDirective field="TypeofRequest" headerText="Type of Request" width="210" editType="dropdownedit" edit={editparams} validationRules={validationRule} template={requestTemplate}/>
                        <ColumnDirective field="CreatedDate" headerText="Created Date" width="160" editType='datetimepickeredit' format="yMd" textAlign="Right"/>
                        <ColumnDirective field="Rating" headerText="Rating" width="160" textAlign="Center" freeze="Right" editType="dropdownedit" edit={editparams} validationRules={validationRule} template={ratingDetail}/>
                    </ColumnsDirective>
                    <Inject services={[VirtualScroll, Sort, Selection, Filter, Freeze, ContextMenu, Toolbar, Edit]}/>
                </GridComponent>
            </div>
        </div>);
}
export default App;