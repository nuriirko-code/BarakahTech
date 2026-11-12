import { LiveKitRoom, PreJoin, RoomAudioRenderer, StartAudio, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'

export const ProviderPreJoin = ({ defaults, onSubmit, onError, preJoinKey }) => (
  <PreJoin
    key={preJoinKey}
    defaults={defaults}
    onSubmit={onSubmit}
    onError={onError}
    joinLabel="Join session"
  />
)

export const ProviderConnectedRoom = ({
  access,
  choices,
  onConnected,
  onDisconnected,
  onError,
  onMediaDeviceFailure,
}) => (
  <div className="relative min-h-0 flex-1" data-lk-theme="default">
    <LiveKitRoom
      serverUrl={access.serverUrl}
      token={access.token}
      connect
      audio={choices?.audioEnabled ? { deviceId: choices.audioDeviceId } : false}
      video={choices?.videoEnabled ? { deviceId: choices.videoDeviceId } : false}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      onError={onError}
      onMediaDeviceFailure={onMediaDeviceFailure}
      className="h-full"
    >
      <VideoConference />
      <RoomAudioRenderer />
      <StartAudio
        label="Click to enable session audio"
        className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-amber-300"
      />
    </LiveKitRoom>
  </div>
)
