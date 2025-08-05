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
          phone: string | null
          address: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: Json
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          price: number
          currency: string
          category_id: string | null
          brand: string | null
          condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable' | null
          size: string | null
          color: string | null
          images: Json
          tags: string[]
          status: 'active' | 'sold' | 'reserved' | 'draft' | 'deleted'
          views: number
          likes: number
          location: Json
          shipping_options: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          price: number
          currency?: string
          category_id?: string | null
          brand?: string | null
          condition?: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable' | null
          size?: string | null
          color?: string | null
          images?: Json
          tags?: string[]
          status?: 'active' | 'sold' | 'reserved' | 'draft' | 'deleted'
          views?: number
          likes?: number
          location?: Json
          shipping_options?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string | null
          price?: number
          currency?: string
          category_id?: string | null
          brand?: string | null
          condition?: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable' | null
          size?: string | null
          color?: string | null
          images?: Json
          tags?: string[]
          status?: 'active' | 'sold' | 'reserved' | 'draft' | 'deleted'
          views?: number
          likes?: number
          location?: Json
          shipping_options?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          added_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          added_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          added_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          total_amount: number
          currency: string
          shipping_address: Json
          billing_address: Json | null
          payment_method: string | null
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          buyer_id: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          total_amount: number
          currency?: string
          shipping_address: Json
          billing_address?: Json | null
          payment_method?: string | null
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          buyer_id?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          total_amount?: number
          currency?: string
          shipping_address?: Json
          billing_address?: Json | null
          payment_method?: string | null
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          seller_id: string | null
          title: string
          price: number
          quantity: number
          subtotal: number
          product_snapshot: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          seller_id?: string | null
          title: string
          price: number
          quantity?: number
          product_snapshot?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          seller_id?: string | null
          title?: string
          price?: number
          quantity?: number
          product_snapshot?: Json | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      product_views: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}