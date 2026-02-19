import { Request, Response } from 'express';
import { generatePatients } from '../utils/data';
import { DataManagerRequest, Patient } from '../types/interface';

let patients: Patient[] = generatePatients(1000);

export const getPatients = (req: Request, res: Response) => {
  try {
    const dm: DataManagerRequest = req.body || {};

    let result = [...patients];

    // Apply filters
    if (dm.where && dm.where.length > 0) {
      result = applyWhere(result, dm.where);
    }

    // Apply search
    if (dm.search && dm.search.length > 0) {
      result = applySearch(result, dm.search);
    }

    // Get total count before paging
    const count = result.length;

    // Apply sort
    if (dm.sorted && dm.sorted.length > 0) {
      result = applySort(result, dm.sorted);
    }

    // Apply page
    const skip: number = dm.skip as number ;
    const take = dm.take as number;
    result = result.slice(skip, skip + take);

    res.json(dm.requiresCounts ? {result: result, count: count} : patients);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve patients',
      result: [],
      count: 0
    });
  }
};

export const createPatient = (req: Request, res: Response) => {
  try {
    const updatedRecord = req.body.value || req.body;
    if (!updatedRecord.PatientName || !updatedRecord.DoctorName) {
      return res.status(422).json({
        message: 'PatientName and DoctorName are required'
      });
    }

    const newId = Math.max(...patients.map(p => p.PatientID), 1000) + 1;
    const newPatient: Patient = {
      PatientID: newId,
      PatientName: updatedRecord.PatientName,
      Age: updatedRecord.Age,
      Gender: updatedRecord.Gender,
      Email: updatedRecord.Email,
      Phone: updatedRecord.Phone,
      DoctorName: updatedRecord.DoctorName,
      Specialty: updatedRecord.Specialty,
      HospitalName: updatedRecord.HospitalName,
      City: updatedRecord.City,
      Country: updatedRecord.Country,
      AdmissionDate: updatedRecord.AdmissionDate || new Date().toISOString().split('T')[0],
      Diagnosis: updatedRecord.Diagnosis,
      Status: updatedRecord.Status
    };

    patients.push(newPatient);
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(422).json({
      message: 'Insert failed: ' + (error instanceof Error ? error.message : String(error))
    });
  }
};

export const updatePatient = (req: Request, res: Response) => {
  try {
    const updatedData = req.body.value || req.body;
    const id = req.body.key || req.params.id || updatedData.patientId;

    if (!id) return res.status(422).json({ message: 'Missing patientId' });

    const index = patients.findIndex((p) => p.PatientID === parseInt(id));
    patients[index] = { ...patients[index], ...updatedData };
    res.json(patients[index]);
  } catch (error) {
    res.status(422).json({ message: 'Update failed: ' + (error instanceof Error ? error.message : String(error)) });
  }
};

export const deletePatient = (req: Request, res: Response) => {
  try {
    const id = req.body.key;
    if (!id) {
      return res.status(422).json({
        message: 'Missing PatientID'
      });
    }
    const index = patients.findIndex(p => p.PatientID === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const deleted = patients[index];
    patients.splice(index, 1);
    res.status(200).json({
      message: 'Patient deleted',
      deleted
    });
  } catch (error) {
    res.status(422).json({
      message: 'Delete failed: ' + (error instanceof Error ? error.message : String(error))
    });
  }
};

const applyWhere = (data: Patient[], where: any[]): Patient[] => {
  if (!where || where.length === 0) return data;

  return data.filter(item => {
    return evaluatePredicateGroup(item, where, 'and');
  });
};

const evaluatePredicateGroup = (item: any, predicates: any[], logic: string = 'and'): boolean => {
  const logicFunc = logic.toLowerCase() === 'or' ? (a: boolean, b: boolean) => a || b : (a: boolean, b: boolean) => a && b;
  let result = logic.toLowerCase() === 'or' ? false : true;

  for (const pred of predicates) {
    let conditionResult: boolean;

    if (pred.isComplex && pred.predicates) {
      conditionResult = evaluatePredicateGroup(item, pred.predicates, pred.condition || 'and');
    } else {
      conditionResult = evaluatePredicate(item, pred);
    }

    result = logicFunc(result, conditionResult);
  }

  return result;
};

const evaluatePredicate = (item: any, pred: any): boolean => {
  const field = pred.field || pred.name;
  const operator = pred.operator;
  const value = pred.value;
  const ignoreCase = pred.ignoreCase !== false;

  if (!field || item[field] === undefined) return true;

  const itemValue = ignoreCase && typeof item[field] === 'string'
    ? item[field].toLowerCase()
    : item[field];

  const compareValue = ignoreCase && typeof value === 'string'
    ? value.toLowerCase()
    : value;

  switch (operator) {
    case 'equal':
      return itemValue === compareValue;
    case 'notequal':
      return itemValue !== compareValue;
    case 'greaterthan':
      return itemValue > compareValue;
    case 'greaterthanorequal':
      return itemValue >= compareValue;
    case 'lessthan':
      return itemValue < compareValue;
    case 'lessthanorequal':
      return itemValue <= compareValue;
    case 'contains':
      return String(itemValue).includes(String(compareValue));
    case 'startswith':
      return String(itemValue).startsWith(String(compareValue));
    case 'endswith':
      return String(itemValue).endsWith(String(compareValue));
    case 'in':
      return Array.isArray(value) ? value.includes(itemValue) : itemValue === value;
    case 'notin':
      return Array.isArray(value) ? !value.includes(itemValue) : itemValue !== value;
    case 'isnull':
      return itemValue === null || itemValue === undefined;
    case 'isnotnull':
      return itemValue !== null && itemValue !== undefined;
    default:
      return true;
  }
};

const applySearch = (data: Patient[], search: any[]): Patient[] => {
  if (!search || search.length === 0) return data;

  return data.filter(item => {
    return search.every(s => {
      const fields = s.fields || [];
      const key = s.key || '';
      const operator = s.operator || 'contains';
      const ignoreCase = s.ignoreCase !== false;

      if (!fields.length || !key) return true;

      const searchKey = ignoreCase ? key.toLowerCase() : key;

      return fields.some((field: string) => {
        const fieldValue = ignoreCase && typeof item[field as keyof Patient] === 'string'
          ? (item[field as keyof Patient] as string).toLowerCase()
          : item[field as keyof Patient];

        if (operator === 'contains') {
          return String(fieldValue).includes(searchKey);
        } else {
          return String(fieldValue) === searchKey;
        }
      });
    });
  });
};

const applySort = (data: Patient[], sorted: any[]): Patient[] => {
  if (!sorted || sorted.length === 0) return data;

  const result = [...data];
  sorted.forEach(sort => {
    const direction = (sort.direction || 'ascending').toLowerCase() === 'descending' ? -1 : 1;
    result.sort((a, b) => {
      const aVal = a[sort.name as keyof Patient];
      const bVal = b[sort.name as keyof Patient];

      if (aVal < bVal) return -direction;
      if (aVal > bVal) return direction;
      return 0;
    });
  });
  return result;
};