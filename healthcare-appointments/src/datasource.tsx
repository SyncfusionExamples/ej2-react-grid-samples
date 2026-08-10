export type Appointment = {
    ApptID: string;
    AppointmentTime: Date;
    Patient: string;
    Doctor: string;
    Room: string;
    Type: string;
    Status: string;
    Fee: number;
    Notes: string;
};

const TOTAL_APPOINTMENTS = 500;

const patientNames: string[] = Array.from({ length: TOTAL_APPOINTMENTS }, (_, i) => `Patient ${i + 1}`);

export const appointmentData: Appointment[] = Array.from({ length: TOTAL_APPOINTMENTS }, (_, i) => {
    const doctors = [
        "Dr. Martinez", "Dr. Smitha", "Dr. Garcia", "Dr. Brianna",
        "Dr. Davis", "Dr. Johnson", "Dr. Williams", "Dr. Joanna"
    ];

    const rooms = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"];

    const types = [
        "Consultation",
        "Follow-up",
        "Emergency",
        "Routine Check",
        "Lab Test"
    ];

    const statuses = [
        "Booked",
        "Completed",
        "Pending",
        "Canceled"
    ];

    const notes = [
        "Requires follow-up in 2 weeks",
        "Prescribed medication after evaluation",
        "Vitals are stable and normal",
        "Lab test recommended",
        "Patient condition improving steadily",
        "Initial diagnosis recorded",
        "Further evaluation needed",
        "Treatment ongoing",
        "Recovery in progress",
        "Monitoring advised"
    ];

    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 2 + Math.floor(Math.random() * 4));

    const slotIndex = Math.floor(Math.random() * 25);
    const hour = 9 + Math.floor(slotIndex / 2);
    const minute = slotIndex % 2 === 0 ? 0 : 30;

    appointmentDate.setHours(hour, minute, 0, 0);

    return {
        ApptID: `APT-${String(1001 + i).padStart(4, "0")}`,
        AppointmentTime: appointmentDate,
        Patient: patientNames[i],
        Doctor: doctors[i % doctors.length],
        Room: rooms[i % rooms.length],
        Type: types[i % types.length],
        Status: statuses[i % statuses.length],
        Fee: 50 + ((i * 15) % 251),
        Notes: notes[i % notes.length]
    };
});