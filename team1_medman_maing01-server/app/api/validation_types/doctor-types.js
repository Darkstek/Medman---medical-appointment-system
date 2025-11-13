/* eslint-disable */
// noinspection JSUnresolvedReference

const doctorCreateDtoInType = shape({});

const doctorGetDtoInType = shape({
  id: id().isRequired()
});

const doctorFindDtoInType = shape({
  firstName: string(1, 200),
  lastName: string(1, 200),
  specialization: string(1, 200),
  phoneNumber: string(1, 200),
  emailAddress: string(1, 200), // we need to be able to search by partial email address, email() type is not suitable here
  clinicId: number(),
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
      "clinicId", "status", "description", "averageRating", "ratingCount"
    ]).isRequired(),
    oneOf(["asc", "desc"]).isRequired()
  )
});
