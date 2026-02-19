
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';

const API_BASE_URL = 'http://localhost:5000/api/patients';

export const patientDataManager = new DataManager({
  url: API_BASE_URL,
  insertUrl: API_BASE_URL + '/create',
  updateUrl: API_BASE_URL + '/update',
  removeUrl: API_BASE_URL + '/remove',
  adaptor: new UrlAdaptor()
});
