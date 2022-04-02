import { Routes, Route, HashRouter } from 'react-router-dom'
import './App.css'
import 'antd/dist/antd.css'
import Shelters from './Shelters'
import { MapProvider } from 'react-map-gl'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <MapProvider>
          <Routes>
            <Route path="/:shelterId" element={<Shelters />} />
            <Route path="" element={<Shelters />} />
          </Routes>
        </MapProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
