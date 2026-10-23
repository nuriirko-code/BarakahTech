import { useRef, useState } from 'react'

// Enter sends the current draft, while Shift+Enter retains the expected multiline
// editing behavior used by common chat applications.
const MessageInput = ({ onSendMessage, disabled = false, placeholder = 'Write a message...' }) => {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const maximumHeight = 112

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, maximumHeight)}px`
    textarea.style.overflowY = textarea.scrollHeight > maximumHeight ? 'auto' : 'hidden'
  }

  const submitMessage = async () => {
    const content = text.trim()
    if (!content || disabled) return

    const sent = await onSendMessage?.(content)
    if (sent === false) return

    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.overflowY = 'hidden'
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    void submitMessage()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void submitMessage()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
      <div className="flex items-end gap-3">
        <label className="sr-only" htmlFor="message-composer">Write a message</label>
        <textarea
          id="message-composer"
          ref={textareaRef}
          rows="1"
          maxLength={5000}
          value={text}
          disabled={disabled}
          onChange={(event) => {
            setText(event.target.value)
            resizeTextarea()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="max-h-28 min-h-11 flex-1 resize-none overflow-y-hidden rounded-xl border border-slate-300 px-4 py-3 text-sm leading-5 text-slate-900 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          title="Send message"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <i className="fas fa-paper-plane" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
        <p className="flex items-center gap-1.5">
          {/* Repeating this reminder at composition time helps prevent accidental off-platform
              contact sharing before the scanner has to intervene. */}
          <i className="fas fa-shield-halved" aria-hidden="true" />
          Keep all communication on Barakah Academy. Sharing external contact info is not permitted.
        </p>
        <span className="shrink-0 tabular-nums">{text.length} / 5000</span>
      </div>
    </form>
  )
}

export default MessageInput
