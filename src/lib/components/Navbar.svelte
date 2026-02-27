<script lang="ts">
	import { page } from '$app/state';

	const navItems: { name: string; path: string }[] = [
		{ name: 'Home', path: '/' },
		{ name: 'Login', path: '/login' },
		{ name: 'Dashboard', path: '/dashboard' },
	];
</script>

<div>
	<ul>
		{#each navItems as navItem}
			<li class:active={navItem.path === page.url.pathname}>
				<a aria-label={navItem.name} href={navItem.path}>{navItem.name}</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	li {
		display: inline-block;
		gap: 20px;
		margin-inline: 10px;
		padding: 10px;
		transition: background-color 0.3s ease-in-out;
	}

	li:hover,
	.active {
		background-color: green;
	}

	div {
		background-color: palegreen;
	}
</style>
