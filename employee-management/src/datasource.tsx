const customerImages = [
    'Andrew Callahan.png',
    'Andrew Jack.png',
    'Bergs Dodsworth.png',
    'Anton Tamer.png',
    'Anton Davolio.png',
    'Anton Andrew.png',
    'Anne Dodsworth.png',
    'Andrew Nancy.png',
    'Callahan King.png',
    'Buchanan Zachery.png',
    'Buchanan Michael.png',
    'Buchanan Fuller.png',
    'Dodsworth Jack.png',
    'Callahan Michael.png',
    'Fleet Michael.png',
    'Fuller Kathryn.png',
    'Zachery Van.png',
    'Zachery Peacock.png',
    'Zachery King.png',
    'Vinet Michael.png',
    'Van Davolio.png',
    'Van Callahan.png',
    'Van Anton.png',
    'Tamer Buchanan.png',
    'Rose Nancy.png',
    'Rose Michael.png',
    'Rose Andrew.png',
    'Nancy Michael.png',
    'Nancy Margaret.png',
    'Nancy Laura.png',
    'Nancy Kathryn.png',
    'Nancy Fleet.png',
    'Nancy Callahan.png',
    'Nancy Bergs.png',
    'Nancy Anne.png',
    'Margaret Tamer.png',
    'Margaret Peacock.png',
    'Margaret King.png',
    'Laura Andrew.png',
    'King Laura.png',
    'King Kathryn.png',
    'King Bergs.png',
    'Kathryn Michael.png',
    'Kathryn Fleet.png',
    'Kathryn Callahan.png',
    'Jack Van.png',
    'Jack michael.png',
    'Jack Dodsworth.png',
    'Jack Andrew.png',
    'Fuller King.png'
];

const emailDomains = ['example.com'];
const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations'];
const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];
const statusValues = ['Active', 'On Leave', 'Inactive'];
const designations = ['Software Engineer', 'Senior Consultant', 'Product Manager', 'UX Designer', 'Business Analyst', 'Team Lead'];
const departmentPositions = {
  Engineering: ['Software Engineer', 'Senior Developer', 'DevOps Engineer', 'QA Engineer', 'Engineering Manager'],
  Sales: ['Sales Executive', 'Account Manager', 'Sales Manager', 'Business Development Rep', 'Sales Analyst'],
  Marketing: ['Marketing Specialist', 'Content Strategist', 'SEO Analyst', 'Brand Manager', 'Marketing Manager'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Manager', 'Payroll Specialist', 'Credit Analyst'],
  HR: ['HR Coordinator', 'Recruiter', 'HR Manager', 'Talent Acquisition Specialist', 'People Operations Lead'],
  Operations: ['Operations Coordinator', 'Logistics Manager', 'Operations Analyst', 'Facilities Manager', 'Customer Success Lead']
};
const departmentManagers = {
  Engineering: 'Ava Mitchell',
  Sales: 'Liam Foster',
  Marketing: 'Sophia Nguyen',
  Finance: 'Daniel Brooks',
  HR: 'Emily Carter',
  Operations: 'Noah Bennett'
};
const reportingPersons = ['Emily Carter', 'Daniel Brooks', 'Sophia Nguyen', 'Liam Foster', 'Ava Mitchell', 'Noah Bennett'];
const workLocations = ['Work From Home', 'Office', 'Remote'];
const phoneNumbers = ['+1-555-0101', '+1-555-0103', '+1-555-0105', '+1-555-0107', '+1-555-0109'];

const toTitleCase = (value) =>
    value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');

export const leadManagementData = customerImages.map((imageName, index) => {
    const fileName = imageName.replace(/\.png$/i, '');
    const parts = fileName.split(' ').filter(Boolean);
    const firstName = parts[0] || 'Customer';
    const lastName = parts.slice(1).join(' ') || 'User';
    const emailDomain = emailDomains[index % emailDomains.length];
    const emailLocal = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}`;

    const department = departments[index % departments.length];
    const positionOptions = departmentPositions[department] || designations;
    const position = positionOptions[index % positionOptions.length];
    const reportsTo = departmentManagers[department] || reportingPersons[index % reportingPersons.length];
    const salaryBase = {
      Engineering: 90000,
      Sales: 70000,
      Marketing: 75000,
      Finance: 80000,
      HR: 65000,
      Operations: 70000
    }[department] || 70000;
    const salary = salaryBase + (index % 5) * 5000;
    return {
        id: index + 1,
        EmployeeID: `EMP${String(index + 1).padStart(5, '0')}`,
        employeeName: `${toTitleCase(firstName)} ${toTitleCase(lastName)}`.trim(),
        employeeEmail: `${emailLocal}@${emailDomain}`,
        employeeImage: imageName,
        Department: department,
        Position: position,
        HireDate: new Date(2020 + Math.floor(index / 4), (index % 12), 10 + (index % 20)),
        ReportsTo: reportsTo,
        workLocation: workLocations[index % workLocations.length],
        Phone: phoneNumbers[index % phoneNumbers.length],
        EmploymentType: employmentTypes[index % employmentTypes.length],
        Status: statusValues[index % statusValues.length],
        Salary: salary.toFixed(2),
        PerformanceRating: (2 + ((index * 5) % 31) * 0.1).toFixed(1)
    };
});

export let data: Object[] = [
    { OrderID: 10248, CustomerName: 'Ana Trujillo', OrderDate: new Date(2025, 0, 12), ShipCountry: 'France', Freight: 32.38 },
    { OrderID: 10249, CustomerName: 'Martin Sommer', OrderDate: new Date(2025, 0, 15), ShipCountry: 'Germany', Freight: 11.61 },
    { OrderID: 10250, CustomerName: 'Thomas Hardy', OrderDate: new Date(2025, 1, 5), ShipCountry: 'Brazil', Freight: 65.83 },
    { OrderID: 10251, CustomerName: 'Elizabeth Lincoln', OrderDate: new Date(2025, 1, 18), ShipCountry: 'France', Freight: 41.34 },
    { OrderID: 10252, CustomerName: 'Victoria Ashworth', OrderDate: new Date(2025, 2, 10), ShipCountry: 'Belgium', Freight: 51.30 },
    { OrderID: 10253, CustomerName: 'Martine Rance', OrderDate: new Date(2025, 2, 22), ShipCountry: 'Brazil', Freight: 58.17 },
    { OrderID: 10254, CustomerName: 'John Smith', OrderDate: new Date(2025, 3, 3), ShipCountry: 'USA', Freight: 23.45 },
    { OrderID: 10255, CustomerName: 'Emily Johnson', OrderDate: new Date(2025, 3, 15), ShipCountry: 'Canada', Freight: 45.67 },
    { OrderID: 10256, CustomerName: 'Michael Brown', OrderDate: new Date(2025, 4, 7), ShipCountry: 'UK', Freight: 33.90 },
    { OrderID: 10257, CustomerName: 'Sophia Davis', OrderDate: new Date(2025, 4, 19), ShipCountry: 'Australia', Freight: 29.75 },
    { OrderID: 10258, CustomerName: 'David Wilson', OrderDate: new Date(2025, 5, 2), ShipCountry: 'Germany', Freight: 62.10 },
    { OrderID: 10259, CustomerName: 'Olivia Martinez', OrderDate: new Date(2025, 5, 18), ShipCountry: 'Spain', Freight: 37.50 },
    { OrderID: 10260, CustomerName: 'James Anderson', OrderDate: new Date(2025, 6, 5), ShipCountry: 'Italy', Freight: 48.25 },
    { OrderID: 10261, CustomerName: 'Ava Thomas', OrderDate: new Date(2025, 6, 21), ShipCountry: 'Netherlands', Freight: 27.80 },
    { OrderID: 10262, CustomerName: 'William Taylor', OrderDate: new Date(2025, 7, 9), ShipCountry: 'Sweden', Freight: 55.60 },
    { OrderID: 10263, CustomerName: 'Mia Harris', OrderDate: new Date(2025, 7, 25), ShipCountry: 'Norway', Freight: 21.40 },
    { OrderID: 10264, CustomerName: 'Daniel Clark', OrderDate: new Date(2025, 8, 6), ShipCountry: 'Switzerland', Freight: 49.90 },
    { OrderID: 10265, CustomerName: 'Charlotte Lewis', OrderDate: new Date(2025, 8, 17), ShipCountry: 'Austria', Freight: 34.20 },
    { OrderID: 10266, CustomerName: 'Matthew Hall', OrderDate: new Date(2025, 9, 4), ShipCountry: 'Belgium', Freight: 44.75 },
    { OrderID: 10267, CustomerName: 'Amelia Allen', OrderDate: new Date(2025, 9, 20), ShipCountry: 'Denmark', Freight: 28.60 },
    { OrderID: 10268, CustomerName: 'Christopher Young', OrderDate: new Date(2025, 10, 3), ShipCountry: 'Finland', Freight: 39.85 },
    { OrderID: 10269, CustomerName: 'Harper King', OrderDate: new Date(2025, 10, 14), ShipCountry: 'Ireland', Freight: 36.40 },
    { OrderID: 10270, CustomerName: 'Joshua Wright', OrderDate: new Date(2025, 10, 26), ShipCountry: 'New Zealand', Freight: 52.90 },
    { OrderID: 10271, CustomerName: 'Evelyn Scott', OrderDate: new Date(2025, 11, 5), ShipCountry: 'Japan', Freight: 61.75 },
];