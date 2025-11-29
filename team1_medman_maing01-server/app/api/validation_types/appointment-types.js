/* eslint-disable */

const appointmentCreateDtoInType = shape({
  patientId: string(2,50).isRequired(),
  doctorId: string(3,50).isRequired(),
  dateTime: datetime().isRequired(),
  note: string(5000)
});

const appointmentGetDtoInType = shape({
  id: id().isRequired()
});

const appointmentFindDtoInType = shape({
  patientId: string(2,50),
  doctorId: string(2,50),
  status: oneOf(["Created", "Confirmed", "Cancelled", "Completed"]),
  searchMode: oneOf(["and", "or"]),
  pageInfo: pageInfo(),
  sortBy: map(
    oneOf([
      "id", "patientId", "doctorId", "dateTime", "status", "note"
    ]).isRequired(),
    oneOf(["asc", "desc"]).isRequired()
  )
});
