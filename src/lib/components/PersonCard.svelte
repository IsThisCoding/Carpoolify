<script lang="ts">
	import { people } from '$lib/server/db/schema';

	let { person }: { person: typeof people.$inferSelect } = $props();
</script>

<div>
	<h3>{person.name}</h3>
	<p>{person.address}</p>
</div>
