import { useRef, useMemo, useEffect } from 'react';
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
  type FilterSettingsModel,
  type EditSettingsModel,
  type PageSettingsModel,
  type ToolbarItems,
  type IFilter,
  type DataStateChangeEventArgs,
  type DataSourceChangedEventArgs,
} from '@syncfusion/ej2-react-grids';
import { Query } from '@syncfusion/ej2-data';
import { GridApiService } from './gridApiService';
import './App.css';

// Point this to your FastAPI endpoint
const API_BASE: string = 'http://localhost:8000';

// Edit behavior
const editSettings: EditSettingsModel = {
  allowAdding: true,
  allowEditing: true,
  allowDeleting: true,
  showDeleteConfirmDialog: true,
  newRowPosition: 'Top',
};

// Toolbar
const toolbar: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];

// Paging + filtering
const pageSettings: PageSettingsModel = { pageSize: 12, pageSizes: [12, 25, 50, 100] };
const filterSettings: FilterSettingsModel = { type: 'Excel' };

// Per-column filter UI types
const menuFilter: IFilter = { type: 'Menu' };
const checkboxFilter: IFilter = { type: 'CheckBox' };

// Validation rules
const skuRules = { required: true, minLength: 3, maxLength: 32 };
const productNameRules = { required: true, minLength: 2, maxLength: 80 };
const categoryRules = { required: true, minLength: 1, maxLength: 50 };
const priceRules = { required: true, number: true, min: 0 };
const stockRules = { required: true, number: true, min: 0, max: 999999 };
const statusRules = { required: true };

// Edit params
const categoryParams = {
  params: {
    dataSource: ["Beauty","Books","Electronics","Grocery","Office","Clothing","Toys","Home & Kitchen","Sports"],
    query: new Query(),
  },
};
const statusParams = {
  params: {
    dataSource: ["Active","Backorder","Discontinued"],
    query: new Query(),
  },
};

const StatusTemplate = (props: { status: string }) => {
  const status = String(props?.status ?? '').toLowerCase();
  const cls =
    status === 'active'
      ? 'pg-chip pg-chip--active'
      : status === 'inactive'
      ? 'pg-chip pg-chip--inactive'
      : status === 'discontinued'
      ? 'pg-chip pg-chip--discontinued'
      : 'pg-chip';

  return <span className={cls}>{props?.status ?? ''}</span>;
};

export default function App() {
  const gridRef = useRef<GridComponent>(null);

  // Initialize API service (memoized to avoid recreation on every render)
  const apiService = useMemo(() => new GridApiService(`${API_BASE}/products`, 'id'), []);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const initialState = {
          skip: 0,
          take: 12,
        };
        const data = await apiService.fetchData(initialState);
        if (gridRef.current) {
          gridRef.current.dataSource = data;
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [apiService]);

  // Handle data state changes (read operations)
  const dataStateChange = async (args: DataStateChangeEventArgs) => {
    try {
      const gridState = {
        skip: args.skip,
        take: args.take,
        sorted: args.sorted,
        where: args.where,
        search: args.search,
      };

      const responseData = await apiService.fetchData(gridState);

      // Handle Excel filter choice requests
      if (
        args.action &&
        (args.action.requestType === 'filterchoicerequest' ||
          args.action.requestType === 'filterSearchBegin' ||
          args.action.requestType === 'stringfilterrequest')
      ) {
        (args as any).dataSource(responseData.result);
      } else {
        // Bind main grid data
        if (gridRef.current) {
          gridRef.current.dataSource = responseData;
        }
      }
    } catch (error) {
      console.error('Data state change failed:', error);
    }
  };

  // Handle data source changes (CRUD operations)
  const dataSourceChanged = async (args: DataSourceChangedEventArgs) => {
    try {
      const data = (args as any).data;

      // Create operation
      if (args.action === 'add' && args.requestType === 'save') {
        await apiService.createRecord(data);
        (args as any).endEdit();
        return;
      }

      // Update operation
      if (args.action === 'edit' && args.requestType === 'save') {
        const recordId = apiService.extractRecordId(data);
        await apiService.updateRecord(recordId, data);
        (args as any).endEdit();
        return;
      }

      // Delete operation
      if (args.requestType === 'delete') {
        const recordId = apiService.extractRecordId(data);
        await apiService.deleteRecord(recordId);
        (args as any).endEdit();
        return;
      }
    } catch (error) {
      console.error('Data source change failed:', error);
    }
  };

  return (
    <div className="products-grid-wrap">
      <div className="pg-title">
        <h2>Products</h2>
      </div>

      <GridComponent
        ref={gridRef}
        id="ProductsGrid"
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        filterSettings={filterSettings}
        editSettings={editSettings}
        toolbar={toolbar}
        pageSettings={pageSettings}
        enableHover={true}
        rowHeight={40}
        dataStateChange={dataStateChange}
        dataSourceChanged={dataSourceChanged}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="id"
            headerText="ID"
            isPrimaryKey={true}
            textAlign="Right"
            width={90}
            visible={false}
          />

          <ColumnDirective field="sku" headerText="SKU" width={160} validationRules={skuRules} />

          <ColumnDirective
            field="productName"
            headerText="Product"
            width={240}
            validationRules={productNameRules}
          />

          <ColumnDirective
            field="category"
            headerText="Category"
            width={170}
            editType="dropdownedit"
            filter={checkboxFilter}
            validationRules={categoryRules}
            edit={categoryParams}
          />

          <ColumnDirective
            field="price"
            headerText="Price"
            textAlign="Right"
            width={140}
            editType="numericedit"
            format="C2"
            validationRules={priceRules}
            filter={menuFilter}
          />

          <ColumnDirective
            field="stock"
            headerText="Stock"
            textAlign="Right"
            width={120}
            editType="numericedit"
            validationRules={stockRules}
            filter={menuFilter}
          />

          <ColumnDirective
            field="status"
            headerText="Status"
            textAlign="Center"
            width={150}
            editType="dropdownedit"
            filter={checkboxFilter}
            validationRules={statusRules}
            template={StatusTemplate}
            edit={statusParams}
          />
        </ColumnsDirective>

        <Inject services={[Page, Sort, Filter, Edit, Toolbar]} />
      </GridComponent>
    </div>
  );
}
