import React, { useMemo } from 'react';
import {
    GridComponent, ColumnsDirective, ColumnDirective, Inject, Page, Sort, Filter, Group, Toolbar, Edit,
    type ToolbarItems, type FilterSettingsModel, type PageSettingsModel, type EditSettingsModel
} from '@syncfusion/ej2-react-grids';
import { DataManager } from '@syncfusion/ej2-data';
import { CustomAdaptor } from './CustomAdaptor';

export interface PurchaseOrder {
    PurchaseOrderId: number;
    PoNumber: string;
    VendorID: string | number;
    ItemName: string;
    ItemCategory: string;
    Quantity: number;
    UnitPrice: number;
    TotalAmount?: number;
    Status: string;
    OrderedBy: string;
    ApprovedBy: string;
    OrderDate: string | Date;
    ExpectedDeliveryDate: string | Date;
    CreatedOn: string | Date;
    UpdatedOn: string | Date;
}

const App: React.FC = () => {
    const toolbarOptions: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
    const pageSettings: PageSettingsModel = { pageSize: 10 };
    const filterSettings: FilterSettingsModel = { type: 'Excel' };
    const editSettings: EditSettingsModel = { allowEditing: true, allowAdding: true, allowDeleting: true };
    const requiredRule = { required: true };

    const dataManager = useMemo(() => new DataManager({
        url: 'https://localhost:7016/api/PurchaseOrder/getpurchasedata',
        insertUrl: 'https://localhost:7016/api/PurchaseOrder/insert',
        updateUrl: 'https://localhost:7016/api/PurchaseOrder/update',
        removeUrl: 'https://localhost:7016/api/PurchaseOrder/remove',
        // batchUrl: 'https://localhost:7016/api/PurchaseOrder/batch',
        adaptor: new CustomAdaptor(),
    }), []);

    const statusTemplate = (props: PurchaseOrder) => <span style={{ color: props.Status === 'Approved' ? 'green' : 'red' }}>{props.Status}</span>;
    const priceTemplate = (props: PurchaseOrder) => <span>₹{props.UnitPrice.toFixed(2)}</span>;
    const approvedByTemplate = (props: PurchaseOrder) => <span style={{ fontStyle: 'italic' }}>{props.ApprovedBy || 'Pending'}</span>;

    return (
        <GridComponent dataSource={dataManager} allowPaging={true} allowSorting={true} allowFiltering={true} allowGrouping={true} toolbar={toolbarOptions} pageSettings={pageSettings} filterSettings={filterSettings} editSettings={editSettings}>
            <ColumnsDirective>
                <ColumnDirective field="PurchaseOrderId" headerText="ID" width="80" isPrimaryKey={true} textAlign="Right" type="number" />
                <ColumnDirective field="PoNumber" headerText="PO Number" width="150" validationRules={requiredRule} />
                <ColumnDirective field="VendorID" headerText="Vendor ID" width="150" validationRules={requiredRule} />
                <ColumnDirective field="ItemName" headerText="Item Name" width="150" editType="dropdownedit" validationRules={requiredRule} />
                <ColumnDirective field="ItemCategory" headerText="Category" width="120" editType="dropdownedit" validationRules={requiredRule} />
                <ColumnDirective field="Quantity" headerText="Quantity" width="110" textAlign="Right" type="number" editType="numericedit" validationRules={requiredRule} />
                <ColumnDirective field="UnitPrice" headerText="Unit Price" width="130" textAlign="Right" type="number" format="C2" template={priceTemplate} editType="numericedit" validationRules={requiredRule} />
                <ColumnDirective field="TotalAmount" headerText="Total Amount" width="150" textAlign="Right" type="number" format="C2" allowEditing={false} editType="numericedit" />
                <ColumnDirective field="Status" headerText="Status" width="110" template={statusTemplate} editType="dropdownedit" validationRules={requiredRule} />
                <ColumnDirective field="OrderedBy" headerText="Ordered By" width="150" validationRules={requiredRule} />
                <ColumnDirective field="ApprovedBy" headerText="Approved By" width="150" template={approvedByTemplate} validationRules={requiredRule} textAlign="Right" />
                <ColumnDirective field="OrderDate" headerText="Order Date" width="150" type="date" format="yMd" editType="datepickeredit" validationRules={requiredRule} textAlign="Right" />
                <ColumnDirective field="ExpectedDeliveryDate" headerText="Expected Delivery" width="170" type="date" format="yMd" editType="datepickeredit" validationRules={requiredRule} />
                <ColumnDirective field="CreatedOn" headerText="Created At" width="150" type="datetime" format="yMd HH:mm" textAlign="Right" allowEditing={false} />
                <ColumnDirective field="UpdatedOn" headerText="Updated At" width="150" type="datetime" format="yMd HH:mm" textAlign="Right" allowEditing={false} />
            </ColumnsDirective>
            <Inject services={[Page, Sort, Filter, Group, Toolbar, Edit]} />
        </GridComponent>
    );
};

export default App;
