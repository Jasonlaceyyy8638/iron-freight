/**
 * Common footer for all IronFreight transactional emails.
 */

import { EMAIL } from './constants'

export function getEmailFooterHtml(): string {
  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 40px; padding-top: 32px; border-top: 1px solid ${EMAIL.BORDER};">
  <tr>
    <td style="color: ${EMAIL.TEXT_MUTED}; font-size: 11px; line-height: 1.6;">
      <strong style="color: ${EMAIL.TEXT};">IronFreight</strong> | The ironclad shield against double brokering, fraud, and load theft—with verified chain of custody, identity verification, and geofenced pickup and delivery.
      <br><br>
      © ${new Date().getFullYear()} IronFreight. All Rights Reserved.
      <br>
      Contact: <a href="mailto:Support@getironfreight.com" style="color: ${EMAIL.BRAND}; text-decoration: none;">Support@getironfreight.com</a>
      <br>
      <em>This is a secure transmission. If you are not the intended recipient, please notify <a href="mailto:Verify@getironfreight.com" style="color: ${EMAIL.BRAND}; text-decoration: none;">Verify@getironfreight.com</a> immediately.</em>
    </td>
  </tr>
</table>
`.trim()
}

export function getEmailFooterText(): string {
  return `
IronFreight | The ironclad shield against double brokering, fraud, and load theft—with verified chain of custody, identity verification, and geofenced pickup and delivery.
© ${new Date().getFullYear()} IronFreight. All Rights Reserved.
Contact: Support@getironfreight.com
This is a secure transmission. If you are not the intended recipient, please notify Verify@getironfreight.com immediately.
`.trim()
}
