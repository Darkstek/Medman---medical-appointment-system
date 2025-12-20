/* eslint-disable */

const rateDoctorCreateDtoInType = shape({
  patientId: string(2,50).isRequired(),
  doctorId: string(3,50).isRequired(),
  ratingScore: number(1, 5).isRequired(),
  comment: string(5000)
});

const rateDoctorGetDtoInType = shape({
  id: id().isRequired()
});

const rateDoctorFindDtoInType = shape({
  patientId: string(2,50),
  doctorId: string(2,50)
});
