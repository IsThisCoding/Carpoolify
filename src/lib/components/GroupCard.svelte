<script lang="ts">
	import { enhance } from '$app/forms';
	import type { DrivingGroupWithPassengersAndDriver } from '$lib/server/db/types';

	let { group, allPeople, otherGroups } = $props<{
		group: DrivingGroupWithPassengersAndDriver;
		allPeople: any[];
		otherGroups: DrivingGroupWithPassengersAndDriver[];
	}>();

	const passengers = $derived(
		group.passengers
			.map((p) => allPeople.find((person) => person.id === p.personId))
			.filter(Boolean),
	);

	const passengerCount = $derived(group.passengers.length + 1); // +1 for driver
	const capacity = $derived(group.capacity || 4);
	const isFull = $derived(passengerCount >= capacity);
</script>

<div
	class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md"
>
	<div class="mb-4 flex items-start justify-between">
		<div class="flex items-center space-x-3">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700"
			>
				{group.driver.name.charAt(0).toUpperCase()}
			</div>
			<div>
				<h3 class="text-lg font-semibold text-slate-800">{group.driver.name}</h3>
				<p class="text-sm font-medium text-slate-500">Driver</p>
			</div>
		</div>
		<div class="flex flex-col items-end">
			<span
				class={`rounded-full px-3 py-1 text-xs font-semibold ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
			>
				{passengerCount} / {capacity} Seats
			</span>
		</div>
	</div>

	{#if passengers.length > 0}
		<div class="mt-4 border-t border-slate-100 pt-4">
			<h4 class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">Passengers</h4>
			<ul class="space-y-2">
				{#each passengers as passenger}
					<li
						class="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-sm text-slate-700"
					>
						<div class="flex items-center space-x-2">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-500"
							>
								{passenger?.name.charAt(0).toUpperCase()}
							</div>
							<span>{passenger?.name}</span>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<div
			class="mt-4 flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 py-4"
		>
			<span class="text-sm text-slate-400">No passengers yet</span>
		</div>
	{/if}
</div>
