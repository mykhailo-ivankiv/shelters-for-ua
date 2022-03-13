// @ts-nocheck
/* eslint-disable */
import { useEffect, useRef, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import { useAsync } from 'react-use'
import GeoJSON from 'geojson'

import cluster from './icons/cluster.png'
import family from './icons/family.png'
import familyChild from './icons/family-child.png'
import familyPet from './icons/family-pet.png'
import familyPetChild from './icons/family-pet-child.png'
import person from './icons/person.png'
import personChild from './icons/person-child.png'
import personPet from './icons/person-pet.png'
import personPetChild from './icons/person-pet-child.png'

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

const Shelters = ({ geoJSON }) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: elRef.current,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-103.5917, 40.6699],
      zoom: 3,
    })

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
        const coordinates = e.features[0].geometry.coordinates.slice()
        const mag = e.features[0].properties.mag
        const tsunami = e.features[0].properties.tsunami === 1 ? 'yes' : 'no'

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
          .addTo(map)
      })

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = ''
      })
    })
  }, [])
  const elRef = useRef(null)
  return <div ref={elRef} style={{ position: 'absolute', top: 0, bottom: 0, width: '100vw', height: '100vh' }} />
}

const Comp = () => {
  const { value: shelters = [], loading } = useAsync(async () => {
    const docs = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters`)
    return await docs.json()
  }, [])

  const sheltersGeoJSON = useMemo(() => {
    return GeoJSON.parse(shelters, { Point: ['latitude', 'longitude'] })
  }, [shelters])

  return loading ? <>Loading...</> : <Shelters geoJSON={sheltersGeoJSON} />
}
export default Comp
