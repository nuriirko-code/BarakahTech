const User = require('../models/User')

// Administrators can review account records, but user content remains owned by
// its creator. Deactivation is a soft disable: the account data stays available
// for records and can be restored instead of being permanently deleted.
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    return res.status(200).json({ users, count: users.length })
  } catch (error) {
    console.error('Get all users error:', error)
    return res.status(500).json({ message: 'Server error while fetching users' })
  }
}

const toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Admin accounts remain protected in both the user interface and API.
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be deactivated' })
    }

    user.isActive = !user.isActive
    await user.save()

    const safeUser = user.toObject()
    delete safeUser.password

    return res.status(200).json({
      message: safeUser.isActive ? 'User reactivated successfully' : 'User deactivated successfully',
      user: safeUser,
    })
  } catch (error) {
    console.error('Toggle user active error:', error)
    return res.status(500).json({ message: 'Server error while updating user status' })
  }
}

module.exports = { getAllUsers, toggleUserActive }
