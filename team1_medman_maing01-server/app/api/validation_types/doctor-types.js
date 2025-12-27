/* eslint-disable */
// noinspection JSUnresolvedReference

const timeSlotType = shape({
  start: datetime().isRequired(),
  end: datetime().isRequired(),
});

const doctorCreateDtoInType = shape({
  firstName: string(1, 200),
  lastName: string(1, 200),
  specialization: string(1, 200),
  phoneNumber: string(1, 200),
  emailAddress: string(1, 200),
  clinicName: string(1, 200),
  status: oneOf(["active", "inactive"]),
  availableTimeSlots: array(timeSlotType(), 5000),
  profilePhoto: string(1, 200000),
  description: string(1, 5000),
});

const doctorGetDtoInType = shape({
  id: id().isRequired()
});

const doctorFindDtoInType = shape({
  firstName: string(1, 200),
  lastName: string(1, 200),
  specialization: string(1, 200),
  phoneNumber: string(1, 200),
  emailAddress: string(1, 200), // we need to be able to search by partial email address, email() type is not suitable here
  clinicName: string(1, 200),
  status: oneOf(["active", "inactive"]),
  availableBetween: shape({
    start: datetime().isRequired(),
    end: datetime().isRequired()
  }),
  description: string(1, 200),
  averageRatingAbove: float(5, 1),
  ratingCountGreaterThan: integer(),
  searchMode: oneOf(["and", "or"]),
  pageInfo: pageInfo(),
  sortBy: map(
    oneOf([
      "id", "firstName", "lastName", "specialization", "phoneNumber", "emailAddress",
      "clinicName", "status", "description"
    ]).isRequired(),
    oneOf(["asc", "desc"]).isRequired()
  )
});

const doctorUpdateDtoInType = shape({
  id: id().isRequired(),
  doctorId: string(2, 50),
  firstName: string(1, 200),
  lastName: string(1, 200),
  specialization: string(1, 200),
  phoneNumber: string(1, 200),
  emailAddress: string(1, 200),
  clinicName: string(1, 200),
  status: oneOf(["active", "inactive"]),
  availableTimeSlots: array(timeSlotType(), 5000),
  profilePhoto: string(1, 200000),
  description: string(1, 5000)
});

const doctorRemoveDtoInType = shape({
  id: id().isRequired()
});
