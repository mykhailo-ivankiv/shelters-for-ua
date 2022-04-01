// @ts-nocheck
/* eslint-disable */
import { Layer, Source, useMap } from 'react-map-gl'
import * as React from 'react'
import { useEffect } from 'react'
import cluster from './icons/cluster.png'
import family from './icons/family.png'
import familyChild from './icons/family-child.png'
import familyPet from './icons/family-pet.png'
import familyPetChild from './icons/family-pet-child.png'
import { useAsync } from 'react-use'

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

const SheltersLayers = ({ geoJSON, onSelect }) => {
  const { current: map } = useMap()

  const { loading } = useAsync(() =>
    Promise.all([
      loadImage(cluster, 'cluster', map),

      loadImage(family, 'family', map),
      loadImage(familyChild, 'family-child', map),
      loadImage(familyPet, 'family-pet', map),
      loadImage(familyPetChild, 'family-pet-child', map),
    ]),
  )

  useEffect(() => {
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      })
      const clusterId = features[0].properties.cluster_id

      map
        .getSource('shelters')
        // @ts-ignore
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return

          map.easeTo({
            // @ts-ignore
            center: features[0].geometry.coordinates,
            zoom: zoom,
          })
        })

      map.on('mouseenter', 'clusters', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'clusters', () => (map.getCanvas().style.cursor = ''))

      map.on('mouseenter', 'unclustered-point', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'unclustered-point', () => (map.getCanvas().style.cursor = ''))
    })

    map.on('click', 'unclustered-point', (e) => {
      onSelect(e.features[0].properties.id)
    })
  }, [])

  if (loading) return null

  return (
    <Source id="shelters" type="geojson" data={geoJSON} cluster={true}>
      <Layer
        id="clusters"
        type="symbol"
        source="shelters"
        filter={['has', 'point_count']}
        layout={{
          'icon-image': 'cluster',
          'icon-anchor': 'left',
          'icon-offset': [-37, 5],
          'icon-size': 0.5,

          // 'text-anchor': 'right',
          'text-justify': 'left',
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
          'text-font': ['Roboto Bold'],
        }}
      />
      <Layer
        id="unclustered-point"
        type="symbol"
        source="shelters"
        filter={['!', ['has', 'point_count']]}
        layout={{
          // prettier-ignore
          'icon-image': [
            "case",
            ["all", ["==", ["get", "kidsFriendly"], true], ["==", ["get", "petFriendly"], true]], "family-pet-child",
            ["==", ["get", "kidsFriendly"], true], 'family-child',
            ["==", ["get", "petFriendly"], true], 'family-pet',
            "family"
          ],
          'icon-anchor': 'left',
          'icon-offset': [-25, 4],
          'icon-size': 0.5,

          'text-anchor': 'left',
          'text-field': '{hawManyPeopleCanHost}',
          'text-font': ['Roboto Bold'],
          'text-size': 12,
        }}
      />
    </Source>
  )
}

export default SheltersLayers
