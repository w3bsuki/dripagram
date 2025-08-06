<script lang="ts">
	import type { Preferences } from './types.js';

	let {
		preferences,
	}: {
		preferences: Preferences;
	} = $props();
</script>

<div class="preferences-section">
	<h3>Notifications</h3>
	<div class="preference-group">
		<label class="preference-item">
			<input type="checkbox" bind:checked={preferences.notifications.email} />
			<div class="preference-text">
				<h4>Email Notifications</h4>
				<p>Get updates about your orders and messages</p>
			</div>
		</label>

		<label class="preference-item">
			<input type="checkbox" bind:checked={preferences.notifications.push} />
			<div class="preference-text">
				<h4>Push Notifications</h4>
				<p>Real-time alerts on your device</p>
			</div>
		</label>

		<label class="preference-item">
			<input type="checkbox" bind:checked={preferences.notifications.sms} />
			<div class="preference-text">
				<h4>SMS Notifications</h4>
				<p>Important updates via text message</p>
			</div>
		</label>
	</div>

	<h3>Privacy</h3>
	<div class="preference-group">
		<label class="preference-item">
			<input type="checkbox" bind:checked={preferences.privacy.show_online_status} />
			<div class="preference-text">
				<h4>Show Online Status</h4>
				<p>Let others see when you're active</p>
			</div>
		</label>

		<label class="preference-item">
			<input type="checkbox" bind:checked={preferences.privacy.show_location} />
			<div class="preference-text">
				<h4>Show Location</h4>
				<p>Display your city on your profile</p>
			</div>
		</label>
	</div>

	<h3>Marketing</h3>
	<div class="preference-group">
		<label class="preference-item">
			<input type="checkbox" bind:checked={preferences.newsletter} />
			<div class="preference-text">
				<h4>Newsletter</h4>
				<p>Receive tips, trends, and exclusive offers</p>
			</div>
		</label>
	</div>
</div>

<style>
	.preferences-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.preferences-section h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
	}

	.preference-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preference-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		cursor: pointer;
		padding: 1rem;
		background: var(--color-surface);
		border-radius: 8px;
		transition: all 0.2s;
	}

	.preference-item:hover {
		background: var(--color-gray-50);
	}

	.preference-item input[type='checkbox'] {
		margin-top: 0.25rem;
	}

	.preference-text h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.preference-text p {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
</style>
