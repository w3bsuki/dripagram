<script lang="ts">
	import { ProductGrid } from './ProductGrid';
	import type { ProductGridProps } from './ProductGrid';

	// Re-export props interface for backward compatibility
	interface Props extends ProductGridProps {}
	let props: Props = $props();
</script>

<ProductGrid {...props} />

