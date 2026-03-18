// src/CapsuleFactory.cairo
// ─────────────────────────────────────────────────────────────────────────────
// Factory — deploys one TimeCapsule contract per gift.
// Frontend calls createCapsule(). Factory:
//   1. Pulls ERC-20 tokens from caller (needs prior approve)
//   2. Deploys a new TimeCapsule via deploy_syscall
//   3. Calls initialize() + stake() on the new capsule
//   4. Emits CapsuleCreated(creator, capsule_address, ...)
//      → capsule_address is stored as capsuleId in localStorage
// ─────────────────────────────────────────────────────────────────────────────

use starknet::{ContractAddress, ClassHash};

#[starknet::interface]
trait IERC20<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
}

#[starknet::interface]
trait ITimeCapsuleInit<TState> {
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
}

#[starknet::interface]
trait ICapsuleFactory<TState> {
    fn createCapsule(
        ref self: TState,
        asset: ContractAddress,
        amount: u256,
        unlock_date: u64,
        recipient: ContractAddress,
        pool_contract: ContractAddress,
        group_gifting: bool,
    ) -> ContractAddress;
    fn set_capsule_class_hash(ref self: TState, class_hash: ClassHash);
    fn capsule_class_hash(self: @TState) -> ClassHash;
}

#[starknet::contract]
mod CapsuleFactory {
    use super::{
        ContractAddress, ClassHash, ICapsuleFactory, IERC20Dispatcher,
        IERC20DispatcherTrait, ITimeCapsuleInitDispatcher, ITimeCapsuleInitDispatcherTrait,
    };
    use starknet::{
        get_caller_address, get_contract_address, deploy_syscall,
    };
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        owner: ContractAddress,
        capsule_class_hash: ClassHash,
        deploy_count: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CapsuleCreated: CapsuleCreated,
    }

    #[derive(Drop, starknet::Event)]
    struct CapsuleCreated {
        #[key] creator: ContractAddress,
        #[key] capsule_address: ContractAddress,
        recipient: ContractAddress,
        asset: ContractAddress,
        amount: u256,
        unlock_date: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        capsule_class_hash: ClassHash,
    ) {
        self.owner.write(owner);
        self.capsule_class_hash.write(capsule_class_hash);
        self.deploy_count.write(0);
    }

    #[abi(embed_v0)]
    impl CapsuleFactoryImpl of ICapsuleFactory<ContractState> {

        fn createCapsule(
            ref self: ContractState,
            asset: ContractAddress,
            amount: u256,
            unlock_date: u64,
            recipient: ContractAddress,
            pool_contract: ContractAddress,
            group_gifting: bool,
        ) -> ContractAddress {
            let creator = get_caller_address();
            let this    = get_contract_address();

            // 1. Pull tokens from caller into factory
            let erc20 = IERC20Dispatcher { contract_address: asset };
            erc20.transfer_from(creator, this, amount);

            // 2. Deploy new TimeCapsule with unique salt
            let count = self.deploy_count.read();
            self.deploy_count.write(count + 1);
            let salt: felt252 = count.into();

            let empty_calldata: Array<felt252> = ArrayTrait::new();
            let (capsule_address, _) = deploy_syscall(
                self.capsule_class_hash.read(),
                salt,
                empty_calldata.span(),
                false,
            ).expect('Deploy failed');

            // 3. Transfer tokens to the capsule contract
            erc20.transfer(capsule_address, amount);

            // 4. Initialize + stake
            let capsule = ITimeCapsuleInitDispatcher { contract_address: capsule_address };
            capsule.initialize(
                creator,
                recipient,
                asset,
                amount,
                unlock_date,
                pool_contract,
                group_gifting,
            );
            capsule.stake(amount);

            // 5. Emit event (frontend parses capsule_address as capsuleId)
            self.emit(CapsuleCreated {
                creator,
                capsule_address,
                recipient,
                asset,
                amount,
                unlock_date,
            });

            capsule_address
        }

        fn set_capsule_class_hash(ref self: ContractState, class_hash: ClassHash) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            self.capsule_class_hash.write(class_hash);
        }

        fn capsule_class_hash(self: @ContractState) -> ClassHash {
            self.capsule_class_hash.read()
        }
    }
}
