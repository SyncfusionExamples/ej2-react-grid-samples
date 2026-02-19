import { Patient } from "../types/interface";
const patientNames = [
  "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "Robert Wilson",
  "Jessica Martinez", "David Anderson", "Jennifer Taylor", "William Thomas", "Lisa White",
  "James Moore", "Mary Jackson", "Richard Martin", "Patricia Lee", "Joseph Harris",
  "Barbara Clark", "Thomas Lewis", "Susan Walker", "Charles Hall", "Donna Young",
  "Daniel King", "Michelle Scott", "Matthew Green", "Dorothy Adams", "Mark Nelson",
  "Carol Baker", "Donald Carter", "Christine Phillips", "Steven Roberts", "Diane Campbell",
  "Paul Parker", "Hannah Evans", "Andrew Edwards", "Gloria Collins", "Joshua Stewart",
  "Kelly Morris", "Kevin Murphy", "Deborah Rogers", "Edward Peterson", "Catherine Peterson",
  "Brian Cook", "Helen Morgan", "Edward Bell", "Sandra Gibbs", "Ronald Carroll",
  "Kathleen Stewart", "Ronald Powell", "Shirley Long", "Paul Patterson", "Angela Hughes"
];

const doctorNames = [
  "Dr. James Johnson", "Dr. Sarah Williams", "Dr. Michael Brown", "Dr. Emily Davis",
  "Dr. Robert Wilson", "Dr. Jessica Martinez", "Dr. David Anderson", "Dr. Jennifer Taylor",
  "Dr. William Thomas", "Dr. Lisa White", "Dr. Charles Wilson", "Dr. Mary Jackson",
  "Dr. Richard Martin", "Dr. Patricia Lee", "Dr. Joseph Harris", "Dr. Barbara Clark",
  "Dr. Thomas Lewis", "Dr. Susan Walker", "Dr. Daniel King", "Dr. Michelle Scott",
  "Dr. Matthew Green", "Dr. Dorothy Adams", "Dr. Mark Nelson", "Dr. Carol Baker",
  "Dr. Donald Carter", "Dr. Christine Phillips", "Dr. Steven Roberts", "Dr. Diane Campbell",
  "Dr. Paul Parker", "Dr. Hannah Evans", "Dr. Andrew Edwards", "Dr. Gloria Collins",
  "Dr. Joshua Stewart", "Dr. Kelly Morris", "Dr. Kevin Murphy", "Dr. Deborah Rogers",
  "Dr. Edward Peterson", "Dr. Catherine Peterson", "Dr. Brian Cook", "Dr. Helen Morgan",
  "Dr. Ronald Bell", "Dr. Sandra Gibbs", "Dr. Ronald Carroll", "Dr. Kathleen Stewart",
  "Dr. Powell Long", "Dr. Shirley Long", "Dr. Patterson Hughes", "Dr. Angela Hughes"
];

const hospitalNames = [
  "City General Hospital", "St. Mary's Medical Center", "County Health Hospital",
  "University Medical Center", "Memorial Hospital", "Baptist Hospital",
  "Sacred Heart Hospital", "St. Luke's Hospital", "Johns Hopkins Medicine",
  "Mayo Clinic", "Cleveland Clinic", "Children's Hospital",
  "Metropolitan Hospital", "Central Hospital", "Community Medical Center",
  "Riverside Hospital", "Northside Hospital", "Westside Medical Center",
  "Eastside Health Center", "Regional Hospital", "Mercy Hospital",
  "Providence Hospital", "Trinity Medical Center", "Parkside Hospital",
  "Brookside Medical", "Valley Hospital", "Mountain View Hospital",
  "Lakeside Medical Center", "Sunrise Hospital", "Sunset Medical",
  "Downtown Hospital", "Uptown Medical Center", "Midtown Hospital",
  "Southridge Medical", "Northridge Hospital", "Eastridge Medical",
  "Westridge Hospital", "Central Valley Hospital", "Imperial Hospital",
  "Royal Hospital", "Grand Hospital", "Elite Medical Center",
  "Premier Hospital", "Super Medical", "Advanced Hospital",
  "Star Medical Center", "Beacon Hospital", "Infinity Medical"
];

const specialties = [
  "Cardiology", "Neurology", "Orthopedics", "General Surgery", "Pediatrics",
  "Oncology", "Psychiatry", "Dermatology", "ENT", "Ophthalmology",
  "Gastroenterology", "Urology", "Rheumatology", "Endocrinology", "Pulmonology",
  "Nephrology", "Hematology", "Infectious Disease", "Obstetrics & Gynecology", "Pediatric Surgery",
  "Thoracic Surgery", "Vascular Surgery", "Plastic Surgery", "Anesthesiology", "Emergency Medicine"
];

const diagnoses = [
  "Hypertension", "Diabetes Type 2", "Coronary Artery Disease", "Pneumonia", "Asthma",
  "Chronic Obstructive Pulmonary Disease", "Arthritis", "Acute Myocardial Infarction", "Stroke", "Fracture",
  "Kidney Stones", "Appendicitis", "Gastric Ulcer", "Hepatitis", "Tuberculosis",
  "Migraine", "Back Pain", "Anxiety Disorder", "Depression", "Urinary Tract Infection",
  "Bronchitis", "Sinusitis", "Ear Infection", "Skin Infection", "Gastroenteritis"
];

const genders = ["Male", "Female"];
const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
  "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington",
  "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City",
  "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore"
];

const countries = ["USA", "Canada", "UK", "Australia", "Germany", "France", "Spain", "Italy"];

const statuses = ["Active", "Discharged", "Under Observation", "Critical", "Stable", "Recovering"];

export function generatePatients(count: number): Patient[] {
  /**
   * Mock database: Generate 1000 patient records
   */
  let patients: Patient[] = Array.from({ length: count }, (_, i) => {
    const admissionDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    return {
      PatientID: 1001 + i,
      PatientName: patientNames[i % patientNames.length],
      Age: Math.floor(Math.random() * 70) + 18,
      Gender: genders[Math.floor(Math.random() * genders.length)],
      Email: `patient${1001 + i}@hospital.com`,
      Phone: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      DoctorName: doctorNames[Math.floor(Math.random() * doctorNames.length)],
      Specialty: specialties[Math.floor(Math.random() * specialties.length)],
      HospitalName: hospitalNames[Math.floor(Math.random() * hospitalNames.length)],
      City: cities[Math.floor(Math.random() * cities.length)],
      Country: countries[Math.floor(Math.random() * countries.length)],
      AdmissionDate: admissionDate.toISOString().split('T')[0],
      Diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
      Status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });

  return patients;
}
