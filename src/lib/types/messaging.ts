export interface Message {
	id: string;
	content: string;
	sender_id: string;
	conversation_id: string;
	created_at: string;
	message_type: 'text' | 'image' | 'product' | 'system';
	image_url?: string;
	shared_product_id?: string;
	is_read: boolean;
	read_at?: string;
	deleted_at?: string;
}

export interface Conversation {
	id: string;
	buyer_id: string;
	seller_id: string;
	product_id?: string;
	last_message_at: string;
	status: 'active' | 'archived' | 'blocked';
	created_at: string;
	updated_at: string;
	other_user: UserProfile;
	last_message?: Message;
	unread_count: number;
	product?: ProductPreview;
}

export interface UserProfile {
	id: string;
	username: string;
	avatar_url: string;
	verified: boolean;
}

export interface ProductPreview {
	id: string;
	title: string;
	price: number;
	images: string[];
}

export interface ConversationListProps {
	conversations: Conversation[];
	loading: boolean;
	onConversationClick: (conversationId: string) => void;
	onSearchChange: (query: string) => void;
	searchQuery: string;
	currentUserId?: string;
	username?: string;
	onBack?: () => void;
	onCompose?: () => void;
}

export interface ConversationItemProps {
	conversation: Conversation;
	currentUserId?: string;
	onClick: () => void;
}

export interface MessageBubbleProps {
	message: Message;
	isOwn?: boolean;
	isFromCurrentUser?: boolean;
	senderName?: string;
	senderAvatar?: string;
	showTime?: boolean;
}

export interface ChatHeaderProps {
	user?: UserProfile;
	otherUser?: UserProfile;
	isOnline?: boolean;
	product?: ProductPreview | null;
	onBack: () => void;
	onProfileClick?: () => void;
}

export interface MessageInputProps {
	value: string;
	onSend: () => void;
	onTyping?: (isTyping: boolean) => void;
	disabled?: boolean;
	placeholder?: string;
	typingUsers?: string[];
}

export interface ProductContextProps {
	product: ProductPreview;
	onProductClick: () => void;
}

export interface DateSeparatorProps {
	date: string;
}

export interface EmptyMessagesProps {
	title?: string;
	description?: string;
	icon?: string;
}

export interface MessagesSkeletonProps {
	count?: number;
}
