import { CSSProperties } from 'react'
import { Button } from '../shared/Button'
import type { Conversation } from '../../data/types'

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export function ChatSidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onArchive,
  onDelete
}: ChatSidebarProps) {
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    transition: 'opacity var(--transition-normal)'
  }

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'min(320px, 85vw)',
    background: 'var(--bg-primary)',
    zIndex: 1000,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform var(--transition-normal)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: isOpen ? '4px 0 24px rgba(0, 0, 0, 0.2)' : 'none'
  }

  const headerStyle: CSSProperties = {
    padding: 'var(--space-lg) var(--space-md)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 'calc(var(--safe-top) + var(--space-lg))'
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--text)'
  }

  const listStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-md)'
  }

  const sectionStyle: CSSProperties = {
    marginBottom: 'var(--space-lg)'
  }

  const sectionTitleStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 'var(--space-sm)',
    padding: '0 var(--space-sm)'
  }

  const conversationItemStyle = (isActive: boolean): CSSProperties => ({
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-md)',
    background: isActive ? 'var(--orb-orange)' : 'transparent',
    color: isActive ? 'white' : 'var(--text)',
    cursor: 'pointer',
    marginBottom: 'var(--space-xs)',
    transition: 'background var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-sm)'
  })

  const conversationTextStyle: CSSProperties = {
    flex: 1,
    overflow: 'hidden'
  }

  const conversationTitleStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const conversationMetaStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    opacity: 0.7,
    marginTop: 2
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
    opacity: 0.7
  }

  const actionButtonStyle: CSSProperties = {
    padding: 4,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    color: 'inherit',
    fontSize: 'var(--text-sm)'
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const recentConversations = conversations.filter(c => !c.isArchived)
  const archivedConversations = conversations.filter(c => c.isArchived)

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <aside style={sidebarStyle}>
        <header style={headerStyle}>
          <h2 style={titleStyle}>Conversations</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </header>

        <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)' }}>
          <Button variant="primary" fullWidth onClick={() => { onNewChat(); onClose() }}>
            New Chat
          </Button>
        </div>

        <div style={listStyle}>
          {recentConversations.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Recent</div>
              {recentConversations.map(convo => (
                <div
                  key={convo.id}
                  style={conversationItemStyle(convo.id === activeConversationId)}
                  onClick={() => { onSelectConversation(convo.id); onClose() }}
                >
                  <div style={conversationTextStyle}>
                    <div style={conversationTitleStyle}>{convo.title}</div>
                    <div style={conversationMetaStyle}>
                      {convo.messages.length} message{convo.messages.length !== 1 ? 's' : ''} - {formatTimestamp(convo.lastMessageAt)}
                    </div>
                  </div>
                  <div style={actionsStyle}>
                    <button
                      style={actionButtonStyle}
                      onClick={(e) => { e.stopPropagation(); onArchive(convo.id) }}
                      title="Archive"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {archivedConversations.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Archived</div>
              {archivedConversations.slice(0, 10).map(convo => (
                <div
                  key={convo.id}
                  style={conversationItemStyle(false)}
                  onClick={() => { onSelectConversation(convo.id); onClose() }}
                >
                  <div style={conversationTextStyle}>
                    <div style={{ ...conversationTitleStyle, opacity: 0.7 }}>{convo.title}</div>
                    <div style={conversationMetaStyle}>
                      {formatTimestamp(convo.lastMessageAt)}
                    </div>
                  </div>
                  <div style={actionsStyle}>
                    <button
                      style={actionButtonStyle}
                      onClick={(e) => { e.stopPropagation(); onDelete(convo.id) }}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {conversations.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: 'var(--space-xl)',
              fontSize: 'var(--text-sm)'
            }}>
              No conversations yet. Start a new chat!
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
