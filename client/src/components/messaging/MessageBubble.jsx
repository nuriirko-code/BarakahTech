const formatMessageTime = (dateValue) => {
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// Right alignment follows the familiar chat convention that helps readers quickly
// distinguish their own contributions from messages written by other participants.
const MessageBubble = ({ message, isOwnMessage, senderName = '' }) => {
  const sentTime = formatMessageTime(message.createdAt)

  if (message.type === 'system') {
    // System events describe platform actions, not human speech, so a centered note
    // avoids implying that a participant sent the enrollment/payment notification.
    return (
      <div className="mx-auto max-w-[90%] py-2 text-center">
        <p className="text-xs italic text-slate-500">{message.content}</p>
        {sentTime && <p className="mt-1 text-[10px] text-slate-400">{sentTime}</p>}
      </div>
    )
  }

  const isAnnouncement = message.type === 'announcement'

  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <article className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[72%] ${
        isAnnouncement
          ? 'border border-blue-200 bg-blue-50 text-blue-950'
          : isOwnMessage
            ? 'rounded-br-md bg-green-700 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-900'
      }`}>
        {isAnnouncement && (
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-blue-800">
            <i className="fas fa-bullhorn" aria-hidden="true" />Announcement
          </p>
        )}
        {!isOwnMessage && !isAnnouncement && senderName && (
          <p className="mb-1 text-xs font-bold text-green-800">{senderName}</p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
        <div className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${isOwnMessage && !isAnnouncement ? 'text-green-100' : 'text-slate-400'}`}>
          {message.flaggedForReview && (
            <span className="mr-auto inline-flex items-center gap-1 text-amber-700">
              <i className="fas fa-triangle-exclamation" aria-hidden="true" />This message was flagged for review
            </span>
          )}
          {sentTime && <time dateTime={message.createdAt}>{sentTime}</time>}
        </div>
      </article>
    </div>
  )
}

export default MessageBubble
