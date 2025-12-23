import React from 'react'
import CompanyInfoStep from './setting/CompanyInfoStep'
import FoundingInfoStep from './setting/FoundingInfoStep'
import SocialMediaStep from './setting/SocialMediaStep'
import ContactStep from './setting/ContactStep'
import CompletedStep from './setting/CompletedStep'

const EmployerSettingsForm = () => {
  return (
    <div>
      <CompanyInfoStep/>
      <FoundingInfoStep/>
      <SocialMediaStep/>
      <ContactStep/>
      <CompletedStep/>
    </div>
  )
}

export default EmployerSettingsForm