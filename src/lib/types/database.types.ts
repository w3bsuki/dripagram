export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string
          seller_rating: number
          seller_rating_count: number
          seller_verified: boolean
          seller_verified_at: string | null
          seller_badge: string | null
          total_sales: number
          total_earnings: number
          notification_email: boolean
          notification_push: boolean
          notification_sms: boolean
          language: string
          currency: string
          theme: string
          role: 'user' | 'seller' | 'admin' | 'moderator'
          status: 'active' | 'suspended' | 'banned' | 'deleted'
          last_seen_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          seller_rating?: number
          seller_rating_count?: number
          seller_verified?: boolean
          seller_verified_at?: string | null
          seller_badge?: string | null
          total_sales?: number
          total_earnings?: number
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          language?: string
          currency?: string
          theme?: string
          role?: 'user' | 'seller' | 'admin' | 'moderator'
          status?: 'active' | 'suspended' | 'banned' | 'deleted'
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          seller_rating?: number
          seller_rating_count?: number
          seller_verified?: boolean
          seller_verified_at?: string | null
          seller_badge?: string | null
          total_sales?: number
          total_earnings?: number
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          language?: string
          currency?: string
          theme?: string
          role?: 'user' | 'seller' | 'admin' | 'moderator'
          status?: 'active' | 'suspended' | 'banned' | 'deleted'
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          icon: string | null
          icon_url: string | null
          description: string | null
          display_order: number
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          icon?: string | null
          icon_url?: string | null
          description?: string | null
          display_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          icon?: string | null
          icon_url?: string | null
          description?: string | null
          display_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          title: string
          description: string | null
          price: number
          original_price: number | null
          currency: string
          brand: string | null
          size: string | null
          color: string | null
          material: string | null
          condition: 'new_with_tags' | 'new_without_tags' | 'like_new' | 'very_good' | 'good' | 'fair' | null
          images: string[] | null
          thumbnail_url: string | null
          location: string | null
          city: string | null
          postal_code: string | null
          shipping_available: boolean
          shipping_price: number
          shipping_methods: string[] | null
          status: 'draft' | 'active' | 'sold' | 'reserved' | 'expired' | 'deleted'
          is_featured: boolean
          is_promoted: boolean
          view_count: number
          like_count: number
          share_count: number
          tags: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
          sold_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          title: string
          description?: string | null
          price: number
          original_price?: number | null
          currency?: string
          brand?: string | null
          size?: string | null
          color?: string | null
          material?: string | null
          condition?: 'new_with_tags' | 'new_without_tags' | 'like_new' | 'very_good' | 'good' | 'fair' | null
          images?: string[] | null
          thumbnail_url?: string | null
          location?: string | null
          city?: string | null
          postal_code?: string | null
          shipping_available?: boolean
          shipping_price?: number
          shipping_methods?: string[] | null
          status?: 'draft' | 'active' | 'sold' | 'reserved' | 'expired' | 'deleted'
          is_featured?: boolean
          is_promoted?: boolean
          view_count?: number
          like_count?: number
          share_count?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          sold_at?: string | null
          expires_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          price?: number
          original_price?: number | null
          currency?: string
          brand?: string | null
          size?: string | null
          color?: string | null
          material?: string | null
          condition?: 'new_with_tags' | 'new_without_tags' | 'like_new' | 'very_good' | 'good' | 'fair' | null
          images?: string[] | null
          thumbnail_url?: string | null
          location?: string | null
          city?: string | null
          postal_code?: string | null
          shipping_available?: boolean
          shipping_price?: number
          shipping_methods?: string[] | null
          status?: 'draft' | 'active' | 'sold' | 'reserved' | 'expired' | 'deleted'
          is_featured?: boolean
          is_promoted?: boolean
          view_count?: number
          like_count?: number
          share_count?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          sold_at?: string | null
          expires_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          listing_id: string | null
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          listing_id?: string | null
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          listing_id?: string | null
          content?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string | null
          rating: number
          comment: string | null
          is_buyer: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewed_id: string
          listing_id?: string | null
          rating: number
          comment?: string | null
          is_buyer?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewed_id?: string
          listing_id?: string | null
          rating?: number
          comment?: string | null
          is_buyer?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      increment_view_count: {
        Args: {
          listing_id: string
        }
        Returns: void
      }
    }
    Enums: {}
  }
}