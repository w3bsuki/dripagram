<script lang="ts">
	import type { PayoutData } from './types.js';

	let {
		payoutData,
	}: {
		payoutData: PayoutData;
	} = $props();
</script>

<div class="payout-methods">
	<label class="payout-option">
		<input type="radio" bind:group={payoutData.method} value="bank" name="payout" />
		<div class="option-content">
			<div class="option-icon">🏦</div>
			<div class="option-text">
				<h4>Bank Transfer</h4>
				<p>Direct deposit to your bank account</p>
			</div>
		</div>
	</label>

	<label class="payout-option">
		<input type="radio" bind:group={payoutData.method} value="revolut" name="payout" />
		<div class="option-content">
			<div class="option-icon">💳</div>
			<div class="option-text">
				<h4>Revolut</h4>
				<p>Fast transfers to your Revolut account</p>
			</div>
		</div>
	</label>
</div>

{#if payoutData.method === 'bank'}
	<div class="bank-details">
		<div class="form-group">
			<label for="bank_name">Bank Name</label>
			<input
				id="bank_name"
				type="text"
				bind:value={payoutData.bank_name}
				placeholder="UniCredit Bulbank"
				class="input-field"
			/>
		</div>

		<div class="form-group">
			<label for="iban">IBAN</label>
			<input
				id="iban"
				type="text"
				bind:value={payoutData.iban}
				placeholder="BG00 UNCR 0000 0000 0000 00"
				class="input-field"
			/>
		</div>

		<div class="form-group">
			<label for="account_holder">Account Holder Name</label>
			<input
				id="account_holder"
				type="text"
				bind:value={payoutData.account_holder}
				placeholder="As it appears on your bank account"
				class="input-field"
			/>
		</div>
	</div>
{/if}

<style>
	.payout-methods {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.payout-option {
		position: relative;
		cursor: pointer;
	}

	.payout-option input[type='radio'] {
		position: absolute;
		opacity: 0;
	}

	.option-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		transition: all 0.2s;
	}

	.payout-option input:checked + .option-content {
		border-color: var(--color-primary);
		background: var(--color-interactive-primary) / 5;
	}

	.option-icon {
		font-size: 2rem;
	}

	.option-text h4 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.option-text p {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.bank-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.input-field {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 1rem;
		color: var(--color-text-primary);
		transition: all 0.2s;
	}

	.input-field:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-interactive-primary) / 10;
	}
</style>
