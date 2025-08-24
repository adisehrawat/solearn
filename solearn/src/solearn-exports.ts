import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolearnIDL from './solearn.json'
import type { Solearn } from './solearn'

export { Solearn, SolearnIDL }

export const SOLEARN_PROGRAM_ID = new PublicKey(SolearnIDL.address)

export function getSoleanProgram(provider: AnchorProvider, address?: PublicKey): Program<Solearn> {
  return new Program({ ...SolearnIDL, address: address ? address.toBase58() : SolearnIDL.address } as Solearn, provider)
}

export function getSolmineaProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return new PublicKey('3J4pJELCCwVFjD58iBUUa46pmrZNXwkWGwQkYm8pAc4j')
    case 'mainnet-beta':
    default:
      return SOLEARN_PROGRAM_ID
  }
}
