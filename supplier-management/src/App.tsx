import * as React from 'react';
import {
    GridComponent,
    ColumnsDirective,
    ColumnDirective,
    Edit,
    Toolbar,
    Page,
    Inject,
    Sort,
    Filter,
    VirtualScroll,
    GridComponent as Grid
} from '@syncfusion/ej2-react-grids';

import type {
    EditSettingsModel,
    FilterSettingsModel,
    SelectionSettingsModel
} from '@syncfusion/ej2-react-grids';

import { inventoryStoreData } from './datasource';
import './App.css';

function BoxSelection() {
    let gridRef: Grid | null = null;

    const toolbarOptions: string[] = [
        'Delete',
        'Update',
        'Cancel',
        'Search'
    ];

    const filterSettings: FilterSettingsModel = {
        type: 'CheckBox'
    };

    const editSettings: EditSettingsModel = {
        allowEditing: true,
        allowAdding: false,
        allowDeleting: true,
        mode: 'Batch'
    };

    const pageSettings = {
        pageSize: 10,
        pageCount: 5
    };

    const selectionSettings: SelectionSettingsModel = {
        persistSelection: true,
        checkboxOnly: true,
        type: 'Multiple',
        cellSelectionMode: 'Box'
    };

    const numericParams = {
        params: {
            min: 0,
            showSpinButton: false
        }
    };


    return (
        <div id="cell-box-selection" className="sample-section">
            <GridComponent
                id="CheckBoxSelection"
                dataSource={inventoryStoreData}
                ref={(grid) => (gridRef = grid)}
                height={450}
                enableVirtualization={true}
                allowSorting={true}
                allowFiltering={true}
                filterSettings={filterSettings}
                toolbar={toolbarOptions}
                editSettings={editSettings}
                selectionSettings={{ persistSelection: true, cellSelectionMode: 'Box', type: 'Multiple', mode: 'Cell' }}
                enableAutoFill={true}
                clipMode="EllipsisWithTooltip"
            >
                <ColumnsDirective>

                    <ColumnDirective
                        field="ID"
                        headerText="ID"
                        width="100"
                        isPrimaryKey={true}
                        validationRules={{
                            required: true
                        }}

                    />

                    <ColumnDirective
                        field="Product"
                        headerText="Product Name"
                        width="160"
                        allowEditing={false}
                        validationRules={{
                            required: true
                        }}
                        clipMode="EllipsisWithTooltip"
                    />

                    <ColumnDirective
                        field="VendorA"
                        headerText="Vendor A (Units)"
                        width="160"
                        textAlign="Right"
                        editType="numericedit"
                        filter={{ type: 'Menu' }}
                        edit={{
                            params: {
                                showSpinButton: false
                            }
                        }}
                        validationRules={{
                            min: 1,
                            number: true,
                            required: true
                        }}
                        clipMode="EllipsisWithTooltip"
                    />

                    <ColumnDirective
                        field="VendorB"
                        headerText="Vendor B (Units)"
                        width="160"
                        textAlign="Right"
                        editType="numericedit"
                        filter={{ type: 'Menu' }}
                        edit={{
                            params: {
                                showSpinButton: false
                            }
                        }}
                        validationRules={{
                            min: 1,
                            required: true,
                            number: true
                        }}
                        clipMode="EllipsisWithTooltip"
                    />

                    <ColumnDirective
                        field="VendorC"
                        headerText="Vendor C (Units)"
                        width="160"
                        textAlign="Right"
                        editType="numericedit"
                        filter={{ type: 'Menu' }}
                        edit={{
                            params: {
                                showSpinButton: false
                            }
                        }}
                        validationRules={{
                            min: 1,
                            number: true,
                            required: true
                        }}
                        clipMode="EllipsisWithTooltip"
                    />

                    <ColumnDirective
                        field="VendorD"
                        headerText="Vendor D (Units)"
                        width="160"
                        textAlign="Right"
                        editType="numericedit"
                        filter={{ type: 'Menu' }}
                        edit={{
                            params: {
                                showSpinButton: false
                            }
                        }}
                        validationRules={{
                            min: 1,
                            number: true,
                            required: true
                        }}
                        clipMode="EllipsisWithTooltip"
                    />

                    <ColumnDirective
                        field="UnitPrice"
                        headerText="Price (Per Unit)"
                        width="150"
                        format="C2"
                        textAlign="Right"
                        editType="numericedit"
                        filter={{ type: 'Menu' }}
                        edit={{
                            params: {
                                showSpinButton: false,
                            }
                        }}
                        validationRules={{
                            required: true,
                            min: 1,
                            number: true

                        }}
                        clipMode="EllipsisWithTooltip"
                    />
                </ColumnsDirective>

                <Inject
                    services={[
                        Page,
                        Toolbar,
                        Edit,
                        Sort,
                        Filter,
                        VirtualScroll
                    ]}
                />
            </GridComponent>
        </div>
    );
}

export default BoxSelection;