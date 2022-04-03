import * as React from 'react'
import BEM from './helpers/BEM'
import './ShelterDetails.css'
import useShelterInfo from './hooks/useShelterInfo'

const b = BEM('ShelterDetails')

const ShelterDetails = ({ shelterId }) => {
  const { isIdle, isLoading, isError, error, data: shelterInfo } = useShelterInfo(shelterId)

  if (isIdle) return null

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <section className={b()}>
      <h3>
        📍 {shelterInfo.city}, {shelterInfo.country}
      </h3>
      <dl className={b('list')}>
        <dt>👤 name:</dt>
        <dd>
          {shelterInfo.firstName} {shelterInfo.lastName}
        </dd>

        <dt>👨‍👩‍👧 can host:</dt>
        <dd>{shelterInfo.hawManyPeopleCanHost}</dd>

        <dt>🐶 pets:</dt>
        <dd>{shelterInfo.petFriendly ? 'Yes' : 'No'}</dd>

        <dt>👶 kids:</dt>
        <dd>{shelterInfo.kidsFriendly ? 'Yes' : 'No'}</dd>
      </dl>
      <dl>
        {shelterInfo.contactDetails && (
          <>
            <dt>📞 contact:</dt>
            <dd style={{ marginLeft: '5ch' }}>{shelterInfo.contactDetails}</dd>
          </>
        )}
        <dt>✉️ email:</dt>
        <dd style={{ marginLeft: '5ch' }}>
          <a href={`mailto:${shelterInfo.email}`}>{shelterInfo.email}</a>
        </dd>
      </dl>
      {shelterInfo.message && (
        <>
          <h3>Message</h3>
          <p className={b('paragraph')}>{shelterInfo.message}</p>
        </>
      )}
      {shelterInfo.personDetails && (
        <>
          <h3>Person Details</h3>
          <p className={b('paragraph')}>{shelterInfo.personDetails}</p>
        </>
      )}
      {shelterInfo.helpWith && (
        <>
          <h3>Help with</h3>
          <p className={b('paragraph')}>{shelterInfo.helpWith}</p>
        </>
      )}
    </section>
  )
}

export default ShelterDetails
