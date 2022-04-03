import * as React from 'react'
import { useToggle } from 'react-use'
import { useEffect } from 'react'
import { useMap } from 'react-map-gl'
import { mapId } from './SheltersMap'
import './Layout.css'
import BEM from './helpers/BEM'
const b = BEM('Layout')

export const LayoutContext = React.createContext<{ isSidebarOpen: boolean }>({ isSidebarOpen: true })

const Layout = ({ sidebar, main, isLoading }) => {
  const maps = useMap()
  const [isSidebarOpen, toggleSidebar] = useToggle(true)

  useEffect(() => {
    const map = maps[mapId]

    map?.resize()
  }, [isSidebarOpen])

  return (
    <LayoutContext.Provider value={{ isSidebarOpen }}>
      <div className={b({ closeSidebar: !isSidebarOpen })}>
        {isLoading ? (
          <div className={b('loader')}>Loading...</div>
        ) : (
          <>
            <button onClick={toggleSidebar} className={b('toggle-button')}>
              <span className={b('toggle-button-text')}>⌝</span>
            </button>

            <div className={b('sidebar')}>{typeof sidebar === 'function' ? sidebar({ isSidebarOpen }) : sidebar}</div>
            <div className={b('main')}>{typeof main === 'function' ? main({ isSidebarOpen }) : main}</div>
          </>
        )}
      </div>
    </LayoutContext.Provider>
  )
}

export default Layout
