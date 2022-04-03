import familyPetChild from './icons/family-pet-child.png'
import familyChild from './icons/family-child.png'
import familyPet from './icons/family-pet.png'
import family from './icons/family.png'
import { Marker } from 'react-map-gl'
import * as React from 'react'

import './SheltersMap.css'
import BEM from './helpers/BEM'

const b = BEM('SheltersMap')

const ShelterMarker = ({
  onClick,
  longitude,
  latitude,
  isLoading,
  hawManyPeopleCanHost,
  petFriendly,
  kidsFriendly,
  primary,
}) => (
  <Marker
    style={primary ? { zIndex: 999 } : {}}
    onClick={(e) => onClick(e.originalEvent)}
    longitude={longitude}
    latitude={latitude}
    anchor="bottom"
  >
    <span className={b('marker', { loading: isLoading, primary })}>
      <span className={b('marker-text')}>{hawManyPeopleCanHost}</span>
      <img
        className={b('marker-img')}
        src={
          // prettier-ignore
          (kidsFriendly && petFriendly) ? familyPetChild
          : kidsFriendly ? familyChild
          : petFriendly ? familyPet
          : family
        }
      />
    </span>
  </Marker>
)

export default ShelterMarker
