const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService')
const policyVersions = require('../config/policyVersions')
const { getAge } = require('../utils/legalAge')
const {
  getPersonNameError,
  isValidEmail,
  normalizeEmail,
  normalizePersonName,
} = require('../utils/registrationValidation')

// A JWT is a signed snapshot of the account details middleware needs on every
// protected request. Including isLiveTutor lets authorization decide whether a
// user has live-tutoring access without running another database query first.
const generateToken = (userId, role, isLiveTutor = false) => {
  return jwt.sign(
    {
      userId,
      role,
      isLiveTutor,
    },
    process.env.JWT_SECRET,
    // Existing installations use a seven-day token lifetime. JWT_EXPIRE can
    // override it later without making the current configuration invalid.
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

const registerUser = async (req, res) => {
  try {
    const {
      name: submittedName,
      email: submittedEmail,
      password,
      role,
      dateOfBirth: submittedDateOfBirth,
      acceptedTermsVersion,
      acknowledgedPrivacyVersion,
      acceptedCommunityCodeVersion,
      guardianConsent,
    } = req.body || {}

    const name = normalizePersonName(submittedName)
    const email = normalizeEmail(submittedEmail)

    if (!name || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({
        message: 'Please provide name, email and password'
      })
    }

    const nameError = getPersonNameError(name)
    if (nameError) {
      return res.status(400).json({
        message: 'Enter a valid name with at least 3 letters and no more than 80 characters.'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    if (
      acceptedTermsVersion !== policyVersions.terms ||
      acknowledgedPrivacyVersion !== policyVersions.privacy ||
      acceptedCommunityCodeVersion !== policyVersions.community
    ) {
      return res.status(400).json({ message: 'Please review and accept the current Terms of Service and Community Code and acknowledge the Privacy Policy.' })
    }

    const dateIsValid = typeof submittedDateOfBirth === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(submittedDateOfBirth)
    const dateOfBirth = dateIsValid
      ? new Date(`${submittedDateOfBirth}T00:00:00.000Z`)
      : new Date(Number.NaN)
    if (
      Number.isNaN(dateOfBirth.getTime())
      || dateOfBirth.toISOString().slice(0, 10) !== submittedDateOfBirth
      || dateOfBirth >= new Date()
    ) {
      return res.status(400).json({ message: 'A valid date of birth is required.' })
    }
    const age = getAge(dateOfBirth)
    if (age === null || age < 0 || age > 120) {
      return res.status(400).json({ message: 'Enter a valid date of birth.' })
    }

    const safeRole = role === 'teacher' ? 'pending_teacher' : 'student'
    if (safeRole === 'pending_teacher' && age < 18) {
      return res.status(400).json({ message: 'Teacher and live tutor applicants must be at least 18 years old.' })
    }

    let normalizedGuardianConsent = null
    if (age < 18) {
      const guardianName = normalizePersonName(guardianConsent?.guardianName)
      const guardianEmail = normalizeEmail(guardianConsent?.guardianEmail)
      if (
        guardianConsent?.confirmed !== true
        || getPersonNameError(guardianName)
        || !isValidEmail(guardianEmail)
      ) {
        return res.status(400).json({ message: 'A parent or legal guardian must provide their name and email and confirm the guardian declaration.' })
      }
      normalizedGuardianConsent = {
        guardianName,
        guardianEmail,
        version: policyVersions.terms,
        consentedAt: new Date(),
        method: 'guardian_self_attestation',
      }
    }

    // 2. Check if email already registered
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists'
      })
    }

    // 3. Determine safe role
    // Never trust role from frontend directly
    // Only allow student or pending_teacher from registration
    // 4. Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 5. Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: safeRole,
      dateOfBirth,
      policyAcceptances: [
        { policy: 'terms', version: policyVersions.terms, acceptedAt: new Date() },
        { policy: 'privacy', version: policyVersions.privacy, acceptedAt: new Date() },
        { policy: 'community', version: policyVersions.community, acceptedAt: new Date() },
      ],
      guardianConsent: normalizedGuardianConsent || undefined,
    })

    void sendWelcomeEmail(user)

    // Return a token so teacher applicants can immediately authenticate the
    // protected application submission after their pending_teacher account is created.
    const token = generateToken(user._id, user.role, user.isLiveTutor)

    // 6. Return success
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        // The sidebar needs this capability immediately after registration or
        // login, rather than waiting for a full-page refresh and /me request.
        isLiveTutor: user.isLiveTutor,
        liveTutorStatus: user.liveTutorStatus,
        dateOfBirth: user.dateOfBirth,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      message: 'Server error during registration'
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      })
    }

    const user = await User.findOne({ email })
    const passwordMatches = user && await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = generateToken(user._id, user.role, user.isLiveTutor)

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        // These are safe account-state fields, not private application data.
        // They let the frontend select the appropriate live-tutoring menu.
        isLiveTutor: user.isLiveTutor,
        liveTutorStatus: user.liveTutorStatus,
        dateOfBirth: user.dateOfBirth,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      message: 'Server error during login'
    })
  }
}

// This endpoint confirms that the JWT still identifies an existing user.
// authMiddleware has already verified the token and placed its userId on
// req.user.userId. The database lookup lets us return the user's current data.
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -guardianConsent')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    // Excluding password prevents this identity-check endpoint from returning
    // a stored credential hash, even though the request is authenticated.
    return res.status(200).json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return res.status(500).json({
      message: 'Server error while fetching user'
    })
  }
}

const forgotPassword = async (req, res) => {
  const genericResponse = { message: 'If an account exists with this email, a reset link has been sent' }

  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) {
      // A uniform response prevents attackers from using this endpoint to discover registered emails.
      return res.status(200).json(genericResponse)
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetToken = hashedToken
    user.passwordResetExpires = new Date(Date.now() + 3600000)
    await user.save()

    void sendPasswordResetEmail(user, resetToken)
    return res.status(200).json(genericResponse)
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ message: 'Unable to process password reset request' })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const newPassword = String(req.body?.newPassword || '')

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Hash the emailed token before lookup so a database reader cannot redeem stored tokens.
    const hashedToken = crypto.createHash('sha256').update(String(token || '')).digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.passwordResetToken = null
    user.passwordResetExpires = null
    await user.save()

    return res.status(200).json({ message: 'Password reset successfully. Please login.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ message: 'Unable to reset password' })
  }
}

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword }
