import { useNavigate, useParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useAsync } from 'react-use'
import { polygon, booleanPointInPolygon } from '@turf/turf'
import GeoJSON from 'geojson'
import Layout from './Layout'
import Filter from './Filter'
import ShelterListItem from './ShelterListItem'
import * as React from 'react'
import SheltersMap from './SheltersMap'

const Shelters = () => {
  const navigate = useNavigate()
  const { shelterId } = useParams()

  const [filters, setFilters] = useState({
    onlyPetFriendly: false,
    onlyKidsFriendly: false,
    numberOfPeople: '',
  })

  const [bounds, setBounds] = useState<any>(null)

  const { value: shelters = [], loading } = useAsync(async () => {
    const docs = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters-partial`)
    return await docs.json()
  }, [])

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
        if (result.length === 20) return result
      }
    }

    return result
  }, [filteredShelters, bounds])

  const sheltersGeoJSON = useMemo(() => {
    // @ts-ignore
    return GeoJSON.parse(filteredShelters, { Point: ['latitude', 'longitude'] })
  }, [filteredShelters])

  const selectedShelter = useMemo(() => {
    return shelters.find((s) => s.id === shelterId)
  }, [shelters, shelterId])

  // @ts-ignore
  return (
    <Layout
      isLoading={loading}
      sidebar={
        <>
          <Filter filters={filters} onFiltersChange={setFilters} />

          <div style={{ marginTop: '1.5em' }}>
            <label style={{ padding: '1em' }}>
              <input type="checkbox" /> sync with map
            </label>

            {sheltersForView.map((shelter) => (
              <ShelterListItem shelter={shelter} isSelected={shelter.id === selectedShelter?.id} />
            ))}
          </div>
        </>
      }
      main={
        <SheltersMap
          onSelect={(id: string | null) => (id ? navigate(`/${id}`) : navigate('/'))}
          selectedShelter={selectedShelter}
          geoJSON={sheltersGeoJSON}
          onBoundsChange={setBounds}
        />
      }
    />
  )
}

export default Shelters
