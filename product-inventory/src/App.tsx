import React from 'react';
import {
  ColumnDirective,
  ColumnsDirective,
  Filter,
  GridComponent,
  Inject,
  Page,
  Sort,
  DetailRow,
  Toolbar,
  Edit,
  Resize,
} from '@syncfusion/ej2-react-grids';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, SplineSeries } from '@syncfusion/ej2-react-charts';
import { NumericTextBoxComponent, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { extend, isNullOrUndefined } from '@syncfusion/ej2-base';
import { productData } from './datasource';
import './App.css';

// ============================================================================
// CATEGORY BADGE META
// ============================================================================
const categoryBadges = {
  Laptop: { label: 'Laptop', colorClass: 'category-laptop' },
  Smartphone: { label: 'Smartphone', colorClass: 'category-smartphone' },
  HeadPhone: { label: 'HeadPhone', colorClass: 'category-headphone' },
  Wearables: { label: 'Wearables', colorClass: 'category-wearables' },
  Tablet: { label: 'Tablet', colorClass: 'category-tablet' },
  Monitor: { label: 'Monitor', colorClass: 'category-monitor' },
  Accessories: { label: 'Accessories', colorClass: 'category-Accessories' },
  Gaming: { label: 'Gaming', colorClass: 'category-gaming' },
};

// ============================================================================
// COLUMN TEMPLATES
// ============================================================================
const productColumnTemplate = (props) => (
  <div className="product-template">
    <div className="product-image-wrapper">
      <img
        src={`./src/assets/products/${props.ProductName}.png`}
        alt={props.ProductName}
        className="product-image"
      />
    </div>
    <div className="product-copy">
      <div className="product-name">{props.ProductName}</div>
      <div className="product-meta">
        <div className="product-description">{props.Description}</div>
        <div className="product-sku">SKU: {props.SKU}</div>
      </div>
    </div>
  </div>
);

const categoryColumnTemplate = (props) => {
  const category = categoryBadges[props.Category] || categoryBadges.Accessories;
  return (
    <span className={`category-badge ${category.colorClass}`}>
      <span>{category.label}</span>
    </span>
  );
};

const statusColumnTemplate = (props) => (
  <div className="status-cell">
    <span
      className={`status-badge ${
        props.Status === 'In Stock'
          ? 'status-badge-success'
          : props.Status === 'Low Stock'
          ? 'status-badge-error'
          : 'status-badge-warning'
      }`}
    >
      {props.Status}
    </span>
    <div className="status-units">{props.Units} units</div>
  </div>
);

const salesColumnTemplate = (props) => {
  const chartColorMap = {
    Laptop: '#9333EA',
    Smartphone: '#2563EB',
    HeadPhone: '#22C55E',
    Wearables: '#EC4899',
    Tablet: '#3B82F6',
    Monitor: '#8B5CF6',
    Accessories: '#D946EF',
    Gaming: '#F59E0B'
  };

  const color = chartColorMap[props.Category] || '#9333EA';

  const trend =
    ((props.SalesMonth3 - props.SalesMonth2) /
      Math.max(props.SalesMonth2, 1)) *
    100;

  const chartData = props.ChartData || [];

  return (
    <div className="sales-cell">
      <div className="sales-number">
        {props.SalesMonth3}
      </div>

      <ChartComponent
        id={`sales-chart-${props.ProductID}`}
        height="42px"
        width="140px"
        background="transparent"
        chartArea={{
          border: { width: 0 }
        }}
        primaryXAxis={{
          visible: false,
          majorGridLines: { width: 0 },
          lineStyle: { width: 0 }
        }}
        primaryYAxis={{
          visible: false,
          minimum: 20,
          maximum: 140,
          interval: 20,
          majorGridLines: { width: 0 },
          lineStyle: { width: 0 }
        }}
        legendSettings={{ visible: false }}
      >
        <Inject services={[SplineSeries]} />

        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="y"
            type="Spline"
            width={2.5}
            fill={color}
          />
        </SeriesCollectionDirective>
      </ChartComponent>

      <div
        className={`sales-growth ${trend >= 0 ? 'positive' : 'negative'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
      </div>
    </div>
  );
};

// ============================================================================
// DETAIL TEMPLATE - Product Detail Page
// ============================================================================
const detailTemplate = (props) => {
  const discount = Math.round(
    ((props.OriginalPrice - props.Price) / props.OriginalPrice) * 100
  );

  return (
    <div className="detail-page">
      <div className="detail-top">
        <div className="product-detail-wrapper">
          <div className="detail-grid">
            {/* Product Description */}
            <div className="detail-card">
              <h3 className="card-title">Product Description</h3>
              <div className="product-description-text">
                {props.ProductDescription}
              </div>
              <h4 className="sub-title">Key Highlights</h4>
              <ul className="highlight-list">
                {(props.Highlights || []).map((item, index) => (
                  <li key={index}>
                    <span className="bullet"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Specifications */}
            <div className="detail-card">
              <h3 className="card-title">Technical Specifications</h3>
              {Object.entries(props.Specifications || {}).map(([key, value]) => (
                <div className="info-row" key={key}>
                  <span>{key}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>

            {/* Pricing Details */}
            <div className="detail-card">
              <h3 className="card-title">Pricing Details</h3>
              <div className="info-row">
                <span>Current Price</span>
                <strong className="current-price">
                  ${props.Price.toLocaleString()}
                </strong>
              </div>
              <div className="info-row">
                <span>Original Price</span>
                <strong className="original-price">
                  ${props.OriginalPrice.toLocaleString()}
                </strong>
              </div>
              <div className="info-row">
                <span>Discount</span>
                <strong className="discount-price">{discount}%</strong>
              </div>
              <div className="info-row">
                <span>Cost Price</span>
                <strong className="cost-price">
                  ${props.CostPrice.toLocaleString()}
                </strong>
              </div>
              <div className="info-row">
                <span>Profit Margin</span>
                <strong className="profit-price">
                  {props.ProfitMargin}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HEADER TEMPLATE & ICONS
// ============================================================================
const headerIcons = {
  ProductName: 'e-icons e-description',
  SalesMonth3: 'e-icons e-chart',
  Price: 'e-icons e-money',
};

const headerTemplate = (props) => {
  const iconClass = headerIcons[props.field] || 'e-icons e-list';
  return (
    <div className="custom-header">
      <span className={iconClass}></span>
      <span className="header-text">{props.headerText}</span>
    </div>
  );
};

// ============================================================================
// DIALOG FORM TEMPLATE
// ============================================================================
function DialogFormTemplate(props) {
  const [val, setVal] = React.useState(extend({}, {}, props, true));

  const categoryData = [
    'Laptop',
    'Smartphone',
    'HeadPhone',
    'Wearables',
    'Tablet',
    'Monitor',
    'Accessories',
    'Gaming',
  ];

  const statusData = ['In Stock', 'Out of Stock', 'Low Stock'];
  let data = val;

  React.useEffect(() => {
    if (data.isAdd) {
      Object.keys(data).forEach((key) => {
        if (key !== 'isAdd' && isNullOrUndefined(data[key])) {
          data[key] = '';
        }
      });
    }
  }, []);

  function change(args) {
    const key = args.target.name;
    const value = args.target.value;
    setVal((prevVal) => ({ ...prevVal, [key]: value }));
  }

  const nonEditableFields = ['ProductName', 'Category', 'ProductID'];

  const numericChange = (args) => {
    setVal((prev) => ({
      ...prev,
      Price: args.value,
    }));
  };

  const isFieldEditable = (field) => {
    if (data.isAdd) {
      return true;
    }
    return !nonEditableFields.includes(field);
  };

  const changeUnits = (args) => {
    const units = args.value;
    let status = 'In Stock';

    if (units === 0) {
      status = 'Out of Stock';
    } else if (units <= 15) {
      status = 'Low Stock';
    }

    setVal((prev) => ({
      ...prev,
      Units: units,
      Status: status,
    }));
  };

  return (
    <div className="product-dialog-template">
      <div className="form-row">
        <div className="form-group col-md-6">
          <TextBoxComponent
            id="ProductName"
            name="ProductName"
            enabled={isFieldEditable('ProductName')}
            value={data.ProductName}
            change={change}
            placeholder="Product Name"
            floatLabelType="Always"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group col-md-6">
          <DropDownListComponent
            id="Category"
            name="Category"
            enabled={isFieldEditable('Category')}
            dataSource={categoryData}
            value={data.Category}
            placeholder="Category"
            floatLabelType="Always"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group col-md-6">
          <NumericTextBoxComponent
            id="SalesMonth3"
            name="SalesMonth3"
            value={data.SalesMonth3}
            format="N0"
            decimals={0}
            showSpinButton={false}
            placeholder="Unit Sales (30 Days)"
            floatLabelType="Always"
          />
        </div>
        <div className="form-group col-md-6">
          <NumericTextBoxComponent
            id="Price"
            name="Price"
            value={data.Price}
            format="C2"
            decimals={2}
            showSpinButton={false}
            placeholder="Price"
            min={50}
            max={10000}
            change={numericChange}
            floatLabelType="Always"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group col-md-6">
          <NumericTextBoxComponent
            id="Units"
            name="Units"
            value={data.Units}
            format="N0"
            decimals={0}
            min={0}
            max={1000}
            change={changeUnits}
            showSpinButton={false}
            placeholder="Available Units"
            floatLabelType="Always"
          />
        </div>
        <div className="form-group col-md-6">
          <DropDownListComponent
            id="Status"
            name="Status"
            dataSource={statusData}
            value={data.Status}
            enabled={false}
            placeholder="Status"
            floatLabelType="Always"
          />
        </div>
      </div>
    </div>
  );
}

function DialogTemplate(props) {
  return <DialogFormTemplate {...props} />;
}

const editSettings = {
  allowEditing: true,
  allowDeleting: true,
  mode: 'Dialog',
  template: DialogTemplate,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
function App() {
  const gridRef = {};

  function created() {
    if (gridRef && gridRef.filterModule) {
      gridRef.filterModule.customOperators = {
        numberOperator: [
          { value: 'equal', text: 'Equal' },
          { value: 'greaterThan', text: 'Greater Than' },
          { value: 'lessThan', text: 'Less Than' },
          { value: 'greaterThanOrEqual', text: 'Greater Than' },
          { value: 'lessThanOrEqual ', text: 'Less Than' },
        ],
      };
    }
  }

  return (
    <div>
      <GridComponent
        id="detailTemplate"
        dataSource={productData}
        allowSorting={true}
        allowFiltering={true}
        filterSettings={{ type: 'CheckBox' }}
        detailTemplate={detailTemplate}
        showColumnChooser={true}
        toolbar={['Search', 'Edit', 'Delete']}
        height="440px"
        rowHeight={76}
        enableHover={false}
        allowResizing={true}
        allowEditing={true}
        editSettings={editSettings}
        created={created}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="ProductID"
            headerText="ID"
            width="100"
            type="string"
            textAlign="Left"
            isPrimaryKey={true}
          />
          <ColumnDirective
            field="ProductName"
            headerText="Product"
            width="260"
            template={productColumnTemplate}
            headerTemplate={headerTemplate}
            allowEditing={false}
          />
          <ColumnDirective
            field="Category"
            headerText="Category"
            width="150"
            template={categoryColumnTemplate}
            textAlign="Center"
            allowEditing={false}
          />
          <ColumnDirective
            field="SalesMonth3"
            headerText=" Unit Sales (30 Days)"
            width="240"
            template={salesColumnTemplate}
            headerTemplate={headerTemplate}
            textAlign="Center"
            filter={{ type: 'Menu' }}
            validationRules={{ required: true, number: true, min: 0 }}
          />
          <ColumnDirective
            field="Price"
            headerText="Price"
            width="120"
            textAlign="Right"
            format="C2"
            editType="numericedit"
            headerTemplate={headerTemplate}
            filter={{ type: 'Menu' }}
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="Status"
            headerText="Status"
            width="140"
            textAlign="Center"
            template={statusColumnTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Toolbar, DetailRow, Edit, Resize]} />
      </GridComponent>
    </div>
  );
}

export default App;
