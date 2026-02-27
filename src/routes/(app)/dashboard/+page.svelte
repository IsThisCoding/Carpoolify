<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';
	import PlanCard from '$lib/components/PlanCard.svelte';

	let { data } = $props();
</script>

<div>
	<h1>dashboard</h1>
	<h2>{data.user.id}</h2>
	<form
		method="post"
		action="?/createPlan"
		use:enhance={() =>
			async ({ result, update }) => {
				if (result.type === 'failure') {
					alert('Could not delete plan!');
				}
				await update();
			}}
	>
		<button type="submit">Name and create a new plan</button>
		<input type="text" name="planName" />
	</form>

	<div class="planCardContainer">
		{#each data.plans as plan (plan.id)}
			<li in:fly={{ y: 20, duration: 100 }} out:slide>
				<PlanCard {plan} />
			</li>
		{/each}
	</div>
</div>

<button onclick={() => console.log(data)}>ooop</button>

<style>
	.planCardContainer {
		display: flex;
		flex-wrap: wrap;
	}
</style>
