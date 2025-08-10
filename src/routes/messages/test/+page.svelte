<script lang="ts">
	import { goto } from '$app/navigation';
	
	function testConversation() {
		// Use the existing conversation ID we know exists
		goto('/messages/dc4cc1df-bc55-4283-887a-c339f6b72882');
	}
</script>

<div style="padding: 2rem;">
	<h1>Test Messaging</h1>
	<p>Click the button to test accessing a known conversation:</p>
	<button onclick={testConversation} style="padding: 1rem; background: blue; color: white; border-radius: 8px;">
		Open Test Conversation
	</button>
	
	<p>Conversation ID: dc4cc1df-bc55-4283-887a-c339f6b72882</p>
	<p>Between: rawtwstl and w3bsuki</p>
</div>