import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export interface Message {
	id: string;
	conversation_id: string;
	sender_id: string;
	content: string;
	message_type?: 'text' | 'image' | 'product' | 'system';
	product_id?: string | null;
	metadata?: any;
	status: 'sent' | 'delivered' | 'read';
	delivered_at?: string | null;
	read_at?: string | null;
	is_edited?: boolean;
	edited_at?: string | null;
	created_at: string;
	updated_at: string;
}

export interface TypingIndicator {
	user_id: string;
	conversation_id: string;
	is_typing: boolean;
	updated_at: string;
}

export interface MessageServiceOptions {
	supabase: SupabaseClient<Database>;
	conversationId: string;
	userId: string;
}

export class MessageService {
	private supabase: SupabaseClient<Database>;
	private conversationId: string;
	private userId: string;
	private channels: Map<string, RealtimeChannel> = new Map();
	private typingTimeout: NodeJS.Timeout | null = null;

	constructor({ supabase, conversationId, userId }: MessageServiceOptions) {
		this.supabase = supabase;
		this.conversationId = conversationId;
		this.userId = userId;
	}

	/**
	 * Send a new message
	 */
	async sendMessage(content: string, messageType: 'text' | 'image' | 'product' | 'system' = 'text', productId?: string): Promise<Message | null> {
		try {
			console.log('MessageService.sendMessage called with:', {
				content,
				messageType,
				productId,
				conversationId: this.conversationId,
				userId: this.userId
			});

			const insertData = {
				conversation_id: this.conversationId,
				sender_id: this.userId,
				content,
				message_type: messageType,
				product_id: productId,
				status: 'sent'
			};
			console.log('Inserting message with data:', insertData);

			const { data, error } = await this.supabase
				.from('messages')
				.insert(insertData)
				.select()
				.single();

			console.log('Insert result:', { data, error });

			if (error) {
				console.error('Error sending message:', error);
				return null;
			}

			// Stop typing indicator after sending
			await this.setTyping(false);

			console.log('Message sent successfully:', data);
			return data as Message;
		} catch (error) {
			console.error('Error sending message:', error);
			return null;
		}
	}

	/**
	 * Mark messages as delivered
	 */
	async markAsDelivered(messageIds: string[]): Promise<boolean> {
		try {
			const { error } = await this.supabase
				.from('messages')
				.update({
					status: 'delivered',
					delivered_at: new Date().toISOString()
				})
				.in('id', messageIds)
				.eq('status', 'sent');

			if (error) {
				console.error('Error marking messages as delivered:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error marking messages as delivered:', error);
			return false;
		}
	}

	/**
	 * Mark messages as read
	 */
	async markAsRead(messageIds: string[]): Promise<boolean> {
		try {
			const { error } = await this.supabase
				.from('messages')
				.update({
					status: 'read',
					read_at: new Date().toISOString()
				})
				.in('id', messageIds)
				.neq('sender_id', this.userId);

			if (error) {
				console.error('Error marking messages as read:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error marking messages as read:', error);
			return false;
		}
	}

	/**
	 * Mark all messages in conversation as read
	 */
	async markAllAsRead(): Promise<boolean> {
		try {
			const { error } = await this.supabase
				.from('messages')
				.update({
					status: 'read',
					read_at: new Date().toISOString()
				})
				.eq('conversation_id', this.conversationId)
				.neq('sender_id', this.userId)
				.neq('status', 'read');

			if (error) {
				console.error('Error marking all messages as read:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error marking all messages as read:', error);
			return false;
		}
	}

	/**
	 * Set typing indicator status
	 */
	async setTyping(isTyping: boolean): Promise<void> {
		try {
			// Clear existing timeout
			if (this.typingTimeout) {
				clearTimeout(this.typingTimeout);
				this.typingTimeout = null;
			}

			// Broadcast typing status
			const channel = this.getTypingChannel();
			if (channel) {
				await channel.send({
					type: 'broadcast',
					event: 'typing',
					payload: {
						user_id: this.userId,
						conversation_id: this.conversationId,
						is_typing: isTyping
					}
				});
			}

			// Update database
			await this.supabase
				.from('typing_indicators')
				.upsert({
					user_id: this.userId,
					conversation_id: this.conversationId,
					is_typing: isTyping,
					updated_at: new Date().toISOString()
				});

			// Auto-stop typing after 10 seconds
			if (isTyping) {
				this.typingTimeout = setTimeout(() => {
					this.setTyping(false);
				}, 10000);
			}
		} catch (error) {
			console.error('Error setting typing status:', error);
		}
	}

	/**
	 * Subscribe to new messages
	 */
	subscribeToMessages(callback: (message: Message) => void): () => void {
		try {
			const channel = this.supabase
				.channel(`messages:${this.conversationId}`)
				.on(
					'postgres_changes',
					{
						event: 'INSERT',
						schema: 'public',
						table: 'messages',
						filter: `conversation_id=eq.${this.conversationId}`
					},
					(payload) => {
						callback(payload.new as Message);
					}
				)
				.subscribe();

			this.channels.set('messages', channel);

			return () => {
				if (channel) {
					this.supabase.removeChannel(channel);
				}
				this.channels.delete('messages');
			};
		} catch (error) {
			console.error('Error subscribing to messages:', error);
			return () => {};
		}
	}

	/**
	 * Subscribe to message status updates
	 */
	subscribeToStatusUpdates(callback: (message: Message) => void): () => void {
		try {
			const channel = this.supabase
				.channel(`message-status:${this.conversationId}`)
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'messages',
						filter: `conversation_id=eq.${this.conversationId}`
					},
					(payload) => {
						callback(payload.new as Message);
					}
				)
				.subscribe();

			this.channels.set('status', channel);

			return () => {
				if (channel) {
					this.supabase.removeChannel(channel);
				}
				this.channels.delete('status');
			};
		} catch (error) {
			console.error('Error subscribing to status updates:', error);
			return () => {};
		}
	}

	/**
	 * Subscribe to typing indicators
	 */
	subscribeToTyping(callback: (data: { user_id: string; is_typing: boolean }) => void): () => void {
		try {
			const channel = this.getTypingChannel();
			
			if (channel) {
				channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
					if (payload.user_id !== this.userId) {
						callback({
							user_id: payload.user_id,
							is_typing: payload.is_typing
						});
					}
				});
			}

			return () => {
				if (channel) {
					this.supabase.removeChannel(channel);
				}
				this.channels.delete('typing');
			};
		} catch (error) {
			console.error('Error subscribing to typing:', error);
			return () => {};
		}
	}

	/**
	 * Subscribe to presence (online/offline status)
	 */
	subscribeToPresence(callback: (presenceState: any) => void): () => void {
		try {
			const channel = this.supabase
				.channel(`presence:${this.conversationId}`)
				.on('presence', { event: 'sync' }, () => {
					const state = channel.presenceState();
					callback(state);
				})
				.on('presence', { event: 'join' }, ({ key, newPresences }) => {
					callback({ event: 'join', key, newPresences });
				})
				.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
					callback({ event: 'leave', key, leftPresences });
				})
				.subscribe(async (status) => {
					if (status === 'SUBSCRIBED') {
						await channel.track({
							user_id: this.userId,
							online_at: new Date().toISOString()
						});
					}
				});

			this.channels.set('presence', channel);

			return () => {
				if (channel) {
					channel.untrack();
					this.supabase.removeChannel(channel);
				}
				this.channels.delete('presence');
			};
		} catch (error) {
			console.error('Error subscribing to presence:', error);
			return () => {};
		}
	}

	/**
	 * Get or create typing channel
	 */
	private getTypingChannel(): RealtimeChannel | null {
		try {
			let channel = this.channels.get('typing');
			
			if (!channel) {
				channel = this.supabase.channel(`typing:${this.conversationId}`);
				channel.subscribe();
				this.channels.set('typing', channel);
			}
			
			return channel;
		} catch (error) {
			console.error('Error creating typing channel:', error);
			return null;
		}
	}

	/**
	 * Edit a message
	 */
	async editMessage(messageId: string, newContent: string): Promise<Message | null> {
		try {
			const { data, error } = await this.supabase
				.from('messages')
				.update({
					content: newContent,
					is_edited: true,
					edited_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				})
				.eq('id', messageId)
				.eq('sender_id', this.userId)
				.select()
				.single();

			if (error) {
				console.error('Error editing message:', error);
				return null;
			}

			return data as Message;
		} catch (error) {
			console.error('Error editing message:', error);
			return null;
		}
	}

	/**
	 * Delete a message (soft delete - marks as deleted)
	 */
	async deleteMessage(messageId: string): Promise<boolean> {
		try {
			const { error } = await this.supabase
				.from('messages')
				.update({
					content: 'This message has been deleted',
					message_type: 'system',
					metadata: { deleted: true, deleted_at: new Date().toISOString() }
				})
				.eq('id', messageId)
				.eq('sender_id', this.userId);

			if (error) {
				console.error('Error deleting message:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error deleting message:', error);
			return false;
		}
	}

	/**
	 * Load messages with pagination
	 */
	async loadMessages(limit: number = 50, offset: number = 0): Promise<Message[]> {
		try {
			const { data, error } = await this.supabase
				.from('messages')
				.select('*')
				.eq('conversation_id', this.conversationId)
				.order('created_at', { ascending: false })
				.range(offset, offset + limit - 1);

			if (error) {
				console.error('Error loading messages:', error);
				return [];
			}

			// Reverse to get chronological order
			return (data as Message[]).reverse();
		} catch (error) {
			console.error('Error loading messages:', error);
			return [];
		}
	}

	/**
	 * Search messages in conversation
	 */
	async searchMessages(query: string): Promise<Message[]> {
		try {
			const { data, error } = await this.supabase
				.from('messages')
				.select('*')
				.eq('conversation_id', this.conversationId)
				.ilike('content', `%${query}%`)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error searching messages:', error);
				return [];
			}

			return data as Message[];
		} catch (error) {
			console.error('Error searching messages:', error);
			return [];
		}
	}

	/**
	 * Clean up all subscriptions
	 */
	cleanup(): void {
		// Clear typing timeout
		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
			this.typingTimeout = null;
		}

		// Remove all channels
		this.channels.forEach((channel) => {
			this.supabase.removeChannel(channel);
		});
		this.channels.clear();
	}
}

/**
 * Factory function to create a message service instance
 */
export function createMessageService(options: MessageServiceOptions): MessageService {
	return new MessageService(options);
}