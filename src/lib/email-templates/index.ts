/**
 * IronFreight professional email templates – Security-First design.
 * Dark slate backgrounds, #C1FF00 (Neon Lime) CTAs, IronFreight Shield header.
 */

export { EMAIL, SHIELD_ICON_SVG } from './constants'
export { getEmailFooterHtml, getEmailFooterText } from './footer'
export { buildEmailLayout } from './layout'
export type { EmailLayoutParams } from './layout'

export {
  buildInternalInviteEmail,
  INTERNAL_INVITE_SUBJECT,
} from './internal-invite'

export {
  buildCarrierInviteEmail,
  getCarrierInviteSubject,
} from './carrier-invite'

export {
  buildBrokerInviteEmail,
  getBrokerInviteSubject,
} from './broker-invite'

export {
  buildShipperInviteEmail,
  getShipperInviteSubject,
} from './shipper-invite'

export { buildQuoteEmail, type QuoteRole } from './quote'
