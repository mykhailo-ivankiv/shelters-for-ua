import * as React from 'react'
import Map, { FullscreenControl, GeolocateControl, NavigationControl, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAsync, useToggle } from 'react-use'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { booleanPointInPolygon, polygon } from '@turf/turf'

import GeoJSON from 'geojson'
import SheltersLayers from './SheltersLayers'
import ShelterDetails from './ShelterDetails'

import './Shelters.css'
import BEM from './helpers/BEM'
import Filter from './Filter'
import ShelterListItem from './ShelterListItem'
import Layout from './Layout'
const b = BEM('Shelters')

const Shelters = ({ geoJSON, selectedShelter, onSelect, onBoundsChange }) => {
  return (
    <Map
      onMoveEnd={({ target: map }) => onBoundsChange(map.getBounds())}
      onLoad={(e) => {
        onBoundsChange(e.target.getBounds())
      }}
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      reuseMaps={true}
      initialViewState={{
        longitude: selectedShelter ? selectedShelter.longitude : 26.17,
        latitude: selectedShelter ? selectedShelter.latitude : 44.38,
        zoom: selectedShelter ? 10 : 4,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <FullscreenControl />
      <NavigationControl />
      <GeolocateControl />

      <SheltersLayers geoJSON={geoJSON} onSelect={onSelect} />

      {selectedShelter && (
        <Popup
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
          onClose={() => onSelect(null)}
        >
          <ShelterDetails key={selectedShelter.id} shelterId={selectedShelter.id} />
        </Popup>
      )}
    </Map>
  )
}

const Comp = () => {
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
            {sheltersForView.map((shelter) => (
              <ShelterListItem shelter={shelter} isSelected={shelter.id === selectedShelter?.id} />
            ))}
          </div>
        </>
      }
      main={
        <>
          <Shelters
            onSelect={(id: string | null) => (id ? navigate(`/${id}`) : navigate('/'))}
            selectedShelter={selectedShelter}
            geoJSON={sheltersGeoJSON}
            onBoundsChange={setBounds}
          />
        </>
      }
    />
  )
}

export default Comp
