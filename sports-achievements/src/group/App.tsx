import {
    ColumnDirective,
    ColumnsDirective,
    GridComponent,
    Page,
    Toolbar,
    Sort,
    Group,
    Filter,
    Inject,
    PdfExport,
    ExcelExport,
    Print
} from '@syncfusion/ej2-react-grids';
import * as React from 'react';
import { OlympicsData } from '../datasource';

function APP() {
    const olympicData = React.useMemo(() => OlympicsData.slice(0, 200), []);

    const groupOptions = {
        columns: ['country', 'olympicYear'],
        showGroupedColumn: true
    };

    const toolbarOptions = ['Search', 'PdfExport', 'ExcelExport', 'Print'];

    let grid: GridComponent | null = null;

    type ToolbarClickArgs = {
        item: {
            id: string;
        };
    };

    const toolbarClick = (args: ToolbarClickArgs) => {
        if (args.item.id.includes('pdfexport')) {
            grid?.pdfExport();
        }

        if (args.item.id.includes('excelexport')) {
            grid?.excelExport();
        }

        if (args.item.id.includes('print')) {
            grid?.print();
        }
    };

    return (
        <div>
            <GridComponent
                id="grid-grouping"
                // ref={(g) => (grid = g as GridComponent)}
                ref={(g: GridComponent | null): void => {
                    if (g) {
                        grid = g;
                    }
                }}
                dataSource={olympicData}
                allowGrouping={true}
                groupSettings={groupOptions}
                allowFiltering={true}
                allowSorting={true}
                filterSettings={{ type: 'CheckBox' }}
                toolbar={toolbarOptions}
                allowExcelExport={true}
                allowPdfExport={true}
                toolbarClick={toolbarClick}
                height={440}
                rowHeight={48}
            >
                <ColumnsDirective>
                    <ColumnDirective field="country" headerText="Country" width="140" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="olympicYear" headerText="Year" width="115" textAlign="Right" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="sport" headerText="Sport" width="135" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="athleteName" headerText="Athlete Name" width="170" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="event" headerText="Event" width="210" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="medalType" headerText="Medal" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="hostCity" headerText="Host City" width="120" clipMode="EllipsisWithTooltip" />
                </ColumnsDirective>

                <Inject services={[Group, Toolbar, Filter, Sort, Page, ExcelExport, PdfExport, Print]} />
            </GridComponent>
        </div>
    );
}

export default APP;
