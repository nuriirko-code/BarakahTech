import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/common/Avatar'
import ConversationList from '../../components/messaging/ConversationList'
import MessageBubble from '../../components/messaging/MessageBubble'
import MessageInput from '../../components/messaging/MessageInput'

const getId = (value) => value?._id || value?.id || value
const getSenderId = (sender) => getId(sender)?.toString()

const MessagesPage = () => {
  const { user, token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({ subject: '', content: '', targetRole: 'all' })
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)
  const [announcementSuccess, setAnnouncementSuccess] = useState('')
  const [announcementRecipientCounts, setAnnouncementRecipientCounts] = useState(null)
  const messagesEndRef = useRef(null)
  const initialConversationIdRef = useRef(searchParams.get('conversationId'))

  useEffect(() => {
    let isCurrent = true

    const loadConversations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!isCurrent) return

        const loadedConversations = response.data.conversations || []
        setConversations(loadedConversations)
        const requestedConversation = loadedConversations.find(
          (conversation) => conversation._id === initialConversationIdRef.current
        )
        if (requestedConversation) {
          setActiveConversation(requestedConversation)
          setShowSidebar(false)
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Unable to load your conversations.')
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) loadConversations()

    return () => {
      isCurrent = false
    }
  }, [token])

  useEffect(() => {
    if (user?.role !== 'admin' || !token) return undefined

    let isCurrent = true
    const loadAnnouncementRecipients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!isCurrent) return

        const activeRecipients = (response.data.users || []).filter((recipient) => (
          recipient.isActive !== false && recipient._id !== user.id
        ))
        setAnnouncementRecipientCounts({
          all: activeRecipients.length,
          student: activeRecipients.filter((recipient) => recipient.role === 'student').length,
          teacher: activeRecipients.filter((recipient) => recipient.role === 'teacher').length,
          pending_teacher: activeRecipients.filter((recipient) => recipient.role === 'pending_teacher').length,
        })
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Unable to estimate announcement recipients.')
        }
      }
    }

    loadAnnouncementRecipients()
    return () => {
      isCurrent = false
    }
  }, [token, user?.id, user?.role])

  useEffect(() => {
    if (!activeConversation?._id || !token) return undefined

    let isCurrent = true

    const loadMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/conversations/${activeConversation._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (isCurrent) {
          setMessages(response.data.messages || [])
          setConversations((currentConversations) => currentConversations.map((conversation) => (
            conversation._id === activeConversation._id
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )))
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Unable to load these messages.')
          setMessages([])
        }
      } finally {
        if (isCurrent) setMessagesLoading(false)
      }
    }

    loadMessages()
    return () => {
      isCurrent = false
    }
  }, [activeConversation?._id, token])

  useEffect(() => {
    // Keeping the newest item in view is the expected chat behavior after selecting a thread
    // or sending a message, so readers do not have to scroll manually after each update.
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    // Phones have room for one primary pane at a time, so selecting a thread swaps
    // the list for the conversation and the header's back button restores the list.
    setShowSidebar(false)
    setMessagesLoading(true)
    setError('')
    setSearchParams({ conversationId: conversation._id })
    setConversations((currentConversations) => currentConversations.map((item) => (
      item._id === conversation._id ? { ...item, unreadCount: 0 } : item
    )))
  }

  const handleSendMessage = async (text) => {
    if (!activeConversation?._id) return false

    setSending(true)
    setError('')
    try {
      const response = await axios.post(
        `http://localhost:5000/api/messages/conversations/${activeConversation._id}/messages`,
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const sentMessage = response.data.message

      // Append the server-created message directly; refetching the entire thread after
      // every send would waste bandwidth and could disturb the user's scroll position.
      setMessages((currentMessages) => [...currentMessages, sentMessage])
      setConversations((currentConversations) => currentConversations.map((conversation) => (
        conversation._id === activeConversation._id
          ? {
              ...conversation,
              lastMessage: sentMessage.content,
              lastMessageAt: sentMessage.createdAt,
              lastMessageBy: getId(user),
              unreadCount: 0,
            }
          : conversation
      )))
      setActiveConversation((conversation) => conversation?._id === activeConversation._id
        ? { ...conversation, lastMessage: sentMessage.content, lastMessageAt: sentMessage.createdAt }
        : conversation)
      if (response.data.warning) setError(response.data.warning)
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.warning || requestError.response?.data?.message || 'Message could not be sent.')
      return false
    } finally {
      setSending(false)
    }
  }

  const handleNewSupportTicket = async () => {
    const subject = window.prompt('What do you need help with?')?.trim()
    if (!subject) return
    const initialMessage = window.prompt('Describe your question or issue.')?.trim()
    if (!initialMessage) return

    setError('')
    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages/support',
        { subject, initialMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const { conversation, message } = response.data
      setConversations((currentConversations) => [conversation, ...currentConversations])
      setActiveConversation(conversation)
      setMessages([message])
      setShowSidebar(false)
      setSearchParams({ conversationId: conversation._id })
    } catch (requestError) {
      setError(requestError.response?.data?.warning || requestError.response?.data?.message || 'Unable to open support ticket.')
    }
  }

  const handleNewAnnouncement = () => {
    setError('')
    setAnnouncementSuccess('')
    setShowAnnouncementModal(true)
  }

  const handleSendAnnouncement = async (event) => {
    event.preventDefault()
    const subject = announcementForm.subject.trim()
    const content = announcementForm.content.trim()

    if (!subject || !content) {
      setError('Enter both an announcement subject and message.')
      return
    }

    setSendingAnnouncement(true)
    setError('')
    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages/announcements',
        { ...announcementForm, subject, content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const { conversation, announcement } = response.data
      setConversations((currentConversations) => [conversation, ...currentConversations])
      setActiveConversation(conversation)
      setMessages([announcement])
      setShowSidebar(false)
      setSearchParams({ conversationId: conversation._id })
      setAnnouncementSuccess(response.data.message || 'Announcement sent successfully.')
      setAnnouncementForm({ subject: '', content: '', targetRole: 'all' })
      setShowAnnouncementModal(false)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send announcement.')
    } finally {
      setSendingAnnouncement(false)
    }
  }

  const activeParticipants = activeConversation?.participants || []
  const otherParticipant = activeParticipants.find(
    (participant) => getSenderId(participant) !== user?.id?.toString()
  )
  const isSupportForUser = activeConversation?.isAdminConversation && user?.role !== 'admin'
  const conversationName = activeConversation?.type === 'announcement'
    ? 'Announcement'
    : isSupportForUser
      ? 'BarakahTech Support'
      : otherParticipant?.name || (activeConversation?.type === 'support' ? 'Support request' : 'Conversation')
  const conversationIcon = activeConversation?.type === 'announcement'
    ? 'fas fa-bullhorn'
    : isSupportForUser
      ? 'fas fa-shield-halved'
      : ''
  const courseId = getId(activeConversation?.course)
  const courseTitle = activeConversation?.course?.title
  const announcementRecipientCount = announcementRecipientCounts?.[announcementForm.targetRole]

  return (
    <main className="h-[100dvh] min-h-[480px] overflow-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto flex h-full max-w-[1500px] overflow-hidden border-x border-slate-200 bg-white shadow-sm">
        <aside className={`${showSidebar ? 'flex' : 'hidden'} w-full shrink-0 flex-col border-r border-slate-200 md:flex md:w-80`}>
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h1 className="flex items-center gap-2 text-lg font-extrabold">
              <i className="fas fa-comments text-green-700" aria-hidden="true" />Messages
            </h1>
            {user?.role === 'admin' ? (
              <button type="button" onClick={handleNewAnnouncement} title="Send announcement" aria-label="Send announcement" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-green-800 hover:bg-green-50">
                <i className="fas fa-bullhorn" aria-hidden="true" />
              </button>
            ) : (
              <button type="button" onClick={handleNewSupportTicket} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-800">
                Contact Support
              </button>
            )}
          </header>

          {announcementSuccess && (
            <div role="status" className="mx-3 mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
              {announcementSuccess}
            </div>
          )}

          {error && <div role="alert" className="mx-3 mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</div>}

          {loading ? (
            <div className="space-y-3 p-4" role="status" aria-label="Loading conversations">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?._id || null}
              onSelectConversation={handleSelectConversation}
              currentUserId={user?.id}
            />
          )}
        </aside>

        <section className={`${showSidebar ? 'hidden' : 'flex'} min-w-0 flex-1 flex-col md:flex`}>
          {!activeConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <i className="fas fa-comments text-5xl text-slate-300" aria-hidden="true" />
              <h2 className="mt-5 text-lg font-bold text-slate-800">Select a conversation to start messaging</h2>
              {user?.role !== 'admin' && (
                <button type="button" onClick={handleNewSupportTicket} className="mt-4 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800">
                  Contact Support
                </button>
              )}
            </div>
          ) : (
            <>
              <header className="flex min-h-[68px] items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                <button type="button" onClick={() => setShowSidebar(true)} aria-label="Back to conversations" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden">
                  <i className="fas fa-arrow-left" aria-hidden="true" />
                </button>
                {conversationIcon ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800">
                    <i className={conversationIcon} aria-hidden="true" />
                  </span>
                ) : (
                  <Avatar name={conversationName} size="md" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold text-slate-900">{conversationName}</h2>
                  <p className="truncate text-xs text-slate-500">{activeConversation.subject || (courseTitle ? `Course: ${courseTitle}` : '')}</p>
                </div>
                {courseId && courseTitle && (
                  <a href={`/learn/${courseId}`} className="hidden max-w-44 truncate text-xs font-semibold text-green-800 underline sm:block">
                    {courseTitle}
                  </a>
                )}
              </header>

              {error && <div role="alert" className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-6">
                {messagesLoading ? (
                  <div className="space-y-4" role="status" aria-label="Loading messages">
                    <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="ml-auto h-16 w-1/2 animate-pulse rounded-2xl bg-green-100" />
                    <div className="h-12 w-3/5 animate-pulse rounded-2xl bg-slate-200" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-400">No messages yet. Start the conversation.</div>
                ) : messages.map((message) => {
                  const senderId = getSenderId(message.sender)
                  const isOwnMessage = senderId === user?.id?.toString()
                  const senderName = message.sender?.name || (isOwnMessage ? user?.name : 'Participant')

                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      senderName={senderName}
                    />
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <MessageInput onSendMessage={handleSendMessage} disabled={sending || messagesLoading} />
            </>
          )}
        </section>
      </div>

      {showAnnouncementModal && user?.role === 'admin' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !sendingAnnouncement) setShowAnnouncementModal(false)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="announcement-title" className="my-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 id="announcement-title" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                <i className="fas fa-bullhorn text-green-700" aria-hidden="true" />Send Announcement
              </h2>
              <button type="button" onClick={() => setShowAnnouncementModal(false)} disabled={sendingAnnouncement} aria-label="Close announcement form" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                <i className="fas fa-xmark" aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleSendAnnouncement} className="space-y-4 p-5 sm:p-6">
              {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

              <label className="block text-sm font-semibold text-slate-800">
                Target audience
                {/* Role targeting lets admins send operational notes only to the people affected. */}
                <select
                  value={announcementForm.targetRole}
                  onChange={(event) => setAnnouncementForm((form) => ({ ...form, targetRole: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                >
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="pending_teacher">Pending Teachers</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Subject
                <input
                  required
                  maxLength={120}
                  value={announcementForm.subject}
                  onChange={(event) => setAnnouncementForm((form) => ({ ...form, subject: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Announcement
                <textarea
                  required
                  rows="5"
                  maxLength={1000}
                  value={announcementForm.content}
                  onChange={(event) => setAnnouncementForm((form) => ({ ...form, content: event.target.value }))}
                  className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                  placeholder="Write a concise update for your audience"
                />
                {/* A 1,000-character cap keeps broadcasts scannable and practical to read on phones. */}
                <span className="mt-1 block text-right text-xs text-slate-500">{announcementForm.content.length} / 1000</span>
              </label>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-800">Preview</p>
                <div className="mt-2 rounded-lg border border-blue-100 bg-white p-4">
                  <p className="font-bold text-slate-900">{announcementForm.subject || 'Announcement subject'}</p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{announcementForm.content || 'Your announcement will appear here.'}</p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  {announcementRecipientCount === undefined
                    ? 'Estimating recipients…'
                    : `Estimated recipients: ${announcementRecipientCount}`}
                </p>
                <div className="flex gap-2">
                  <button type="button" disabled={sendingAnnouncement} onClick={() => setShowAnnouncementModal(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={sendingAnnouncement || !announcementForm.subject.trim() || !announcementForm.content.trim()} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">
                    {sendingAnnouncement && <i className="fas fa-spinner fa-spin" aria-hidden="true" />}
                    {sendingAnnouncement ? 'Sending…' : 'Send Announcement'}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default MessagesPage
