const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // 1. Check all fields exist
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email and password'
      })
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
    const safeRole =
      role === 'teacher' ? 'pending_teacher' : 'student'

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 5. Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: safeRole,
    })

    // 6. Return success
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      message: 'Server error during login'
    })
  }
}

module.exports = { registerUser, loginUser }