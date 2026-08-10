import * as React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, ContextMenu, Filter, Sort, type ContextMenuClickEventArgs, type ContextMenuItem, type QueryCellInfoEventArgs, Freeze, Toolbar } from '@syncfusion/ej2-react-grids';
import { sales, type SaleData } from './datasource';
import { type CategorySeries, type ChartChanges, type ChartPopupArgs, GridChart, type UpdateChartArgs } from '@syncfusion/ej2-grid-chart';
import type { AccumulationChartModel, ChartModel, IAccLoadedEventArgs, ILoadedEventArgs, MarginModel } from '@syncfusion/ej2-charts';
import { loadAccumulationChartTheme, loadChartTheme } from './grid-chart-theme-color';
import './App.css';

function GridChartIntegration() {
  let gridRef: GridComponent | null;
  let chartInstanceRef: GridChart | null;

  const contextMenuItems: ContextMenuItem[] = [
    'Bar', 'StackingBar', 'StackingBar100',
    'Pie',
    'Column', 'StackingColumn', 'StackingColumn100',
    'Line', 'StackingLine', 'StackingLine100',
    'Area', 'StackingArea', 'StackingArea100',
    'Scatter'
  ];

  const handleQueryCellInfo = (args: QueryCellInfoEventArgs) => {
    if (args.column && args.column.field === 'ProfitLoss') {
      const profit = (args.data as SaleData).ProfitLoss;
      if (profit < 0) {
        args.cell!.classList.add('e-gridchart-sales-loss');
      } else {
        args.cell!.classList.add('e-gridchart-sales-profit');
      }
    }
  };

  const updateChartSettings = (args: UpdateChartArgs): void => {
    const chartMargin: MarginModel | undefined = args.changes.chart.margin;
    const accMargin: MarginModel | undefined = args.changes.accumulationChart.margin;

    if (!chartMargin) {
      return;
    }

    if (typeof chartMargin.top === 'number') {
      const value = Math.max(20, Math.min(100, chartMargin.top));
      chartMargin.top = value;
      if (accMargin) {
        accMargin.top = value;
      }
    } else if (typeof chartMargin.bottom === 'number') {
      const value = Math.max(20, Math.min(100, chartMargin.bottom));
      chartMargin.bottom = value;
      if (accMargin) {
        accMargin.bottom = value;
      }
    } else if (typeof chartMargin.left === 'number') {
      const value = Math.max(20, Math.min(100, chartMargin.left));
      chartMargin.left = value;
      if (accMargin) {
        accMargin.left = value;
      }
    } else if (typeof chartMargin.right === 'number') {
      const value = Math.max(20, Math.min(100, chartMargin.right));
      chartMargin.right = value;
      if (accMargin) {
        accMargin.right = value;
      }
    }
  };

  const categoryTemplate = (props: SaleData): React.JSX.Element => {
    return (
      <div className="e-category-info">
        <div dangerouslySetInnerHTML={{ __html: props.CategoryIcon }} />
        <span>{props.Category}</span>
      </div>
    );
  };

  const productTemplate = (props: SaleData): React.JSX.Element => {
    const src: string = '../images/product/' + props.Image + '.png';
    return (
      <div className="e-product-info">
        <img
          src={src}
          alt={props.Product}
        />
        <span>{props.Product}</span>
      </div>
    );
  };

  const handleCreated = (): void => {
    if (!gridRef) {
      return;
    }

    chartInstanceRef = new GridChart({
      enablePropertyPanel: true,
      allowExport: true,
      enableRtl: gridRef.enableRtl,
      locale: gridRef.locale,
      updateChartSettings: updateChartSettings
    });
  }
 
  const handleContextMenuClick = (args: ContextMenuClickEventArgs) => {
    if (args.chartType && chartInstanceRef && args.gridInstance != null && args.records != null) {
      const chartArgs: ChartPopupArgs = {
        gridInstance: args.gridInstance,
        chartType: args.chartType,
        records: args.records
      };

      const chartModel: ChartModel = {
        primaryXAxis: {
          valueType: 'Category',
          labelRotation: 315
        },
        primaryYAxis: {
            title: 'Sales in amount',
            titleStyle: { size: '11px' }
        },
        load: (args: ILoadedEventArgs) => {
            loadChartTheme(args);
        }
      };

      const accumulationChartModel: AccumulationChartModel = {
          load: (args: IAccLoadedEventArgs) => {
              loadAccumulationChartTheme(args);
          }
      };

      chartModel.margin = accumulationChartModel.margin = { top: 20, bottom: 20, right: 20, left: 20 };

      const model: ChartChanges = {
        chart: chartModel,
        accumulationChart: accumulationChartModel
      };

      const categorySeries: CategorySeries = {
        category: ['Product', 'Year'],
        series: ['Online', 'Retail', 'Revenue']
      };

      chartInstanceRef.render(chartArgs, model, categorySeries);
    }
  };

  return (
        <GridComponent
          id="GridChart"
          ref={(grid) => {
            gridRef = grid;
          }}
          dataSource={sales}
          allowFiltering={true}
          allowSorting={true}
          allowMultiSorting={true}
          filterSettings={{ type: 'Menu' }}
          contextMenuItems={contextMenuItems}
          contextMenuClick={handleContextMenuClick}
          queryCellInfo={handleQueryCellInfo}
          created={handleCreated}
          height={550}
        >
          <ColumnsDirective>
            <ColumnDirective
              type="checkbox"
              width="50"
              textAlign="Center"
            />

            <ColumnDirective
              field="Product"
              headerText="Products"
              width="200"
              template={productTemplate}
              clipMode="EllipsisWithTooltip"
            />

            <ColumnDirective
              field="Category"
              headerText="Category"
              width="160"
              template={categoryTemplate}
              clipMode="EllipsisWithTooltip"
            />

            <ColumnDirective
              field="Year"
              headerText="Year"
              width="120"
              textAlign="Right"
              clipMode="EllipsisWithTooltip"
            />

            <ColumnDirective
              field="Online"
              headerText="Online"
              format="C2"
              width="150"
              textAlign="Right"
              clipMode="EllipsisWithTooltip"
            />

            <ColumnDirective
              field="Retail"
              headerText="Retail"
              format="C2"
              width="150"
              textAlign="Right"
              clipMode="EllipsisWithTooltip"
            />

            <ColumnDirective
              field="ProfitLoss"
              headerText="Profit / Loss"
              format="C2"
              width="150"
              textAlign="Right"
              clipMode="EllipsisWithTooltip"
            />

            <ColumnDirective
              field="UnitsSold"
              headerText="Units Sold"
              textAlign="Right"
              width={160}
              clipMode="EllipsisWithTooltip"
            />

            <ColumnDirective
              field="Revenue"
              headerText="Revenue"
              format="C2"
              width="150"
              textAlign="Right"
              clipMode="EllipsisWithTooltip"
            />
          </ColumnsDirective>

          <Inject
            services={[
              ContextMenu,
              Filter,
              Sort,
              Toolbar
            ]}
          />
        </GridComponent>
  );
}

export default GridChartIntegration;
