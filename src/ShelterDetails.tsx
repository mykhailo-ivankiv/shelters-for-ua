// @ts-nocheck
/* eslint-disable */
import * as React from 'react'
import { useAsync } from 'react-use'
import './Shelters.css'
import BEM from './helpers/BEM'

const b = BEM('Shelters')

const ShelterDetails = ({ shelterId }) => {
  const {
    value: shelter,
    loading,
    error,
  } = useAsync<any>(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters/${shelterId}`)

    if (response.status === 200) {
      return response.json()
    } else {
      throw new Error('Error fetching shelter')
    }
  })

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return loading ? (
    <div>Loading...</div>
  ) : (
    <section className={b('popup')}>
      <h3>
        📍 {shelter.city}, {shelter.country}
      </h3>
      <dl className={b('list')}>
        <dt>👤 name:</dt>
        <dd>
          {shelter.firstName} {shelter.lastName}
        </dd>

        <dt>👨‍👩‍👧 can host:</dt>
        <dd>{shelter.hawManyPeopleCanHost}</dd>

        <dt>🐶 pets:</dt>
        <dd>{shelter.petsFriendly ? 'Yes' : 'No'}</dd>

        <dt>👶 kids:</dt>
        <dd>{shelter.kidsFriendly ? 'Yes' : 'No'}</dd>
      </dl>
      <dl>
        <dt>✉️ email:</dt>
        <dd style={{ marginLeft: '5ch' }}>
          <a href={`mailto:${shelter.email}`}>{shelter.email}</a>
        </dd>
      </dl>
      {shelter.helpWidth && <p className={b('paragraph')}>{shelter.message}</p>}
      {shelter.helpWidth && <p className={b('paragraph')}>{shelter.helpWidth}</p>}
      {shelter.personDetails && <p className={b('paragraph')}>{shelter.personDetails}</p>}
    </section>
  )
}

export default ShelterDetails
