<script lang="ts">
	let { 
		children, 
		for: htmlFor,
		class: className = '',
		...props 
	}: {
		children: any;
		for?: string;
		class?: string;
		[key: string]: any;
	} = $props();
</script>

<label 
	{...props}
	for={htmlFor}
	class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 {className}"
>
	{@render children()}
</label>