import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Splyt',
  projectId:"0a85f801c3884855cf27da6a0b13f576",
  chains: [arbitrumSepolia],
  ssr: true,
})
