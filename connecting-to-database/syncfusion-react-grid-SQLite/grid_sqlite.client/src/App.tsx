import React, { useMemo } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Edit,
  Toolbar,
  Page,
  Sort,
  Filter,
} from "@syncfusion/ej2-react-grids";
import { DataManager, UrlAdaptor } from "@syncfusion/ej2-data";
import "./App.css";
import "./CustomAdaptor";
import { CustomAdaptor } from "./CustomAdaptor";

// Define the Asset interface
interface Asset {
  Id: number;
  AssetID: string;
  AssetName: string;
  AssetType: string;
  Model: string;
  SerialNumber: string;
  InvoiceID: string;
  AssignedTo: string;
  Department: string;
  PurchaseDate: Date;
  PurchaseCost: number;
  WarrantyExpiry: Date;
  Condition: string;
  LastMaintenance: Date;
  Status: string;
}

const App: React.FC = () => {
  const toolbarOptions = useMemo(
    () => ["Add", "Edit", "Delete", "Update", "Cancel", "Search"],
    [],
  );
  const editSettings: any = {
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    mode: "Normal",
  };

  const filterSettings: any = { type: "Excel" };

  const dataManager = useMemo(
    () =>
      new DataManager({
        url: `https://localhost:7116/api/asset/url`,
        insertUrl: `https://localhost:7116/api/asset/insert`,
        updateUrl: `https://localhost:7116/api/asset/update`,
        removeUrl: `https://localhost:7116/api/asset/remove`,
        batchUrl: `https://localhost:7116/api/asset/batch`,
        adaptor: new CustomAdaptor(),
      }),
    [],
  );

  // Condition template with badges
  const conditionTemplate = (props: Asset) => {
    const condition = props.Condition as string;
    const badgeClasses: Record<string, string> = {
      New: "badge bg-success",
      Good: "badge bg-primary",
      Fair: "badge bg-warning",
      Poor: "badge bg-danger",
    };
    const badgeClass = badgeClasses[condition] || "badge bg-secondary";

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <span className={badgeClass}>{condition}</span>
      </div>
    );
  };

  // Status template with badges
  const statusTemplate = (props: Asset) => {
    const status = props.Status as string;
    const badgeClasses: Record<string, string> = {
      Active: "badge bg-success",
      "In Repair": "badge bg-warning",
      Retired: "badge bg-secondary",
      Available: "badge bg-info",
    };
    const badgeClass = badgeClasses[status] || "badge bg-secondary";

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <span className={badgeClass}>{status}</span>
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <GridComponent
        dataSource={dataManager}
        allowSorting={true}
        allowFiltering={true}
        allowPaging={true}
        toolbar={toolbarOptions}
        editSettings={editSettings}
        filterSettings={filterSettings}
      >
        <ColumnsDirective>
          <ColumnDirective field="Id" isPrimaryKey={true} visible={false} />

          <ColumnDirective field="AssetID" headerText="Asset ID" width="120" />

          <ColumnDirective
            field="AssetName"
            headerText="Asset Name"
            width="180"
            textAlign="Left"
            validationRules={{ required: true }}
          />

          <ColumnDirective
            field="AssetType"
            headerText="Type"
            width="130"
            textAlign="Left"
            validationRules={{ required: true }}
          />

          <ColumnDirective
            field="Model"
            headerText="Model"
            width="150"
            textAlign="Left"
            validationRules={{ required: true }}
          />

          <ColumnDirective
            field="SerialNumber"
            headerText="Serial Number"
            width="160"
          />

          <ColumnDirective
            field="InvoiceID"
            headerText="Invoice ID"
            width="130"
            textAlign="Left"
          />

          <ColumnDirective
            field="AssignedTo"
            headerText="Assigned To"
            width="150"
            textAlign="Left"
          />

          <ColumnDirective
            field="Department"
            headerText="Department"
            width="130"
            textAlign="Left"
            editType="dropdownedit"
          />

          <ColumnDirective
            field="PurchaseDate"
            headerText="Purchase Date"
            width="140"
            textAlign="Center"
            type="date"
            format="yyyy-MM-dd"
            editType="datepickeredit"
            validationRules={{ required: true }}
          />

          <ColumnDirective
            field="PurchaseCost"
            headerText="Cost"
            width="120"
            textAlign="Right"
            format="C0"
            editType="numericedit"
          />

          <ColumnDirective
            field="WarrantyExpiry"
            headerText="Warranty Expiry"
            width="150"
            textAlign="Center"
            type="date"
            format="yyyy-MM-dd"
            editType="datepickeredit"
          />

          <ColumnDirective
            field="Condition"
            headerText="Condition"
            width="120"
            textAlign="Center"
            editType="dropdownedit"
            template={conditionTemplate}
          />

          <ColumnDirective
            field="LastMaintenance"
            headerText="Last Maintenance"
            width="150"
            textAlign="Center"
            type="date"
            format="yyyy-MM-dd"
            editType="datepickeredit"
          />

          <ColumnDirective
            field="Status"
            headerText="Status"
            width="120"
            textAlign="Center"
            editType="dropdownedit"
            template={statusTemplate}
          />
        </ColumnsDirective>

        <Inject services={[Edit, Toolbar, Page, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default App;
