// @ts-nocheck
/* eslint-disable */
import * as React from 'react'
import BEM from './helpers/BEM'
import './ShelterDetails.css'

const b = BEM('ShelterDetails')

const ShelterDetails = ({ shelter }) => (
  <section className={b()}>
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
      <dd>{shelter.petFriendly ? 'Yes' : 'No'}</dd>

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

export default ShelterDetails
