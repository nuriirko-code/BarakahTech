import Avatar from '../common/Avatar'

const formatConversationTime = (dateValue) => {
  if (!dateValue) return ''

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const elapsed = now.getTime() - date.getTime()
  if (elapsed < 60 * 60 * 1000) return `${Math.max(1, Math.floor(elapsed / 60000))}m ago`
  if (date.toDateString() === now.toDateString()) return `${Math.floor(elapsed / (60 * 60 * 1000))}h ago`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const getId = (participant) => participant?._id || participant

// Conversation previews use participant and cached last-message data from the inbox API,
// so the list stays light even when each conversation contains a long message history.
const ConversationList = ({ conversations = [], activeConversationId = null, onSelectConversation, currentUserId }) => (
  <div className="min-h-0 flex-1 overflow-y-auto">
    {conversations.length === 0 ? (
      <div className="px-5 py-10 text-center text-sm text-slate-500">No conversations yet.</div>
    ) : conversations.map((conversation) => {
      const currentParticipant = conversation.participants?.find(
        (participant) => getId(participant)?.toString() === currentUserId?.toString()
      )
      const otherParticipant = conversation.participants?.find(
        (participant) => getId(participant)?.toString() !== currentUserId?.toString()
      )
      const isAnnouncement = conversation.type === 'announcement'
      const isSupport = conversation.isAdminConversation && currentParticipant?.role !== 'admin'
      const displayName = isAnnouncement
        ? 'Announcement'
        : isSupport
          ? 'BarakahTech Support'
          : otherParticipant?.name || 'Conversation'
      const icon = isAnnouncement ? 'fas fa-bullhorn' : isSupport ? 'fas fa-shield-halved' : ''
      const preview = conversation.subject || conversation.lastMessage || 'Start a conversation'
      const unreadCount = Number(conversation.unreadCount || 0)
      const isActive = conversation._id === activeConversationId

      return (
        <button
          key={conversation._id}
          type="button"
          onClick={() => onSelectConversation?.(conversation)}
          className={`flex w-full cursor-pointer items-center gap-3 border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
            isActive ? 'border-l-4 border-l-green-700 bg-green-50' : 'border-l-4 border-l-transparent'
          }`}
        >
          {icon ? (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isAnnouncement ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
              <i className={icon} aria-hidden="true" />
            </span>
          ) : (
            <Avatar name={displayName} size="md" />
          )}
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-bold text-slate-900">{displayName}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatConversationTime(conversation.lastMessageAt)}</span>
            </span>
            <span className="mt-1 flex items-center justify-between gap-2">
              <span className="truncate text-xs text-slate-500">{preview.slice(0, 50)}{preview.length > 50 ? '…' : ''}</span>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-green-700 px-1.5 text-[11px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
          </span>
        </button>
      )
    })}
  </div>
)

export default ConversationList
