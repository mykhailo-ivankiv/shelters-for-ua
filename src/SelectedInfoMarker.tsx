import { Popup } from 'react-map-gl'
import ShelterDetails from './ShelterDetails'
import * as React from 'react'
import useShelterInfo from './hooks/useShelterInfo'
import { useContext, useMemo } from 'react'
import { LayoutContext } from './Layout'
import { useParams, useNavigate } from 'react-router-dom'
import useShelters from './hooks/useShelters'
import './SheltersMap.css'
import BEM from './helpers/BEM'
import ShelterMarker from './ShelterMarker'
import ShelterShortDetails from './ShelterShortDetails'

const b = BEM('SheltersMap')
const SelectedInfoMarker = () => {
  const navigate = useNavigate()

  const { data: shelters = [] } = useShelters()

  const { shelterId } = useParams()
  const selectedShelterInfo = useShelterInfo(shelterId)
  const { isSidebarOpen } = useContext(LayoutContext)

  const selectedShelter = useMemo(
    () => (shelterId ? shelters.find((s) => s.id === shelterId) : null),
    [shelters, shelterId],
  )

  if (!shelterId) return null

  return (
    <>
      <ShelterMarker
        primary={true}
        onClick={(ev) => {
          ev.stopPropagation()
          navigate(`/${shelterId}`)
        }}
        longitude={selectedShelter.longitude}
        latitude={selectedShelter.latitude}
        isLoading={selectedShelterInfo.isLoading}
        hawManyPeopleCanHost={selectedShelter.hawManyPeopleCanHost}
        kidsFriendly={selectedShelter.kidsFriendly}
        petFriendly={selectedShelter.petFriendly}
      />

      {!selectedShelterInfo.isLoading && selectedShelterInfo.data && (
        <Popup
          className={b('popup')}
          closeButton={false}
          closeOnClick={false}
          closeOnMove={false}
          key={selectedShelter?.id}
          offset={{
            top: [3, 18],
            'top-left': [3, 18],
            'top-right': [3, 18],
            bottom: [3, -18],
            'bottom-left': [3, -18],
            'bottom-right': [3, -18],
            right: [-15, 0],
            left: [
              // prettier-ignore
              (selectedShelter.petFriendly && selectedShelter.kidsFriendly) ? 75
                : (selectedShelter.petFriendly || selectedShelter.kidsFriendly) ? 65
                  : 50,
              0,
            ],
          }}
          longitude={selectedShelter.longitude}
          latitude={selectedShelter.latitude}
        >
          <button className={b('close-button')} onClick={() => navigate('/')}>
            ✕
          </button>
          {selectedShelterInfo.isError && (
            <div className={b('error')}>
              <span>{selectedShelterInfo.error?.message}</span>
            </div>
          )}

          {!selectedShelterInfo.isError &&
            (isSidebarOpen ? (
              <ShelterShortDetails shelterId={selectedShelter.id} />
            ) : (
              <ShelterDetails shelterId={selectedShelter.id} />
            ))}
        </Popup>
      )}
    </>
  )
}

export default SelectedInfoMarker
