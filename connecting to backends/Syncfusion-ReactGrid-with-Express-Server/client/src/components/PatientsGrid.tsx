import React from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Sort,
  Filter,
  Edit,
  Toolbar,
  Search,
  Inject,
  EditSettingsModel,
  ToolbarItems,
  PageSettingsModel,
} from '@syncfusion/ej2-react-grids';
import { patientDataManager } from '../services/dataManager';

/**
 * Patients Grid Component
 * Displays hospital patient records with full CRUD functionality
 */
const PatientsGrid: React.FC = () => {
  /**
   * Page Settings
   * Configure pagination with 12 records per page
   */
  const pageSettings: PageSettingsModel = {
    pageSize: 12,
    pageSizes: [12, 25, 50, 100],
  };

  /**
   * Edit Settings
   * Enable inline editing with all CRUD operations
   */
  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal', // Inline edit mode
    newRowPosition: 'Top',
  };

  /**
   * Toolbar Settings
   * Add buttons for CRUD operations and search
   */
  const toolbar: ToolbarItems[] = [
    'Add',
    'Edit',
    'Delete',
    'Update',
    'Cancel',
    'Search',
  ];

  /**
   * Validation Rules for form fields
   */
  const validationRules = {
    required: true,
  };
  return (
    <div className="patients-grid-container">
      <div className="grid-header">
        <h2>🏥 Hospital Patient Management</h2>
        <p className="grid-subtitle">
          Manage patient records with real-time CRUD operations
        </p>
      </div>

      <GridComponent
        dataSource={patientDataManager}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        pageSettings={pageSettings}
        editSettings={editSettings}
        toolbar={toolbar}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="PatientID"
            headerText="Patient ID"
            width="100"
            isPrimaryKey={true}
            visible={true}
            allowEditing={false}
            textAlign="Right"
          />
          <ColumnDirective
            field="PatientName"
            headerText="Patient Name"
            width="180"
            validationRules={validationRules}
          />
          <ColumnDirective
            field="Age"
            headerText="Age"
            width="80"
            textAlign="Right"
            validationRules={{ required: true, min: 0, max: 150 }}
          />
          <ColumnDirective
            field="Gender"
            headerText="Gender"
            width="100"
            editType="dropdownedit"
          />

          {/* Contact Information */}
          <ColumnDirective
            field="Email"
            headerText="Email"
            width="200"
            validationRules={{ email: true }}
          />
          <ColumnDirective
            field="Phone"
            headerText="Phone"
            width="140"
          />

          {/* Medical Staff */}
          <ColumnDirective
            field="DoctorName"
            headerText="Doctor Name"
            width="180"
            validationRules={validationRules}
          />
          <ColumnDirective
            field="Specialty"
            headerText="Specialty"
            width="150"
            editType="dropdownedit"
          />
          <ColumnDirective
            field="HospitalName"
            headerText="Hospital Name"
            width="200"
          />
          <ColumnDirective
            field="City"
            headerText="City"
            width="130"
          />
          <ColumnDirective
            field="Country"
            headerText="Country"
            width="120"
          />
          <ColumnDirective
            field="AdmissionDate"
            headerText="Admission Date"
            width="140"
            type="date"
            format="yMd"
            editType="datepickeredit"
          />
          <ColumnDirective
            field="Diagnosis"
            headerText="Diagnosis"
            width="200"
          />
          <ColumnDirective
            field="Status"
            headerText="Status"
            width="150"
            editType="dropdownedit"
          />
        </ColumnsDirective>

        <Inject services={[Page, Sort, Filter, Edit, Toolbar, Search]} />
      </GridComponent>
    </div>
  );
};

export default PatientsGrid;
