import { useQuery } from 'react-query'
import { ShelterInfo } from '../models'

const useShelterInfo = (id: string) =>
  useQuery<ShelterInfo, Error>(
    ['shelters', id],
    async () => {
      const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters/${id}`)

      if (response.status !== 200) throw new Error('Error fetching shelter')

      return response.json()
    },
    {
      enabled: Boolean(id),
    },
  )

export default useShelterInfo
