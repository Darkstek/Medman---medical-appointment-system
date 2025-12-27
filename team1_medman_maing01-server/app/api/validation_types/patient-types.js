/* eslint-disable */
// noinspection JSUnresolvedReference

const medicalRecordType = shape({
  previousAppointments: array(date(), 5000),
  medications: array(string(1,200), 5000),
  illnesses: array(string(1,200), 5000),
});

const patientCreateDtoInType = shape({
  firstName: string(1, 200),
  lastName: string(1, 200),
  phoneNumber: string(1, 200),
  emailAddress: email(),
  dateOfBirth: date(),
  gender: string(1, 200),
  medicalRecord: medicalRecordType(),
  allergies: array(string(1,200), 100),
  insuranceProvider: string(1, 200),
  emergencyContact: string(1, 200)
});

const patientGetDtoInType = shape({
  id: string(1, 10).isRequired() // If 'id()' Validator expects UU format.
});

const patientFindDtoInType = shape({
  firstName: string(1, 200),
  lastName: string(1, 200),
  phoneNumber: string(1, 200),
  emailAddress: string(1, 200), // we need to be able to search by partial email address, email() type is not suitable here
  dateOfBirth: date(),
  gender: string(1, 200),
  medicalRecord: medicalRecordType(),
  allergies: array(string(), 100),
  insuranceProvider: string(1, 200),
  emergencyContact: string(1, 200),
  searchMode: oneOf(["and", "or"]),
  pageInfo: pageInfo(),
  sortBy: map(
    oneOf([
      "id", "patientId", "firstName", "phoneNumber", "emailAddress", "dateOfBirth", "gender", "medicalRecord",
      "allergies", "insuranceProvider"
    ]).isRequired(),
    oneOf(["asc", "desc"]).isRequired()
  )
});

const patientUpdateDtoInType = shape({
  id: string(1, 10).isRequired(), // If 'id()' Validator expects UU format.
  firstName: string(1, 200),
  lastName: string(1, 200),
  phoneNumber: string(1, 200),
  emailAddress: email(),
  dateOfBirth: date(),
  gender: string(1, 200),
  medicalRecord: medicalRecordType(),
  allergies: array(string(1,200), 100),
  insuranceProvider: string(1, 200),
  emergencyContact: string(1, 200)
});
