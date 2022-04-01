import { Routes, Route, HashRouter } from 'react-router-dom'
import './App.css'
import BEM from './helpers/BEM'
import 'antd/dist/antd.css'
import Shelters from './Shelters'
import { MapProvider } from 'react-map-gl'

const b = BEM('App')

const App = () => {
  return (
    <HashRouter>
      <section className={b()}>
        <MapProvider>
          <Routes>
            <Route path="/">
              <Route path="/:shelterId" element={<Shelters />} />
              <Route path="" element={<Shelters />} />
            </Route>
          </Routes>
        </MapProvider>
      </section>
    </HashRouter>
  )
}

export default App
