# Messaging System Implementation Plan - Driplo.bg

## 🔍 Current State Audit

### Database Schema ✅
- **Tables exist:**
  - `conversations` - Stores conversation metadata between users
  - `messages` - Stores individual messages
  - Both have proper foreign key relationships to `profiles` and `products`

### Issues Found in Current Implementation

1. **Incorrect Table References**
   - Code references `listings` table which doesn't exist (should be `products`)
   - Foreign key references point to `profiles` but code uses incorrect column names

2. **Missing Server-Side Data Loading**
   - No `+page.server.ts` files for proper SSR data loading
   - Client-side only data fetching leads to poor SEO and performance

3. **Svelte 4 Syntax Usage**
   - Using `$: reactive` statements instead of `$derived`
   - Using `export let` instead of `$props()`
   - Using `on:click` instead of `onclick`

4. **Missing RLS Policies**
   - Need to verify and implement proper Row Level Security

5. **No Message Status System**
   - Missing typing indicators
   - No online/offline status
   - No delivery/read receipts visualization

## 🎯 Implementation Strategy

### Phase 1: Fix Database References & RLS (Priority 1)

#### 1.1 Update Database References
```sql
-- Fix conversation table to use correct relationships
-- Update all references from 'buyer_id/seller_id' to 'participant1_id/participant2_id'
-- Remove product-specific references (make it generic messaging)
```

#### 1.2 Create/Update RLS Policies
```sql
-- Conversations: Users can only see their own conversations
-- Messages: Users can only see messages in their conversations
-- Message creation: Only participants can send messages
```

### Phase 2: Implement Server-Side Loading (Priority 2)

#### 2.1 Create `+page.server.ts` files
- `/messages/+page.server.ts` - Load conversations list
- `/messages/[id]/+page.server.ts` - Load specific conversation

#### 2.2 Benefits
- SEO improvement
- Faster initial page load
- Better error handling
- Type safety with PageServerLoad

### Phase 3: Upgrade to Svelte 5 Syntax (Priority 3)

#### 3.1 Components to Update
- All message components to use `$state`, `$props`, `$derived`
- Event handlers to use new syntax (onclick, oninput)
- Replace slots with snippets where applicable

### Phase 4: Real-time Features (Priority 4)

#### 4.1 Implement Supabase Realtime
- **Broadcast** for typing indicators
- **Presence** for online status
- **Postgres Changes** for new messages

#### 4.2 Message Status System
- Sent/Delivered/Read receipts
- Typing indicators
- Online/Offline status badges

### Phase 5: Performance Optimization (Priority 5)

#### 5.1 Virtual Scrolling
- Implement for long message lists
- Lazy load older messages

#### 5.2 Message Batching
- Group rapid messages from same sender
- Optimize database queries

## 📝 Technical Implementation Details

### 1. Database Schema Updates

```sql
-- Add message status tracking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' 
  CHECK (status IN ('sent', 'delivered', 'read'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add typing status table
CREATE TABLE IF NOT EXISTS typing_indicators (
  user_id UUID REFERENCES profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, conversation_id)
);

-- Create or update conversation participants view
CREATE OR REPLACE VIEW conversation_participants AS
SELECT 
  c.id as conversation_id,
  c.participant1_id,
  c.participant2_id,
  p1.username as participant1_username,
  p1.avatar_url as participant1_avatar,
  p2.username as participant2_username,
  p2.avatar_url as participant2_avatar
FROM conversations c
JOIN profiles p1 ON c.participant1_id = p1.id
JOIN profiles p2 ON c.participant2_id = p2.id;
```

### 2. Server-Side Load Functions

```typescript
// +page.server.ts pattern
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
  // Fetch data server-side
  // Return serializable data
  // Handle errors properly
};
```

### 3. Svelte 5 Component Pattern

```svelte
<script lang="ts">
  import { $state, $derived, $effect } from 'svelte';
  
  interface Props {
    conversation: Conversation;
    messages: Message[];
  }
  
  let { conversation, messages }: Props = $props();
  
  let newMessage = $state('');
  let isTyping = $state(false);
  
  const unreadCount = $derived(
    messages.filter(m => !m.read && m.sender_id !== currentUserId).length
  );
  
  $effect(() => {
    // Setup realtime subscriptions
    return () => {
      // Cleanup
    };
  });
</script>
```

### 4. Realtime Implementation

```typescript
// Broadcast for typing
const channel = supabase.channel(`typing:${conversationId}`)
  .on('broadcast', { event: 'typing' }, ({ payload }) => {
    // Handle typing indicator
  })
  .subscribe();

// Presence for online status
const presenceChannel = supabase.channel('online-users')
  .on('presence', { event: 'sync' }, () => {
    // Update online status
  })
  .subscribe();
```

### 5. Message Service Architecture

```typescript
// lib/services/messageService.ts
class MessageService {
  // Send message with optimistic updates
  async sendMessage(conversationId: string, content: string) {
    // 1. Optimistic update
    // 2. Send to database
    // 3. Handle success/failure
  }
  
  // Mark messages as read
  async markAsRead(messageIds: string[]) {
    // Batch update for efficiency
  }
  
  // Handle typing indicators
  broadcastTyping(conversationId: string, isTyping: boolean) {
    // Use Supabase Broadcast
  }
}
```

## 🚀 Implementation Steps

### Week 1: Foundation
1. Fix database references (listings → products)
2. Implement proper RLS policies
3. Create server-side load functions
4. Fix TypeScript errors

### Week 2: Svelte 5 Migration
1. Update all message components to Svelte 5 syntax
2. Implement proper state management with runes
3. Update event handlers

### Week 3: Real-time Features
1. Implement message status (sent/delivered/read)
2. Add typing indicators
3. Add online/offline presence

### Week 4: Polish & Optimization
1. Virtual scrolling for long conversations
2. Message batching
3. Performance monitoring
4. Error handling improvements

## 🎨 UI/UX Improvements

1. **Message Grouping**: Group consecutive messages from same sender
2. **Time Stamps**: Smart timestamps (Today, Yesterday, dates)
3. **Reactions**: Add emoji reactions to messages
4. **Media Support**: Image/file sharing capabilities
5. **Search**: Search within conversations
6. **Notifications**: Push notifications for new messages

## 🔒 Security Considerations

1. **RLS Policies**: Strict row-level security
2. **Rate Limiting**: Prevent spam messages
3. **Content Moderation**: Flag inappropriate content
4. **Encryption**: Consider E2E encryption for sensitive messages
5. **Input Validation**: Sanitize all user inputs

## 📊 Success Metrics

- Message delivery time < 100ms
- Read receipt accuracy 100%
- Zero message loss
- Typing indicator latency < 50ms
- Support 10,000+ concurrent connections

## 🛠️ Testing Strategy

1. **Unit Tests**: Message service functions
2. **Integration Tests**: Database operations
3. **E2E Tests**: Full conversation flow
4. **Load Tests**: Realtime performance
5. **Security Tests**: RLS policy validation

## 📚 Documentation Needed

1. API documentation for message endpoints
2. Realtime event documentation
3. Component usage examples
4. Migration guide from current system
5. Troubleshooting guide

## ⚠️ Risk Mitigation

1. **Backward Compatibility**: Maintain old message format during migration
2. **Gradual Rollout**: Feature flags for new functionality
3. **Fallback System**: Graceful degradation if realtime fails
4. **Data Backup**: Regular conversation backups
5. **Monitoring**: Real-time error tracking and alerts

---

## Next Steps

1. ✅ Review and approve this plan
2. 🔧 Start with Phase 1: Database fixes
3. 📝 Create detailed tickets for each task
4. 🚀 Begin implementation following the weekly schedule
5. 📊 Set up monitoring and metrics

**Estimated Timeline**: 4 weeks for full implementation
**Priority**: High - Core feature for marketplace communication