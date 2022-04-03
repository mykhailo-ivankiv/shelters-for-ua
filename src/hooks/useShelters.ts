import { useQuery } from 'react-query'
import shuffle from '../helpers/shuffle'
// import { groupBy, map, length, pipe, sort } from 'ramda'
import { Shelter } from '../models'

const useShelters = () =>
  useQuery(['shelters'], async () => {
    const shelters = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters-partial`)
    const data = (await shelters.json()) as Shelter[]

    // console.log(
    //   pipe(
    //     groupBy((shelter: Shelter) => shelter.country),
    //     // @ts-ignore
    //     map(length)
    //   )(data),
    // )

    return shuffle(data)
  })

export default useShelters
