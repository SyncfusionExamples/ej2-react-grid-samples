import React, { useEffect, useRef } from 'react';
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
    Search,
    type DataSourceChangedEventArgs,
    type DataStateChangeEventArgs,
    type EditSettingsModel,
    type ToolbarItems,
} from '@syncfusion/ej2-react-grids';
import {
    createLending,
    deleteLending,
    fetchLendings,
    updateLending,
    type LendingRecord,
} from '../services/apiClient';
import { Query } from '@syncfusion/ej2-data';

const OrdersGrid: React.FC = () => {
    const gridRef = useRef<GridComponent | null>(null);

    const pageSettings = { pageSize: 10, pageSizes: [10, 20, 50, 100] };
    const toolbar: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
    const editSettings: EditSettingsModel = {
        allowAdding: true,
        allowEditing: true,
        allowDeleting: true,
    };

    const validationRules = {
        required: true,
    };

    useEffect(() => {
        const initialState = {
            skip: 0,
            take: 10,
        } as DataStateChangeEventArgs;

        void handleDataStateChange(initialState);
    }, []);

    /**
     * Loads data when Grid state changes (paging/sorting/filtering/searching).
     */
    const handleDataStateChange = async (args: DataStateChangeEventArgs) => {
        const gridState = {
            skip: args.skip,
            take: args.take,
            sorted: args.sorted,
            where: args.where,
            search: args.search,
        } as DataStateChangeEventArgs;

        const res = await fetchLendings(gridState);

        if (
            args.action && args.dataSource &&
            (args.action.requestType === 'filterchoicerequest' ||
                args.action.requestType === 'filterSearchBegin' ||
                args.action.requestType === 'stringfilterrequest')
        ) {
            args.dataSource(res.result);
        } else if (gridRef.current) {
            gridRef.current.dataSource = res;
        }
    };

    /**
     * Handles CRUD actions (add/edit/delete) using custom data binding.
     */
    const handleDataSourceChanged = async (args: DataSourceChangedEventArgs) => {
        if (args.action === 'add' && args.requestType === 'save') {
            await createLending(args.data as LendingRecord);
        }

        if (args.action === 'edit' && args.requestType === 'save') {
            await updateLending(args.data as LendingRecord);
        }

        if (args.requestType === 'delete') {
            await deleteLending((args.data as LendingRecord[])[0].record_id);
        }

        args.endEdit?.();
    };

    const lendingStatusParams = { params: { dataSource: ['Borrowed', 'Overdue', 'Returned'], query: new Query() } };

    return (
        <div className="grid-shell">

            <GridComponent
                ref={gridRef}
                allowPaging={true}
                allowSorting={true}
                allowFiltering={true}
                pageSettings={pageSettings}
                toolbar={toolbar}
                editSettings={editSettings}
                dataStateChange={handleDataStateChange}
                dataSourceChanged={handleDataSourceChanged}
                gridLines="Both"
                filterSettings={{ type: "Excel" }}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="record_id"
                        headerText="Record ID"
                        width="120"
                        isPrimaryKey={true}
                        textAlign="Right"
                    />
                    <ColumnDirective field="isbn_number" headerText="ISBN" width="160" validationRules={validationRules} />
                    <ColumnDirective field="book_title" headerText="Book Title" width="220" validationRules={validationRules} />
                    <ColumnDirective field="author_name" headerText="Author" width="180" validationRules={validationRules} />
                    <ColumnDirective field="genre" headerText="Genre" width="140" validationRules={validationRules} />
                    <ColumnDirective field="borrower_name" headerText="Borrower" width="180" validationRules={validationRules} />
                    <ColumnDirective field="borrower_email" headerText="Email" width="220" validationRules={validationRules} />
                    <ColumnDirective
                        field="borrowed_date"
                        headerText="Borrowed Date"
                        width="160"
                        type="date"
                        format="yMd"
                        editType="datepickeredit"
                        validationRules={validationRules}
                    />
                    <ColumnDirective
                        field="expected_return_date"
                        headerText="Expected Return"
                        width="170"
                        type="date"
                        format="yMd"
                        editType="datepickeredit"
                        validationRules={validationRules}
                    />
                    <ColumnDirective
                        field="actual_return_date"
                        headerText="Actual Return"
                        width="160"
                        type="date"
                        format="yMd"
                        editType="datepickeredit"
                    />
                    <ColumnDirective field="lending_status" headerText="Status" width="140" validationRules={validationRules} editType="dropdownedit" edit={lendingStatusParams} />
                </ColumnsDirective>

                <Inject services={[Page, Sort, Filter, Edit, Toolbar, Search]} />
            </GridComponent>
        </div>
    );
};

export default OrdersGrid;
