import * as React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Sort, Filter, Resize, Reorder, Search, Edit, Toolbar, ColumnChooser, Group, Page, Freeze } from '@syncfusion/ej2-react-grids';
import { leadManagementData } from './datasource';
import './App.css';

function App() {
    const employeeHeaderTemplate = (props) => (
        <div className="lead-grid-header">
            <span className={'e-icons e-people' || 'e-icons e-list'}></span>
            <span>{props.headerText}</span>
        </div>
    );

    const employeeTemplate = (props) => {
        const imagePath = props.employeeImage ? new URL(`./assets/customer/${props.employeeImage}`, import.meta.url).href : new URL('./assets/customer/Andrew Callahan.png', import.meta.url).href;
        return (
            <div className="lead-customer-cell">
                <img className="lead-customer-image" src={imagePath} alt={props.employeeName} />
                <div>
                    <div className="lead-customer-name">{props.employeeName}</div>
                    <div className="lead-customer-email">{props.employeeEmail}</div>
                </div>
            </div>
        );
    };

    const statusTemplate = (props) => {
        const status = props.Status || props.status || 'Active';
        const statusConfig = {
            'Active': 'statusActive',
            'On Leave': 'statusOnLeave',
            'Inactive': 'statusInactive'
        };
        const icon = status === 'Active' ? '✓' : status === 'On Leave' ? '⏸' : '○';
        return (
            <div className={`statusBadgeBg ${statusConfig[status] || 'statusInactive'}`}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span>{status}</span>
            </div>
        );
    };

    const hireDateTemplate = (props) => {
        const hireDate = props.HireDate ? new Date(props.HireDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
        return (
            <div className="iconWrapper" style={{ justifyContent: 'flex-end' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon12px">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="textEllipsis">{hireDate}</span>
            </div>
        );
    };

    const renderActionContent = (props, disabled = false) => {
        return (
            <div
                className="action-buttons"
                style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap', overflowX: 'auto', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
            >
                <a
                    href="https://in.linkedin.com/company/syncfusion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button linkedin-button"
                    style={{ textDecoration: 'none', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 8px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f172a', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>in</span>
                    <span>LinkedIn</span>
                </a>
                <div
                    className="action-button mail-button"
                    style={{ textDecoration: 'none', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 8px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f172a', flexShrink: 0, whiteSpace: 'nowrap', cursor: 'default', opacity: 0.8 }}
                    aria-disabled="true"
                    role="presentation"
                >
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>✉</span>
                    <span>Email</span>
                </div>
            </div>
        );
    };

    const actionTemplate = (props) => renderActionContent(props, false);
    const actionEditTemplate = (props) => renderActionContent(props, true);

    const workLocationTemplate = (props) => {
        const location = props.workLocation || props.WorkLocation || 'Office';
        const safeLocation = ['Work From Home', 'Office', 'Remote'].includes(location) ? location : 'Office';
        const locationSlug = safeLocation.toLowerCase().replace(/\s+/g, '-');
        return <span className={`lead-location-badge lead-location-${locationSlug}`}>{safeLocation}</span>;
    };

    return (
        <div className="control-pane">
            <div className="control-section">
                <GridComponent
                    id="LeadManagementGrid"
                    dataSource={leadManagementData}
                    allowSorting={true}
                    allowResizing={true}
                    allowReordering={true}
                    allowFiltering={true}
                    allowPaging={true}
                    showColumnChooser={true}
                    filterSettings={{ type: 'CheckBox' }}
                    editSettings={{ allowAdding: false, allowDeleting: true, allowEditing: true }}
                    toolbar={['Edit', 'Delete', 'Update', 'Cancel', 'ColumnChooser']}
                    height={408}
                    rowHeight={60}
                    pageSettings={{ pageSize: 10, pageCount: 5 }}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="employeeName" headerText="Name" allowEditing={false} width="250" minWidth={180} maxWidth={320} template={employeeTemplate} headerTemplate={employeeHeaderTemplate} freeze='Left' />
                        <ColumnDirective field="EmployeeID" headerText="ID" width="120" minWidth={90} maxWidth={180} textAlign="Left" validationRules={{ required: true }} isPrimaryKey={true} />
                        <ColumnDirective field="Department" headerText="Department" width="165" minWidth={110} maxWidth={220} editType='dropdownedit' validationRules={{ required: true }} />
                        <ColumnDirective field="Position" headerText="Role" width="240" minWidth={150} maxWidth={240} editType='dropdownedit' validationRules={{ required: true }} clipMode='EllipsisWithTooltip'/>
                        <ColumnDirective field="EmploymentType" headerText="Employment Type" width="170" minWidth={120} maxWidth={240} editType='dropdownedit' validationRules={{ required: true }} clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="HireDate" headerText="Join Date" width="155" minWidth={100} maxWidth={220} textAlign="Right" format="dd/MM/yyyy" editType='datepickeredit' allowEditing={false} template={hireDateTemplate} />
                        <ColumnDirective field="ReportsTo" headerText="Reports To" width="160" minWidth={110} maxWidth={220} textAlign="Left" editType='dropdownedit' validationRules={{ required: true }} />
                        <ColumnDirective field="workLocation" headerText="Work Location" width="180" minWidth={120} maxWidth={240} template={workLocationTemplate} editType='dropdownedit' validationRules={{ required: true }} />
                        <ColumnDirective field="Actions" headerText="Contact" width="190" minWidth={140} maxWidth={260} textAlign="Center" allowEditing={false} template={actionTemplate} allowFiltering={false} freeze='Right' editTemplate={actionEditTemplate} allowReordering={false} allowSorting={false} />
                    </ColumnsDirective>
                    <Inject services={[Sort, Filter, Resize, Reorder, Search, Edit, Toolbar, ColumnChooser, Group, Page, Freeze]} />
                </GridComponent>
            </div>
        </div>
    );
}

export default App;