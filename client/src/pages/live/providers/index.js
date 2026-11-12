import { ProviderConnectedRoom, ProviderPreJoin } from './LiveKitRoomProvider'

const providers = {
  livekit: {
    PreJoin: ProviderPreJoin,
    ConnectedRoom: ProviderConnectedRoom,
  },
}

export const getLiveRoomProvider = (providerName) => providers[providerName] || null
