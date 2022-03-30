import * as React from 'react'
import './Layout.css'
import BEM from './helpers/BEM'

const b = BEM('Layout')

const Layout = ({ sidebar, main, isLoading }) => {
  return (
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
}

export default Layout
