import * as React from 'react'
import { useToggle } from 'react-use'
import { useEffect } from 'react'
import { useMap } from 'react-map-gl'
import { mapId } from './SheltersMap'
import './Layout.css'
import BEM from './helpers/BEM'
const b = BEM('Layout')

export const LayoutContext = React.createContext<'sidebar-open' | 'sidebar-closed'>('sidebar-open')

const Layout = ({ sidebar, main, isLoading }) => {
  const maps = useMap()
  const [isSidebarOpen, toggleSidebar] = useToggle(true)

  useEffect(() => {
    const map = maps[mapId]

    map?.resize()
  }, [isSidebarOpen])

  return (
    <LayoutContext.Provider value={isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}>
      <div className={b({ closeSidebar: !isSidebarOpen })}>
        {isLoading ? (
          <div className={b('loader')}>Loading...</div>
        ) : (
          <>
            <button onClick={toggleSidebar} className={b('toggle-button')}>
              <span className={b('toggle-button-text')}>⌝</span>
            </button>

            <div className={b('sidebar')}>{sidebar}</div>
            <div className={b('main')}>{main}</div>
          </>
        )}
      </div>
    </LayoutContext.Provider>
  )
}

export default Layout
