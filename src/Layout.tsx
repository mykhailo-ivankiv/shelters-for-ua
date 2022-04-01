import * as React from 'react'
import { useToggle } from 'react-use'
import { useEffect } from 'react'
import { useMap } from 'react-map-gl'
import { mapId } from './SheltersMap'
import './Layout.css'
import BEM from './helpers/BEM'

const b = BEM('Layout')

const Layout = ({ sidebar, main, isLoading }) => (
  <div className={b()}>
    {isLoading ? (
      <div className={b('loader')}>Loading...</div>
    ) : (
      <>
        <div className={b('sidebar')}>{sidebar}</div>
        <div className={b('main')}>{main}</div>
      </>
    )}
  </div>
)

export default Layout
