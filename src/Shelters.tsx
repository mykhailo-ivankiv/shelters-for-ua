import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useMemo, useRef, useEffect } from 'react'
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
import BEM from './helpers/BEM'
import './Shelters.css'
const b = BEM('Shelters')

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

  const [page, setPage] = useState(0)
  const [bounds, setBounds] = useState<any>(null)
  const searchIndexesRef = useRef([])

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

    const searchIndexes = searchIndexesRef.current
    if (searchIndexes[page]) return searchIndexes[page].data

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

    let i = searchIndexes[page - 1] ? searchIndexes[page - 1].index : 0
    for (; i < filteredShelters.length; i++) {
      const shelter = filteredShelters[i]

      if (booleanPointInPolygon([shelter.longitude, shelter.latitude], boundsGeometry)) {
        result.push(shelter)
        if (result.length === 6) {
          searchIndexes.push({ data: result, index: i + 1 })

          return result
        }
      }
    }

    searchIndexes.push({ data: result, index: i })

    return result
  }, [filteredShelters, bounds, page])

  const sheltersGeoJSON = useMemo(() => {
    // @ts-ignore
    return GeoJSON.parse(filteredShelters, { Point: ['latitude', 'longitude'] })
  }, [filteredShelters])

  return (
    <Layout
      isLoading={loading}
      sidebar={
        <>
          <Filter
            filters={filters}
            onFiltersChange={(newFilters) => {
              searchIndexesRef.current = []
              setPage(0)
              setFilters(newFilters)
            }}
          />
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
                <h3
                  style={{
                    padding: '0.5em 1em',
                    fontSize: '1em',
                    margin: 0,
                    fontVariant: 'small-caps',
                    color: '#999',
                  }}
                >
                  shelters in this area
                </h3>

                {sheltersForView.map((shelter) => (
                  <ShelterListItem key={shelter.id} shelter={shelter} isSelected={shelter.id === selectedShelter?.id} />
                ))}
                <div className={b('pagination')}>
                  <button
                    disabled={page === 0}
                    className={b('prev-button')}
                    onClick={() => setPage((page) => page - 1)}
                  >
                    Prev
                  </button>
                  <button
                    disabled={(searchIndexesRef.current[page]?.index ?? 0) >= filteredShelters.length}
                    className={b('next-button')}
                    onClick={() => setPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
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
          onBoundsChange={(bounds) => {
            searchIndexesRef.current = []
            setPage(0)
            setBounds(bounds)
          }}
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
