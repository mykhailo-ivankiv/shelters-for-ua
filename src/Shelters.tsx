// @ts-nocheck
/* eslint-disable */
import { useEffect, useRef, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import { useAsync } from 'react-use'
import GeoJSON from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import './Shelters.css'
import BEM from './helpers/BEM'

import cluster from './icons/cluster.png'
import family from './icons/family.png'
import familyChild from './icons/family-child.png'
import familyPet from './icons/family-pet.png'
import familyPetChild from './icons/family-pet-child.png'
import { useParams, useNavigate } from 'react-router-dom'

const b = BEM('Shelters')

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

const loadImage = (url, name, map) =>
  new Promise((res, rej) => {
    map.loadImage(url, (error, image) => {
      if (error) {
        rej(error)
      } else {
        map.addImage(name, image)
        res(image)
      }
    })
  })

const Shelters = ({ geoJSON, onSelect, selectedShelter }) => {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const popup = useMemo(() => new mapboxgl.Popup({}).on('close', () => onSelect(null)), [])

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: elRef.current,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: selectedShelter
        ? [selectedShelter.longitude, selectedShelter.latitude]
        : [26.17, 44.38],
      zoom: selectedShelter ? 10 : 4,
    })

    mapRef.current = map

    map.on('load', async () => {
      map.addSource('earthquakes', { type: 'geojson', data: geoJSON, cluster: true })

      await Promise.all([
        loadImage(cluster, 'cluster', map),

        loadImage(family, 'family', map),
        loadImage(familyChild, 'family-child', map),
        loadImage(familyPet, 'family-pet', map),
        loadImage(familyPetChild, 'family-pet-child', map),
      ])

      map.addLayer({
        id: 'clusters',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'icon-image': 'cluster',
          'icon-anchor': 'left',
          'icon-offset': [-35, 8],
          'icon-size': 0.5,

          // 'text-anchor': 'right',
          'text-justify': 'left',
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        },
      })

      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        layout: {
          // prettier-ignore
          'icon-image': [
            "case",
              ["all", ["==", ["get", "kidsFriendly"], true], ["==", ["get", "petsFriendly"], true]], "family-pet-child",
              ["==", ["get", "kidsFriendly"], true], 'family-child',
              ["==", ["get", "petsFriendly"], true], 'family-pet',
              "family"
          ],
          'icon-anchor': 'left',
          'icon-offset': [-25, 8],
          'icon-size': 0.5,

          'text-anchor': 'left',
          'text-field': '{hawManyPeopleCanHost}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      })

      // inspect a cluster on click
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })
        const clusterId = features[0].properties.cluster_id
        map.getSource('earthquakes').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          })
        })
      })

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      map.on('click', 'unclustered-point', (e) => {
        onSelect(e.features[0].properties.id)
      })

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = ''
      })
    })
  }, [])

  useEffect(() => {
    if (!selectedShelter || !mapRef.current) return

    popup
      .setOffset({
        top: [3, 18],
        'top-left': [3, 18],
        'top-right': [3, 18],
        bottom: [3, -18],
        'bottom-left': [3, -18],
        'bottom-right': [3, -18],
        right: [-15, 0],
        left: [
          // prettier-ignore
          (selectedShelter.petsFriendly && selectedShelter.kidsFriendly) ? 75
            : (selectedShelter.petsFriendly || selectedShelter.kidsFriendly) ? 65
              : 50,
          0,
        ],
      })
      .setLngLat([selectedShelter.longitude, selectedShelter.latitude])
      .setHTML(
        `
          <section class="${b('popup')}">
            <h3>${selectedShelter.city}, ${selectedShelter.country}</h3>
            <dl class="${b('list')}">
              <dt>👨‍👩‍👧 can host:</dt>
              <dd>${selectedShelter.hawManyPeopleCanHost}</dd>
              
              <dt>🐶 pets:</dt>
              <dd>${selectedShelter.petsFriendly ? 'Yes' : 'No'}</dd>
              
              <dt>👶 kids:</dt>
              <dd>${selectedShelter.kidsFriendly ? 'Yes' : 'No'}</dd>
            </dl>
            
            <dl>              
              <dt>✉️ email:</dt>
              <dd style="margin-left: 5ch;">${selectedShelter.email}</dd>
            </dl>
            <p>${selectedShelter.details}</p>
          </section>
        `,
      )
      .addTo(mapRef.current)

    // return () => popup.close()
  }, [selectedShelter])

  return (
    <div
      ref={elRef}
      className={b()}
      style={{ position: 'absolute', top: 0, bottom: 0, width: '100vw', height: '100vh' }}
    />
  )
}

const Comp = () => {
  const navigate = useNavigate()
  const { shelterId } = useParams()

  const { value: shelters = [], loading } = useAsync(async () => {
    const docs = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters`)
    return await docs.json()
  }, [])

  const sheltersGeoJSON = useMemo(() => {
    return GeoJSON.parse(shelters, { Point: ['latitude', 'longitude'] })
  }, [shelters])

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
        transform: 'translate(-50,-50)',
      }}
    >
      Loading...
    </div>
  ) : (
    <Shelters
      onSelect={(id: string | null) => (id ? navigate(`/${id}`) : navigate('/'))}
      selectedShelter={selectedShelter}
      geoJSON={sheltersGeoJSON}
    />
  )
}
export default Comp
