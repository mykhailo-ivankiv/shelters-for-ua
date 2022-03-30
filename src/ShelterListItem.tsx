import { Link } from 'react-router-dom'
import * as React from 'react'
import './ShelterListItem.css'
import BEM from './helpers/BEM'

const b = BEM('ShelterListItem')

const ShelterListItem = ({ shelter, isSelected }) => (
  <Link className={b({ isSelected })} key={shelter.id} to={`/${shelter.id}`}>
    <span className={b('title')}>
      <span className={b('flags')}>
        {shelter.kidsFriendly && '👶 '}
        {shelter.petFriendly && '🐶 '}
      </span>
      {shelter.country}, {shelter.city}
    </span>
    <br />

    <span style={{ maxWidth: '15em', color: 'black' }}>👨‍👩‍👧 {shelter.hawManyPeopleCanHost}</span>
  </Link>
)

export default ShelterListItem
