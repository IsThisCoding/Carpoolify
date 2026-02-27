<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let selectedDriverId = $state('');
	let selectedPassengerIds = $state<string[]>([]);

	const assignedIds = $derived(
		new Set([
			...data.drivingGroups.map((g) => g.driverId),
			...data.drivingGroups.flatMap((g) => g.passengers.map((p) => p.personId)),
		]),
	);

	const availablePeople = $derived(data.allPeople.filter((person) => !assignedIds.has(person.id)));
</script>

<div class="space-y-8 p-4">
	<section>
		<h2 class="border-b pb-2 text-xl font-bold">Active Groups ({data.drivingGroups.length})</h2>
		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each data.drivingGroups as group}
				<div class="rounded-lg border bg-slate-50 p-4 shadow-sm">
					<p class="mb-2 font-mono text-xs text-slate-400">Group ID: {group.id}</p>
					<p><strong>Driver:</strong> {group.driver?.name ?? 'Unassigned'}</p>
					<p><strong>Passengers:</strong> {group.passengers.length} / {group.capacity}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="rounded-xl border border-blue-100 bg-white p-6 shadow-md">
		<h2 class="mb-4 text-xl font-bold text-blue-800">Create New Group</h2>

		<form action="?/createGroup" method="post" use:enhance>
			<div class="space-y-4">
				<div>
					<label class="mb-1 block font-medium">Select Driver:</label>
					<select name="driverId" bind:value={selectedDriverId} class="w-full rounded border p-2">
						<option value="">-- Choose a driver --</option>
						{#each availablePeople.filter((p) => !selectedPassengerIds.includes(p.id)) as person}
							<option value={person.id}>{person.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="mb-2 block font-medium">Select Passengers:</label>
					<div class="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded border p-3">
						{#each availablePeople.filter((p) => p.id !== selectedDriverId) as person}
							<label
								class="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-slate-50"
							>
								<input
									type="checkbox"
									name="passengerIds"
									value={person.id}
									bind:group={selectedPassengerIds}
								/>
								<span>{person.name}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="flex items-center space-x-4">
					<div class="flex-1">
						<label class="block text-sm">Car Capacity:</label>
						<input
							type="number"
							min="1"
							name="capacity"
							value="4"
							class="w-full rounded border p-2"
						/>
					</div>
					<button
						type="submit"
						class="mt-5 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
					>
						Create Group
					</button>
				</div>
			</div>
		</form>
	</section>

	<section class="border-t pt-8">
		<h3 class="mb-4 text-lg font-semibold text-slate-600">Add a New Person to the Pool</h3>
		<form method="post" action="?/createPerson" use:enhance class="flex gap-2">
			<input
				type="text"
				name="name"
				placeholder="Name"
				class="flex-1 rounded border p-2"
				required
			/>
			<input
				type="text"
				name="address"
				placeholder="Address/Location"
				class="flex-1 rounded border p-2"
			/>
			<button class="rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-900">Add</button>
		</form>
	</section>

	<section>
		<h2>Current Groups</h2>
	</section>
</div>
