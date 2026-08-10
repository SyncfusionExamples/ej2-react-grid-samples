import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Toolbar, Filter, Sort, Page } from '@syncfusion/ej2-react-grids';
import * as React from 'react';
import { salesData } from './datasource';
import type {
  SelectionSettingsModel,
  PageSettingsModel
} from '@syncfusion/ej2-react-grids';
import './App.css';

interface SalesData {
  performanceLevel: string;
}

const ColumnSelection = () => {
  const selectionSettings: SelectionSettingsModel = {
    allowColumnSelection: true,
    type: 'Multiple'
  };
  const pageSettings: PageSettingsModel = {
    pageSize: 20,
    pageCount: 5
  }

  const validationRules = { required: true };

  const toolbarOptions: string[] = ['Search'];

  const performanceLevelTemplate = (props: SalesData) => {
    const performanceStyles: Record<string, React.CSSProperties> = {
      Outstanding: {
        background: '#F0FDF4',
        color: '#15803D',
        border: '1px solid #15803D'
      },

      'Excellent': {
        background: '#ECFEFF',
        color: '#0E7490',
        border: '1px solid #0E7490'
      },

      Competent: {
        background: '#FFF7ED',
        color: '#EA580C',
        border: '1px solid #EA580C'
      },

      'Needs Improvement': {
        background: '#FEF2F2',
        color: '#DC2626',
        border: '1px solid #DC2626'
      }
    };

    return (
      <span
        className="status-badge"
        style={performanceStyles[props.performanceLevel]}
      >
        {props.performanceLevel}
      </span>
    );
  };

  return (
    <div id="column-selection" className="sample-section">
      <GridComponent dataSource={salesData} allowPaging={true} pageSettings={pageSettings} selectionSettings={selectionSettings} toolbar={toolbarOptions} height={401} rowHeight={50} allowFiltering={true} filterSettings={{ type: 'CheckBox' }} allowSorting={true}>
        <ColumnsDirective>

          <ColumnDirective
            field="employeeId"
            headerText="Employee ID"
            width="140"
            isPrimaryKey={true}
          />

          <ColumnDirective
            field="salesRepresentative"
            headerText="Sales Representative"
            width="190"
            isPrimaryKey={true}
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="emailId"
            headerText="Email ID"
            width="240"
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="performanceLevel"
            headerText="Performance Level"
            textAlign="Center"
            template={performanceLevelTemplate}
            width="220"
            filter={{ type: 'CheckBox' }}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="achievementPercentage"
            headerText="Achievement"
            width="150"
            textAlign="Right"
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="salesAmount"
            headerText="Sales Amount"
            width="145"
            format="C2"
            filter={{ type: 'Menu' }}
            textAlign="Right"
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="targetAmount"
            headerText="Target Amount"
            width="150"
            format="C2"
            filter={{ type: 'Menu' }}
            textAlign="Right"
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="region"
            headerText="Region"
            width="160"
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="manager"
            headerText="Manager"
            width="160"
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="productName"
            headerText="Product"
            width="180"
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="salesChannel"
            headerText="Sales Channel"
            width="145"
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
          />

        </ColumnsDirective>
        <Inject services={[Page, Filter, Sort, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default ColumnSelection;