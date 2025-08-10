<script lang="ts">
	import { XCircle } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="rounded-2xl bg-white p-8 shadow-lg text-center">
			<div class="mb-4 flex justify-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
					<XCircle size={32} class="text-red-600" />
				</div>
			</div>
			
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
			<p class="text-gray-600 mb-6">
				There was an error authenticating your account. This could be because:
			</p>
			
			<ul class="text-left text-sm text-gray-600 mb-6 space-y-2">
				<li>• The verification link has expired</li>
				<li>• The link has already been used</li>
				<li>• There was a network error</li>
			</ul>
			
			<div class="space-y-3">
				<Button onclick={() => window.location.href = '/auth/signup'} class="w-full">
					Try Signing Up Again
				</Button>
				<Button variant="outline" onclick={() => window.location.href = '/auth/login'} class="w-full">
					Go to Login
				</Button>
			</div>
		</div>
	</div>
</div>