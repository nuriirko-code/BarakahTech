import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isMinorOnDate } from '../../utils/legalAge'

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10'

const AccountPolicyFields = ({ values, onChange, requireAdult = false, fieldErrors = {} }) => {
  const { t } = useTranslation()
  const isMinor = isMinorOnDate(values.dateOfBirth)

  return (
    <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <legend className="px-2 font-bold text-slate-900">{t('legal.accountAgreements')}</legend>
      <label className="block text-sm font-medium text-slate-800">
        {t('legal.dateOfBirth')}
        <input
          required
          type="date"
          value={values.dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(event) => onChange('dateOfBirth', event.target.value)}
          className={fieldClass}
          autoComplete="bday"
        />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
        <input
          required
          type="checkbox"
          checked={values.acceptedTerms}
          onChange={(event) => onChange('acceptedTerms', event.target.checked)}
          className="mt-1 accent-green-700"
        />
        <span>
            {t('legal.agreeTo')}{' '}
            <Link className="font-bold text-green-800 underline" to="/policies/terms">{t('footer.terms')}</Link> {t('legal.and')}{' '}
            <Link className="font-bold text-green-800 underline" to="/policies/community-code">{t('footer.communityCode')}</Link>.
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
        <input
          required
          type="checkbox"
          checked={values.acknowledgedPrivacy}
          onChange={(event) => onChange('acknowledgedPrivacy', event.target.checked)}
          className="mt-1 accent-green-700"
        />
        <span>
            {t('legal.acknowledgePrivacy')}{' '}
            <Link className="font-bold text-green-800 underline" to="/policies/privacy">{t('footer.privacy')}</Link>.
          </span>
      </label>
      {isMinor && requireAdult && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            {t('legal.adultOnly')}
          </p>
      )}
      {isMinor && !requireAdult && (
          <div className="space-y-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm leading-6 text-amber-950">
              {t('legal.guardianInstructions')}
            </p>
            <label className="block text-sm font-medium text-slate-800">
              {t('legal.guardianName')}
            <input
              required
              value={values.guardianName}
              onChange={(event) => onChange('guardianName', event.target.value)}
              className={fieldClass}
              autoComplete="name"
              maxLength={80}
            />
            {fieldErrors.guardianName && <span role="alert" className="block text-sm font-medium text-red-700">{fieldErrors.guardianName}</span>}
          </label>
          <label className="block text-sm font-medium text-slate-800">
            {t('legal.guardianEmail')}
            <input
              required
              type="email"
              value={values.guardianEmail}
              onChange={(event) => onChange('guardianEmail', event.target.value)}
              className={fieldClass}
              autoComplete="email"
            />
            {fieldErrors.guardianEmail && <span role="alert" className="block text-sm font-medium text-red-700">{fieldErrors.guardianEmail}</span>}
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-800">
            <input
              required
              type="checkbox"
              checked={values.guardianConsent}
              onChange={(event) => onChange('guardianConsent', event.target.checked)}
              className="mt-1 accent-amber-700"
            />
            <span>
              {t('legal.guardianDeclaration')}
            </span>
          </label>
        </div>
      )}
    </fieldset>
  )
}

export default AccountPolicyFields
