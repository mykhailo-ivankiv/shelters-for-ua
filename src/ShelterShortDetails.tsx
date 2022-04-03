import * as React from 'react'
import BEM from './helpers/BEM'
import './ShelterDetails.css'
import useShelterInfo from './hooks/useShelterInfo'

const b = BEM('ShelterDetails')

const ShelterShortDetails = ({ shelterId }) => {
  const { isIdle, isLoading, isError, error, data: shelterInfo } = useShelterInfo(shelterId)

  if (isIdle) return null

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <section className={b({ compact: true })}>
      <h3>
        📍 {shelterInfo.city}, {shelterInfo.country}
      </h3>
      <dl className={b('list')}>
        <dt>👤 name:</dt>
        <dd>
          {shelterInfo.firstName} {shelterInfo.lastName}
        </dd>
        {shelterInfo.contactDetails && (
          <>
            <dt>📞 contact:</dt>
            <dd>{shelterInfo.contactDetails}</dd>
          </>
        )}
      </dl>
      <dl>
        <dt>✉️ email:</dt>
        <dd style={{ marginLeft: '4ch' }}>
          <a href={`mailto:${shelterInfo.email}`}>{shelterInfo.email}</a>
        </dd>
      </dl>
    </section>
  )
}

export default ShelterShortDetails
