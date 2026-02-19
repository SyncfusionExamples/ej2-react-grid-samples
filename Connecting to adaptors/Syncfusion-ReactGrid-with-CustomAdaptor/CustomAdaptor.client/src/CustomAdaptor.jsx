import { setValue } from '@syncfusion/ej2-base';
import { ODataV4Adaptor, } from '@syncfusion/ej2-data';
export class CustomAdaptor extends ODataV4Adaptor {
    processResponse() {
        let i = 0;
        const original = super.processResponse.apply(this, arguments);
        /* Adding serial number */
        if (original.result) {
            original.result.forEach((item) => setValue('SNo', ++i, item));
        }
        return original;
    }

    processQuery(dm, query) {
        dm.dataSource.url = 'https://localhost:7267/odata/orders';
        query.addParams('Syncfusion in React Grid', 'true');
        const result = super.processQuery.apply(this, arguments);
        return result;

    }

    beforeSend(dm, request, settings) {
        request.headers.set('Authorization', `Bearer${(window).token}`);
        super.beforeSend(dm, request, settings);
    }
}