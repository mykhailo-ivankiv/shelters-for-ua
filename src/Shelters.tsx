import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { polygon, booleanPointInPolygon } from '@turf/turf'
import GeoJSON from 'geojson'
import Layout from './Layout'
import Filter from './Filter'
import ShelterListItem from './ShelterListItem'
import * as React from 'react'
import SheltersMap, { mapId } from './SheltersMap'
import ShelterDetails from './ShelterDetails'
import { useMap } from 'react-map-gl'
import useShelters from './hooks/useShelters'
import SelectedInfoMarker from './SelectedInfoMarker'
import ShelterMarker from './ShelterMarker'

const Shelters = () => {
  const maps = useMap()
  const map = maps[mapId]

  const navigate = useNavigate()
  const { shelterId } = useParams()
  const { data: shelters = [], isLoading: loading } = useShelters()
  const selectedShelter = useMemo(
    () => (shelterId ? shelters.find((s) => s.id === shelterId) : null),
    [shelters, shelterId],
  )

  const [filters, setFilters] = useState({
    onlyPetFriendly: false,
    onlyKidsFriendly: false,
    numberOfPeople: '',
  })

  const [bounds, setBounds] = useState<any>(null)

  const filteredShelters = useMemo(
    () =>
      shelters
        .filter((shelter) => (filters.onlyPetFriendly === false ? true : shelter.petFriendly))
        .filter((shelter) => (filters.onlyKidsFriendly === false ? true : shelter.kidsFriendly))
        .filter((shelter) =>
          !filters.numberOfPeople ? true : Number(shelter.hawManyPeopleCanHost) >= Number(filters.numberOfPeople),
        ),
    [shelters, filters],
  )

  const sheltersForView = useMemo(() => {
    if (!bounds) return []

    const boundsGeometry = polygon([
      [
        [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
        [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
        [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
        [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
        [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
      ],
    ])

    const result = []

    for (const shelter of filteredShelters) {
      if (booleanPointInPolygon([shelter.longitude, shelter.latitude], boundsGeometry)) {
        result.push(shelter)
        if (result.length === 10) return result
      }
    }

    return result
  }, [filteredShelters, bounds])

  const sheltersGeoJSON = useMemo(() => {
    // @ts-ignore
    return GeoJSON.parse(filteredShelters, { Point: ['latitude', 'longitude'] })
  }, [filteredShelters])

  return (
    <Layout
      isLoading={loading}
      sidebar={
        <>
          <Filter filters={filters} onFiltersChange={setFilters} />
          <div>
            {selectedShelter ? (
              <div style={{ padding: '0.5em 1em' }}>
                <div
                  style={{
                    display: 'flex',
                    padding: '3px 0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Link to="/">&lt; back to list</Link>
                  <button
                    onClick={() => {
                      map.flyTo({ center: [selectedShelter.longitude, selectedShelter.latitude], speed: 0.5 })
                    }}
                  >
                    center ⌖
                  </button>
                </div>
                <ShelterDetails shelterId={selectedShelter.id} />
              </div>
            ) : (
              <>
                {sheltersForView.map((shelter) => (
                  <ShelterListItem key={shelter.id} shelter={shelter} isSelected={shelter.id === selectedShelter?.id} />
                ))}
              </>
            )}
          </div>
        </>
      }
      main={({ isSidebarOpen }) => (
        <SheltersMap
          onSelect={(id: string | null) => (id ? navigate(`/${id}`) : navigate('/'))}
          selectedShelter={selectedShelter}
          geoJSON={sheltersGeoJSON}
          onBoundsChange={setBounds}
        >
          {isSidebarOpen &&
            sheltersForView.map((shelter) => (
              <ShelterMarker
                onClick={(ev) => {
                  ev.stopPropagation()
                  navigate(`/${shelter.id}`)
                }}
                primary={false}
                isLoading={false}
                key={shelter.id}
                hawManyPeopleCanHost={shelter.hawManyPeopleCanHost}
                kidsFriendly={shelter.kidsFriendly}
                petFriendly={shelter.petFriendly}
                longitude={shelter.longitude}
                latitude={shelter.latitude}
              />
            ))}

          {selectedShelter && <SelectedInfoMarker />}
        </SheltersMap>
      )}
    />
  )
}

export default Shelters
