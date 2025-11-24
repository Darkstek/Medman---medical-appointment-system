/* eslint-disable */

const appointmentCreateDtoInType = shape({
  patientId: string(2,50).isRequired(),
  doctorId: string(3,50).isRequired(),
  dateTime: datetime().isRequired(),
  note: string(5000)
});
