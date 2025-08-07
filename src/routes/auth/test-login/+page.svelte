<script lang="ts">
	import { page } from '$app/stores';
	import { toast } from '$lib/utils/toast';
	
	let testEmail = $state('user@test.local');
	let testPassword = $state('password123');
	let loading = $state(false);
	let result = $state('');

	async function testDirectLogin() {
		loading = true;
		result = 'Testing...';
		
		try {
			const response = await fetch('/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					email: testEmail,
					password: testPassword
				})
			});
			
			const responseText = await response.text();
			result = `Status: ${response.status}\nResponse: ${responseText.substring(0, 500)}...`;
			
			if (response.redirected) {
				result += `\nRedirected to: ${response.url}`;
			}
			
		} catch (error) {
			result = `Error: ${error}`;
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Login Debug Tool</h1>
	
	<div class="max-w-md space-y-4">
		<div>
			<label class="block mb-1">Email:</label>
			<input 
				type="email" 
				bind:value={testEmail}
				class="w-full p-2 border rounded"
				placeholder="test@example.com"
			/>
		</div>
		
		<div>
			<label class="block mb-1">Password:</label>
			<input 
				type="password" 
				bind:value={testPassword}
				class="w-full p-2 border rounded"
				placeholder="password"
			/>
		</div>
		
		<button 
			onclick={testDirectLogin}
			disabled={loading}
			class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
		>
			{loading ? 'Testing...' : 'Test Direct Login'}
		</button>
		
		{#if result}
			<div class="mt-4 p-4 bg-gray-100 rounded">
				<h3 class="font-semibold mb-2">Result:</h3>
				<pre class="text-sm whitespace-pre-wrap">{result}</pre>
			</div>
		{/if}
	</div>
</div>