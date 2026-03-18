// src/TimeCapsule.cairo
// ─────────────────────────────────────────────────────────────────────────────
// Individual time-capsule contract. One deployed per gift.
// Deployed + initialised by CapsuleFactory.
//
// Staking uses Starknet's native delegation pool protocol (STRK staking).
// Pool contract address passed in from the factory (use sepoliaValidators preset
// from Starkzap SDK to find the pool).
//
// Scarb.toml:
//   [package]
//   name = "timecapsule"
//   version = "0.1.0"
//   cairo-version = "2.8.0"
//
//   [dependencies]
//   starknet = ">=2.8.0"
// ─────────────────────────────────────────────────────────────────────────────

use starknet::ContractAddress;

// ─── ERC-20 interface (minimal) ───────────────────────────────────────────────
#[starknet::interface]
trait IERC20<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
    fn approve(ref self: TState, spender: ContractAddress, amount: u256) -> bool;
}

// ─── Starknet native delegation pool interface ────────────────────────────────
#[starknet::interface]
trait IDelegationPool<TState> {
    fn enter_delegation_pool(
        ref self: TState, reward_address: ContractAddress, amount: u256,
    );
    fn add_to_delegation_pool(
        ref self: TState, pool_member: ContractAddress, amount: u256,
    ) -> u256;
    fn exit_delegation_pool_intent(ref self: TState, amount: u256);
    fn exit_delegation_pool_action(ref self: TState, pool_member: ContractAddress) -> u256;
    fn pool_member_info(self: @TState, pool_member: ContractAddress) -> PoolMemberInfo;
}

#[derive(Drop, Serde, Copy, starknet::Store)]
struct PoolMemberInfo {
    reward_address: ContractAddress,
    amount: u256,
    index: u256,
    unclaimed_rewards: u256,
    commission: u16,
    unpool_amount: u256,
    unpool_time: u64,
}

// ─── Public interface ─────────────────────────────────────────────────────────
#[starknet::interface]
trait ITimeCapsule<TState> {
    fn initialize(
        ref self: TState,
        creator: ContractAddress,
        recipient: ContractAddress,
        asset: ContractAddress,
        principal: u256,
        unlock_date: u64,
        pool_contract: ContractAddress,
        group_gifting: bool,
    );
    fn stake(ref self: TState, amount: u256);
    fn contribute(ref self: TState, asset: ContractAddress, amount: u256);
    fn claim(ref self: TState);
    fn get_balance(self: @TState) -> (u256, u256);
}

// ─── Contract ─────────────────────────────────────────────────────────────────
#[starknet::contract]
mod TimeCapsule {
    use super::{
        ContractAddress, IDelegationPoolDispatcher, IDelegationPoolDispatcherTrait,
        IERC20Dispatcher, IERC20DispatcherTrait, ITimeCapsule, PoolMemberInfo,
    };
    use starknet::{get_block_timestamp, get_caller_address, get_contract_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        creator: ContractAddress,
        recipient: ContractAddress,
        asset: ContractAddress,
        principal: u256,
        unlock_date: u64,
        is_claimed: bool,
        group_gifting: bool,
        pool_contract: ContractAddress,
        initialized: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Staked: Staked,
        Contributed: Contributed,
        Claimed: Claimed,
    }

    #[derive(Drop, starknet::Event)]
    struct Staked {
        #[key] capsule: ContractAddress,
        amount: u256,
        asset: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct Contributed {
        #[key] contributor: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Claimed {
        #[key] recipient: ContractAddress,
        total: u256,
        timestamp: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {}

    #[abi(embed_v0)]
    impl TimeCapsuleImpl of ITimeCapsule<ContractState> {

        fn initialize(
            ref self: ContractState,
            creator: ContractAddress,
            recipient: ContractAddress,
            asset: ContractAddress,
            principal: u256,
            unlock_date: u64,
            pool_contract: ContractAddress,
            group_gifting: bool,
        ) {
            assert(!self.initialized.read(), 'Already initialized');
            assert(unlock_date > get_block_timestamp(), 'Unlock must be future');
            self.creator.write(creator);
            self.recipient.write(recipient);
            self.asset.write(asset);
            self.principal.write(principal);
            self.unlock_date.write(unlock_date);
            self.pool_contract.write(pool_contract);
            self.group_gifting.write(group_gifting);
            self.initialized.write(true);
        }

        // Called by factory right after initialize + token transfer.
        // Approves pool and enters delegation.
        fn stake(ref self: ContractState, amount: u256) {
            assert(self.initialized.read(), 'Not initialized');
            let this       = get_contract_address();
            let pool_addr  = self.pool_contract.read();
            let asset_addr = self.asset.read();

            let erc20 = IERC20Dispatcher { contract_address: asset_addr };
            erc20.approve(pool_addr, amount);

            let pool = IDelegationPoolDispatcher { contract_address: pool_addr };
            // Rewards accumulate back to this contract address
            pool.enter_delegation_pool(this, amount);

            self.emit(Staked { capsule: this, amount, asset: asset_addr });
        }

        fn contribute(ref self: ContractState, asset: ContractAddress, amount: u256) {
            assert(self.initialized.read(), 'Not initialized');
            assert(self.group_gifting.read(), 'Group gifting disabled');
            assert(!self.is_claimed.read(), 'Already claimed');
            assert(get_block_timestamp() < self.unlock_date.read(), 'Capsule unlocked');
            assert(asset == self.asset.read(), 'Wrong asset');

            let caller    = get_caller_address();
            let this      = get_contract_address();
            let pool_addr = self.pool_contract.read();

            let erc20 = IERC20Dispatcher { contract_address: asset };
            erc20.transfer_from(caller, this, amount);
            erc20.approve(pool_addr, amount);

            let pool = IDelegationPoolDispatcher { contract_address: pool_addr };
            pool.add_to_delegation_pool(this, amount);

            let new_principal = self.principal.read() + amount;
            self.principal.write(new_principal);

            self.emit(Contributed { contributor: caller, amount });
        }

        fn claim(ref self: ContractState) {
            assert(self.initialized.read(), 'Not initialized');
            assert(!self.is_claimed.read(), 'Already claimed');
            assert(get_block_timestamp() >= self.unlock_date.read(), 'Still locked');

            let recipient = self.recipient.read();
            let this      = get_contract_address();
            let pool_addr = self.pool_contract.read();

            let pool = IDelegationPoolDispatcher { contract_address: pool_addr };

            // Get full staked amount + rewards
            let info   = pool.pool_member_info(this);
            let staked = info.amount + info.unclaimed_rewards;

            // Two-step exit
            pool.exit_delegation_pool_intent(staked);
            let total = pool.exit_delegation_pool_action(this);

            // Transfer everything to recipient
            let erc20 = IERC20Dispatcher { contract_address: self.asset.read() };
            erc20.transfer(recipient, total);

            self.is_claimed.write(true);
            self.emit(Claimed { recipient, total, timestamp: get_block_timestamp() });
        }

        // Returns (principal, current_value_including_yield)
        fn get_balance(self: @ContractState) -> (u256, u256) {
            let principal = self.principal.read();
            if !self.initialized.read() {
                return (principal, principal);
            }
            let pool = IDelegationPoolDispatcher {
                contract_address: self.pool_contract.read(),
            };
            let info    = pool.pool_member_info(get_contract_address());
            let current = info.amount + info.unclaimed_rewards;
            (principal, current)
        }
    }
}
