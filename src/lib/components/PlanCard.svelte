<script lang="ts">
	import type { Plan } from '$lib/server/db/types';
	import Fa from 'svelte-fa';
	import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';

	let { plan }: { plan: Plan } = $props();

	function genDateDisplayString(date: Date) {
		const options: Intl.DateTimeFormatOptions = {};
		if (date.getDay() == new Date().getDay()) {
			const dateStr = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
			return `Last edited at ${dateStr}`;
		} else {
			const dateStr = date.toLocaleString('en-US', {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
			});
			return `Last edited on ${dateStr}`;
		}
	}
</script>

<div>
	<h1>{plan.name}</h1>
	<h2>{genDateDisplayString(plan.editedAt)}</h2>
	<form
		method="POST"
		action="/dashboard?/deletePlan"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'failure') {
					alert(`Could not delete plan: ${result.data?.message}`);
				}
				await update();
			};
		}}
	>
		<input type="hidden" name="id" value={plan.id} />
		<button type="submit">
			<Fa icon={faTrash} />
		</button>
	</form>
	<form action="/dashboard?/editPlan" method="POST" use:enhance>
		<input type="hidden" value={plan.id} name="id" />
		<button aria-label="edit" color="green" type="submit"><Fa icon={faEdit} /></button>
	</form>
</div>

<style>
	div {
		padding: 2px 10px;
		margin: 1em;
		border: 1px solid black;
	}
</style>
