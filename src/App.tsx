import { Routes, Route, HashRouter } from 'react-router-dom'
import './App.css'
import BEM from './helpers/BEM'
import 'antd/dist/antd.css'
import Shelters from './Shelters'

const b = BEM('App')

const App = () => {
  return (
    <HashRouter>
      <section className={b()}>
        <Routes>
          <Route path="/">
            <Route path="/:storageId" element={<Shelters />} />
            <Route path="" element={<Shelters />} />
          </Route>
        </Routes>
      </section>
    </HashRouter>
  )
}

export default App
