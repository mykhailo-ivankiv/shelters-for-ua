export type ShelterInfo = {
  id: string
  longitude: number
  latitude: number
  firstName: string
  lastName: string
  email: string
  petFriendly: boolean
  kidsFriendly: boolean
  hawManyPeopleCanHost: string
  city: string
  country: string
  message: string
  helpWith: string
  accommodationFrom?: Date
  accommodationTo?: Date
  isAvailable: boolean
  socialMedia?: string
  personDetails?: string
  contactDetails?: string
}

export type Shelter = {
  id: string
  longitude: number
  latitude: number

  city: string
  country: string

  petFriendly: boolean
  kidsFriendly: boolean
  hawManyPeopleCanHost: string
}
