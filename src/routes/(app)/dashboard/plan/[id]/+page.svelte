<script lang="ts">
	import { enhance } from '$app/forms';
	import GroupCard from '$lib/components/GroupCard.svelte';

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

<div class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-7xl">
		<header class="mb-10 text-center sm:text-left">
			<h1 class="text-4xl font-extrabold tracking-tight text-slate-900">Carpool Planning</h1>
			<p class="mt-2 text-lg text-slate-600">Organize drivers and passengers effectively.</p>
		</header>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Main Left Column -->
			<div class="space-y-8 lg:col-span-2">
				<!-- Active Groups -->
				<section>
					<div class="mb-6 flex items-center justify-between border-b pb-4">
						<h2 class="flex items-center gap-3 text-2xl font-bold text-slate-800">
							<span class="flex items-center justify-center rounded-lg bg-blue-600 p-2 text-white">
								<svg
									class="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									></path></svg
								>
							</span>
							Active Groups
							<span class="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700"
								>{data.drivingGroups.length}</span
							>
						</h2>
					</div>

					{#if data.drivingGroups.length === 0}
						<div class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
							<p class="font-medium text-slate-500">
								No groups created yet. Start by creating one below.
							</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							{#each data.drivingGroups as group}
								<GroupCard
									{group}
									allPeople={data.allPeople}
									otherGroups={data.drivingGroups.filter((g) => g.id !== group.id)}
								/>
							{/each}
						</div>
					{/if}
				</section>

				<!-- Unassigned Pool -->
				<section class="mt-12">
					<h3 class="mb-6 text-xl font-bold text-slate-800">Available People</h3>
					<div class="flex flex-wrap gap-3">
						{#each availablePeople as person (person.id)}
							<div
								class="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm"
							>
								<div
									class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600"
								>
									{person.name.charAt(0).toUpperCase()}
								</div>
								<span class="text-sm font-medium text-slate-700">{person.name}</span>
							</div>
						{/each}
						{#if availablePeople.length === 0}
							<p class="text-sm text-slate-500 italic">Everyone has been assigned!</p>
						{/if}
					</div>
				</section>
			</div>

			<!-- Right Column (Forms) -->
			<div class="space-y-8">
				<!-- Create Group Form -->
				<div
					class="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50"
				>
					<div
						class="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500"
					></div>
					<h3 class="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
						<svg class="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							></path></svg
						>
						Create New Group
					</h3>

					<form action="?/createGroup" method="post" use:enhance class="space-y-5">
						<div>
							<label class="mb-2 block text-sm font-semibold text-slate-700">Select Driver</label>
							<select
								name="driverId"
								bind:value={selectedDriverId}
								class="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
							>
								<option value="" disabled selected>-- Choose a driver --</option>
								{#each availablePeople.filter((p) => !selectedPassengerIds.includes(p.id)) as person}
									<option value={person.id}>{person.name}</option>
								{/each}
							</select>
						</div>

						<div>
							<label class="mb-2 block text-sm font-semibold text-slate-700"
								>Select Passengers</label
							>
							<div class="max-h-48 space-y-2 overflow-y-auto p-1">
								{#each availablePeople.filter((p) => p.id !== selectedDriverId) as person}
									<label
										class="flex cursor-pointer items-center rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
									>
										<input
											type="checkbox"
											name="passengerIds"
											value={person.id}
											bind:group={selectedPassengerIds}
											class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class="ml-3 text-sm font-medium text-slate-700">{person.name}</span>
									</label>
								{/each}
								{#if availablePeople.filter((p) => p.id !== selectedDriverId).length === 0}
									<p class="py-2 text-center text-sm text-slate-500">No available passengers.</p>
								{/if}
							</div>
						</div>

						<div>
							<label class="mb-2 block text-sm font-semibold text-slate-700">Car Capacity</label>
							<input
								type="number"
								min="1"
								name="capacity"
								value="4"
								class="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
							/>
						</div>

						<button
							type="submit"
							class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-95"
						>
							Launch Group
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								></path></svg
							>
						</button>
					</form>
				</div>

				<!-- Add Person Form -->
				<div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/50">
					<h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
						<svg
							class="h-5 w-5 text-emerald-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							></path></svg
						>
						Add Person to Pool
					</h3>
					<form method="post" action="?/createPerson" use:enhance class="space-y-4">
						<input
							type="text"
							name="name"
							placeholder="Full Name"
							class="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm transition-all outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
							required
						/>
						<input
							type="text"
							name="address"
							placeholder="Address or Location"
							class="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm transition-all outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
							required
						/>
						<button
							class="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95"
						>
							Add Person
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
