<script lang="ts">
    let { stats, onTabChange, onFollowersModal, onFollowingModal } = $props();
</script>

<div class="profile-stats">
    <button class="stat-item" onclick={() => onTabChange('listings')}>
        <span class="stat-number">{stats.listings}</span>
        <span class="stat-label">posts</span>
    </button>
    <button class="stat-item" onclick={onFollowersModal}>
        <span class="stat-number">{stats.followers}</span>
        <span class="stat-label">followers</span>
    </button>
    <button class="stat-item" onclick={onFollowingModal}>
        <span class="stat-number">{stats.following}</span>
        <span class="stat-label">following</span>
    </button>
</div>

<style>
    .profile-stats {
        display: flex;
        align-items: center;
        gap: 40px;
        margin-bottom: 20px;
    }

    .stat-item {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .stat-number {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
    }

    .stat-label {
        font-size: 16px;
        color: #262626;
    }

    @media (max-width: 735px) {
        .profile-stats {
            gap: 20px;
            justify-content: space-around;
            border-top: 1px solid #efefef;
            padding-top: 16px;
        }

        .stat-item {
            flex-direction: column;
            gap: 2px;
        }
    }
</style>
