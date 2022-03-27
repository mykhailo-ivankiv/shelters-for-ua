import * as React from 'react'
import Map, { FullscreenControl, GeolocateControl, NavigationControl, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAsync, useToggle } from 'react-use'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GeoJSON from 'geojson'
import SheltersLayers from './SheltersLayers'
import ShelterDetails from './ShelterDetails'

const Shelters = ({ geoJSON, selectedShelter, onSelect }) => {
  return (
    <Map
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      reuseMaps={true}
      initialViewState={{
        longitude: selectedShelter ? selectedShelter.longitude : 26.17,
        latitude: selectedShelter ? selectedShelter.latitude : 44.38,
        zoom: selectedShelter ? 10 : 4,
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <FullscreenControl />
      <NavigationControl />
      <GeolocateControl />

      <SheltersLayers  geoJSON={geoJSON} onSelect={onSelect} />

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
          <ShelterDetails shelterId={selectedShelter.id} />
        </Popup>
      )}
    </Map>
  )
}

const Comp = () => {
  const navigate = useNavigate()
  const { shelterId } = useParams()

  const [onlyPetFriendly, toggleOnlyPetFriendly] = useToggle(false)
  const [onlyKidsFriendly, toggleOnlyKidsFriendly] = useToggle(false)

  const { value: shelters = [], loading } = useAsync(async () => {
    const docs = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters-partial`)
    return await docs.json()
  }, [])

  const filteredShelters = useMemo(() => {
    return shelters
      .filter((shelter) => (onlyPetFriendly === false ? true : shelter.petFriendly))
      .filter((shelter) => (onlyKidsFriendly === false ? true : shelter.kidsFriendly))
  }, [shelters, onlyPetFriendly, onlyKidsFriendly])

  const sheltersGeoJSON = useMemo(() => {
    // @ts-ignore
    return GeoJSON.parse(filteredShelters, { Point: ['latitude', 'longitude'] })
  }, [filteredShelters])

  const selectedShelter = useMemo(() => {
    return shelters.find((s) => s.id === shelterId)
  }, [shelters, shelterId])

  return loading ? (
    <div
      style={{
        fontFamily: 'PT Sans',
        fontSize: '1.5em',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%,-50%)',
      }}
    >
      Loading...
    </div>
  ) : (
    <>
      <Shelters
        onSelect={(id: string | null) => (id ? navigate(`/${id}`) : navigate('/'))}
        selectedShelter={selectedShelter}
        geoJSON={sheltersGeoJSON}
      />
      <div
        style={{
          position: 'absolute',
          zIndex: 3,
          background: 'white',
          top: '1em',
          left: '1em',
          padding: '1em',
        }}
      >
        <label style={{ display: 'block' }}>
          <input type="checkbox" checked={onlyPetFriendly} onChange={toggleOnlyPetFriendly} /> <span>Pet friendly</span>
        </label>

        <label style={{ display: 'block' }}>
          <input type="checkbox" checked={onlyKidsFriendly} onChange={toggleOnlyKidsFriendly} />{' '}
          <span>Kids friendly</span>
        </label>
      </div>
    </>
  )
}

export default Comp
