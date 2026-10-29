export function eligibleFaculty(identity, directoryUser, exactOU) {
 return !!identity && !!directoryUser && !identity.disabled && identity.emailVerified === true
  && identity.email?.endsWith('@markdayschool.org')
  && identity.providerData?.some(p=>p.providerId==='google.com') === true
  && !directoryUser.suspended && !directoryUser.archived
  && directoryUser.primaryEmail?.toLowerCase() === identity.email.toLowerCase()
  && typeof exactOU === 'string' && exactOU.startsWith('/') && exactOU !== '/'
  && directoryUser.orgUnitPath === exactOU;
}
