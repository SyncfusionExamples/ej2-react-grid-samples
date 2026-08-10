import * as React from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Group,
  Aggregate,
  Page,
  Sort,
  Filter,
  Inject,
  AggregatesDirective,
  AggregateDirective,
  AggregateColumnsDirective,
  AggregateColumnDirective
} from '@syncfusion/ej2-react-grids';

import { groupAggregatedata } from './datasource';

type AggregateTemplateProps = {
  Min?: number;
  Max?: number;
  Sum?: number;
  Average?: number;
};

function App() {
  const groupSettings: { columns: string[]; showDropArea: boolean } = {
    columns: ['Category'],
    showDropArea: false
  };

  const captionTemplate = (props: AggregateTemplateProps): React.JSX.Element => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px'
        }}
      >
        <span style={{ color: '#DC2626' }}>
          Min: {props.Min?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>

        <span>|</span>

        <span style={{ color: '#15803D' }}>
          Max: {props.Max?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      </div>
    );
  };

  const totalProducedTemplate = (props: AggregateTemplateProps): React.JSX.Element => {
    return (
      <div
        style={{
          textAlign: 'center'
        }}
      >
        Total Produced:{' '}
        {(props.Sum ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}{' '}
        KWh
      </div>
    );
  };

  const averageProducedTemplate = (props: AggregateTemplateProps): React.JSX.Element => {
    return (
      <div
        style={{
          textAlign: 'center'
        }}
      >
        Average Produced:{' '}
        {(props.Average ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}{' '}
        KWh
      </div>
    );
  };

  const groupPriceTemplate = (props: AggregateTemplateProps): React.JSX.Element => {
    return (
      <div
        style={{
          textAlign: 'right',
          paddingRight: '8px',
          color: '#2563EB'
        }}
      >
        Sum: {(props.Sum ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '0 12px' }}>
      <GridComponent
        dataSource={groupAggregatedata.slice(0, 200) as Object[]}
        allowGrouping={true}
        groupSettings={groupSettings}
        allowSorting={true}
        allowFiltering={true}
        filterSettings={{ type: 'Menu' }}
        height="405"
      >
        <ColumnsDirective>

          <ColumnDirective
            field="Month"
            headerText="Month"
            type="date"
            format="MMM-yyyy"
            width="160"
            clipMode="EllipsisWithTooltip"
          />

          <ColumnDirective
            field="Category"
            headerText="Category"
            width="150"
            clipMode="EllipsisWithTooltip"
          />

          {/* Stacked Header */}

          <ColumnDirective
            headerText="Energy (KWh)"
            textAlign="Center"
            columns={[
              {
                field: "Consumed",
                headerText: "Consumed",
                format: "N2",
                textAlign: "Right",
                width: 250
              },
              {
                field: "Produced",
                headerText: "Produced",
                format: "N2",
                textAlign: "Right",
                width: 330
              }
            ]}
          />

          <ColumnDirective
            field="Weather"
            headerText="Weather"
            width="130"
            clipMode="EllipsisWithTooltip"
            filter={{ type: 'CheckBox' }}
          />

          <ColumnDirective
            field="Price"
            headerText="Price"
            format="C2"
            textAlign="Right"
            width="140"
            clipMode="EllipsisWithTooltip"
          />

        </ColumnsDirective>

        <AggregatesDirective>

          {/* Group Caption Aggregates */}

          <AggregateDirective>
            <AggregateColumnsDirective>

              <AggregateColumnDirective
                field="Produced"
                type="Min"
                groupCaptionTemplate={captionTemplate}
              />

              <AggregateColumnDirective
                field="Produced"
                type="Max"
                groupCaptionTemplate={captionTemplate}
              />

              <AggregateColumnDirective
                field="Price"
                type="Sum"
                format="C2"
                groupCaptionTemplate={groupPriceTemplate}
              />

            </AggregateColumnsDirective>
          </AggregateDirective>

          {/* Footer Sum */}

          {/* Footer Row 1 - Totals */}
          <AggregateDirective>
            <AggregateColumnsDirective>
              <AggregateColumnDirective
                field="Consumed"
                type="Sum"
                format="N2"
                footerTemplate={(props: AggregateTemplateProps) => (
                  <div
                    style={{
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Total Consumed:{' '}
                    {props.Sum?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
                    KWh
                  </div>
                )}
              />

              <AggregateColumnDirective
                field="Produced"
                type="Sum"
                format="N2"
                footerTemplate={(props: AggregateTemplateProps) => (
                  <div
                    style={{
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Total Produced:{' '}
                    {props.Sum?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
                    KWh
                  </div>
                )}
              />
            </AggregateColumnsDirective>
          </AggregateDirective>

          {/* Footer Row 2 - Averages */}
          <AggregateDirective>
            <AggregateColumnsDirective>
              <AggregateColumnDirective
                field="Consumed"
                type="Average"
                format="N2"
                footerTemplate={(props: AggregateTemplateProps) => (
                  <div
                    style={{
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Average Consumed:{' '}
                    {props.Average?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
                    KWh
                  </div>
                )}
              />

              <AggregateColumnDirective
                field="Produced"
                type="Average"
                format="N2"
                footerTemplate={(props: AggregateTemplateProps) => (
                  <div
                    style={{
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Average Produced:{' '}
                    {props.Average?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
                    KWh
                  </div>
                )}
              />
            </AggregateColumnsDirective>
          </AggregateDirective>

        </AggregatesDirective>

        <Inject services={[Group, Filter, Aggregate, Sort]} />
      </GridComponent>

    </div>
  );
}

export default App;