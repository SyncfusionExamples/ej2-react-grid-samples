import { useEffect, useRef } from 'react';
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
  type ToolbarItems,
  type EditSettingsModel,
  type PageSettingsModel,
  type FilterSettingsModel,
  type DataStateChangeEventArgs,
  type DataSourceChangedEventArgs,
  type IFilter,
} from '@syncfusion/ej2-react-grids';
import { Query } from '@syncfusion/ej2-data';

export default function App() {
  const gridRef = useRef<GridComponent | null>(null);

  const API_BASE = 'http://localhost:5000'; // Flask server endpoint

  // --- Toolbar & settings ---
  const toolbar: ToolbarItems[] = ['Search', 'Add', 'Edit', 'Delete', 'Update', 'Cancel'];
  const editSettings: EditSettingsModel = {
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    mode: 'Dialog',
  };
  const pageSettings: PageSettingsModel = { pageSize: 12, pageSizes: [12, 25, 50, 100] };
  const filterSettings: FilterSettingsModel = { type: 'Excel' };
  const menuFilter: IFilter = { type: 'Menu' };
  const checkBoxFilter: IFilter = { type: 'CheckBox' };

  // --- dropdown data sources ---
  const statusDropDownData = [
    { text: 'Open', value: 'Open' },
    { text: 'In Progress', value: 'In Progress' },
    { text: 'Completed', value: 'Completed' },
    { text: 'Blocked', value: 'Blocked' },
  ];

  const priorityDropDownData = [
    { text: 'Low', value: 'Low' },
    { text: 'Medium', value: 'Medium' },
    { text: 'High', value: 'High' },
    { text: 'Critical', value: 'Critical' },
  ];

  // --- Edit params ---
  const statusEditParams = {
    dataSource: statusDropDownData,
    fields: { text: 'text', value: 'value' },
    placeholder: 'Select status',
    query: new Query(),
  };

  const priorityEditParams = {
    dataSource: priorityDropDownData,
    fields: { text: 'text', value: 'value' },
    placeholder: 'Select priority',
    query: new Query(),
  };

  // --- READ (GET) ---
  const fetchData = async (gridState: any) => {
    const stateWithCount = { requiresCounts: true, ...gridState };
    const url = `${API_BASE}/tasks?gridState=${encodeURIComponent(JSON.stringify(stateWithCount))}`;

    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return (await response.json()) as { result: any[]; count: number };
  };

  const dataStateChange = async (args: DataStateChangeEventArgs) => {
    const gridState = {
      skip: args.skip,
      take: args.take,
      sorted: args.sorted,
      where: args.where,
      search: args.search,
    };

    const res = await fetchData(gridState);

    // Excel filter choices / search in popup
    if (
      args.action &&
      ((args.action.requestType === 'filterchoicerequest') ||
        (args.action.requestType === 'filterSearchBegin') ||
        (args.action.requestType === 'stringfilterrequest'))
    ) {
      (args as any).dataSource(res.result);
    } else {
      // Bind main grid data: expects { result, count }
      if (gridRef.current) {
        gridRef.current.dataSource = res;
      }
    }
  };

  // --- CRUD (POST / PUT / DELETE) ---
  const dataSourceChanged = async (args: DataSourceChangedEventArgs) => {
    try {
      let response: Response | null = null;

      // Create
      if (args.action === 'add' && args.requestType === 'save') {
        response = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify((args as any).data),
        });
        if (!response.ok) throw new Error('Create failed');
        await response.json();
        (args as any).endEdit();
        return;
      }

      // Update
      if (args.action === 'edit' && args.requestType === 'save') {
        const data: any = (args as any).data;
        const id = data?.TaskId;
        response = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Update failed');
        await response.json();
        (args as any).endEdit();
        return;
      }

      // Delete
      if (args.requestType === 'delete') {
        const payload: any = (args as any).data;
        const id = Array.isArray(payload) ? payload[0]?.TaskId : payload?.TaskId;
        response = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        await response.json();
        (args as any).endEdit();
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    const initialState = { skip: 0, take: 12, sorted: [], where: [], search: [] };
    fetchData(initialState)
      .then((res) => {
        if (gridRef.current) {
          gridRef.current.dataSource = res; // { result, count }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <GridComponent
        ref={gridRef}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        toolbar={toolbar}
        editSettings={editSettings}
        pageSettings={pageSettings}
        filterSettings={filterSettings}
        dataStateChange={dataStateChange}
        dataSourceChanged={dataSourceChanged}
      >
        <ColumnsDirective>
          <ColumnDirective field="TaskId" headerText="ID" isPrimaryKey={true} visible={false} />
          <ColumnDirective field="TaskName" headerText="Task" width="200" validationRules={{ required: true }} />
          <ColumnDirective field="AssignedTo" headerText="Assigned To" width="120" validationRules={{ required: true }} />
          <ColumnDirective
            field="DueDate"
            headerText="Due Date"
            type="date"
            format="yMd"
            textAlign="Right"
            editType="datepickeredit"
            width="120"
            filter={menuFilter}
          />
          <ColumnDirective
            field="Status"
            headerText="Status"
            editType="dropdownedit"
            width="140"
            filter={checkBoxFilter}
            edit={{ params: statusEditParams }}
          />
          <ColumnDirective
            field="Priority"
            headerText="Priority"
            editType="dropdownedit"
            width="80"
            filter={checkBoxFilter}
            edit={{ params: priorityEditParams }}
          />
          <ColumnDirective
            field="EstimatedHours"
            headerText="Est. Hours"
            textAlign="Right"
            editType="numericedit"
            width="80"
            filter={menuFilter}
          />
          <ColumnDirective
            field="IsActive"
            headerText="Active"
            textAlign="Center"
            editType="booleanedit"
            type="boolean"
            displayAsCheckBox={true}
            width="100"
            filter={checkBoxFilter}
          />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Edit, Toolbar]} />
      </GridComponent>
    </div>
  );
}