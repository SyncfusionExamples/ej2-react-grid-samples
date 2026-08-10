import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Toolbar, VirtualScroll, Filter, Sort, Edit } from '@syncfusion/ej2-react-grids';
import * as React from 'react';
import { columnData } from './datasource';
import type { ActionEventArgs } from '@syncfusion/ej2-react-grids';
import type { EditSettingsModel } from '@syncfusion/ej2-react-grids';
import './App.css';

interface SaleData {
    saleId: string;
    status: string;
}

interface ProductChangeArgs {
    itemData: {
        productName: string;
    };
}

const CheckboxSelection = () => {
  const selectionSettings = { persistSelection: true, checkboxOnly: true };
  const editSettings: EditSettingsModel = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' };
  const toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];

  let grid: GridComponent | null = null;

  const validationRules = {
    required: true
  };

  const generateSaleId = (): string => {
    const lastRecord = columnData[columnData.length - 1] as SaleData;
    const lastId = parseInt(
      lastRecord.saleId.replace('SALE-', ''),
      10
    );

    return `SALE-${String(lastId + 1).padStart(6, '0')}`;
  };

  const actionBegin = (args: ActionEventArgs) => {
      if (args.requestType === 'add' && args.data) {
          (args.data as SaleData).saleId = generateSaleId();
      }
  };

  const statusTemplate = (props: SaleData) => {
    const statusStyles: Record<string, React.CSSProperties> = {
      Completed: {
        background: '#E6F4EA',
        color: '#1E8E3E',
        border: '1px solid #1E8E3E'
      },

      Processing: {
        background: '#E8F4F8',
        color: '#0B76A6',
        border: '1px solid #0B76A6'
      },

      Cancelled: {
        background: '#FDECEC',
        color: '#E53935',
        border: '1px solid #E53935'
      }
    };

    return (
      <span
        className="status-badge"
        style={statusStyles[props.status]}
      >
        {props.status}
      </span>
    );
  };

  const quantityParams = {
    params: {
      min: 0,
      showSpinButton: false,
      format: "N0"
    }
  };

  const salesAmountParams = {
    params: {
      decimals: 2,
      showSpinButton: false,
    }
  };

  const categoryMap: Record<string, string> = {
    Smartphone: 'Electronics',
    Laptop: 'Electronics',
    Tablet: 'Electronics',
    Monitor: 'Electronics',

    Refrigerator: 'Home Appliances',
    'Microwave Oven': 'Home Appliances',
    'Washing Machine': 'Home Appliances',
    'Air Conditioner': 'Home Appliances',

    Bookshelf: 'Furniture',
    'Office Chair': 'Furniture',
    Desk: 'Furniture',
    Sofa: 'Furniture',

    Mouse: 'Accessories',
    Keyboard: 'Accessories',
    Headset: 'Accessories',
    Webcam: 'Accessories'
  };

  const productParams = {
      params: {
          change: function (args: ProductChangeArgs) {
              const categoryElement = document.getElementById(
                  'grid-checkbox-selectionproductCategory'
              ) as HTMLInputElement | null;

        if (categoryElement) {
          categoryElement.value =
            categoryMap[args.itemData.productName];
        }
      }
    }
  };

  const orderDateParams = {
    params: {
      min: new Date()
    }
  };

  return (
    <div id="checkbox-selection" className="sample-section">
      <GridComponent dataSource={columnData} id="grid-checkbox-selection" ref={(g) => (grid = g)} actionBegin={actionBegin} enableVirtualization={true} height={450} rowHeight={50} toolbar={toolbarOptions} selectionSettings={selectionSettings} editSettings={editSettings} allowFiltering={true} filterSettings={{ type: 'CheckBox' }} allowSorting={true}>
        <ColumnsDirective>
          <ColumnDirective
            type="checkbox"
            width="50"
          />

          <ColumnDirective
            field="saleId"
            headerText="Sale ID"
            width="140"
            isPrimaryKey={true}
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
            allowEditing={false}
          />

          <ColumnDirective
            field="orderDate"
            headerText="Order Date"
            width="140"
            type="date"
            format="yMd"
            textAlign="Right"
            filter={{ type: 'Menu' }}
            editType="datepickeredit"
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
            edit={orderDateParams}
          />

          <ColumnDirective
            field="status"
            headerText="Status"
            width="140"
            textAlign="Center"
            template={statusTemplate}
            editType="dropdownedit"
            validationRules={validationRules}
            defaultValue="Pending"
          />

          <ColumnDirective
            field="productName"
            headerText="Product Name"
            width="170"
            editType="dropdownedit"
            edit={productParams}
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
            defaultValue="Headphones"
          />

          <ColumnDirective
            field="productCategory"
            headerText="Product Category"
            width="170"
            allowEditing={false}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="salesChannel"
            headerText="Sales Channel"
            width="160"
            editType="dropdownedit"
            validationRules={validationRules}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="quantity"
            headerText="Quantity"
            width="120"
            textAlign="Right"
            editType="numericedit"
            filter={{ type: 'Menu' }}
            validationRules={{
              required: true,
              number: true,
              min: 1
            }}
            format="N0"
            edit={quantityParams}
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="salesAmount"
            headerText="Sales Amount"
            width="150"
            format="C2"
            editType="numericedit"
            edit={salesAmountParams}
            filter={{ type: 'Menu' }}
            textAlign="Right"
            validationRules={{ required: true, number: true, min: 1 }}
            clipMode="EllipsisWithTooltip"
          />


        </ColumnsDirective>
        <Inject services={[Filter, Sort, Toolbar, Edit, VirtualScroll]} />
      </GridComponent>
    </div>
  );
};

export default CheckboxSelection;