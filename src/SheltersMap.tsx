import * as React from 'react'
import Map, { FullscreenControl, GeolocateControl, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import SheltersLayers from './SheltersLayers'
import './SheltersMap.css'

export const mapId = 'sheltersMap'

const SheltersMap = ({ geoJSON, selectedShelter, onSelect, onBoundsChange, children }) => (
  <Map
    id={mapId}
    cooperativeGestures={true}
    trackResize={true}
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
    {children}
  </Map>
)

export default SheltersMap
