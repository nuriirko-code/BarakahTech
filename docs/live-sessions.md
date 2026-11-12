# How live sessions work

Barakah Academy uses one shared live-room flow for tutoring and community meetings, including course mentorship sessions. Video-provider-specific code is isolated behind server and client adapters; `LIVE_PROVIDER` selects the provider.

## Access flow

1. A Join button uses `client/src/config/live.js` and `liveRoomPath(type, id)` to navigate to `/live/:type/:id`.
2. `LiveRoomPage` calls `POST /api/live/:type/:id/access` with the signed-in user's token. It displays a waiting or denial state if the server says the room is not available yet or the user is not eligible.
3. The server's `getLiveAccess` service in `server/services/liveRoom/index.js` finds the matching resolver. A resolver checks that session type's participant, payment, status, and time rules, then returns the common room-access data shape.
4. If access is allowed, the selected server adapter issues a provider-specific short-lived join credential and returns a normalized configuration containing `provider` and the provider's join fields. The browser never creates tokens or receives provider secrets.
5. `LiveRoomPage` selects the matching client adapter for pre-join and room rendering. Leaving takes the participant to the next URL supplied by the server.

## Changing video providers

- To move between LiveKit Cloud and another LiveKit-compatible deployment, keep `LIVE_PROVIDER=livekit` and change `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
- `LIVE_PROVIDER` currently supports only `livekit`. Choosing an unrelated provider such as Zoom, Google Meet, Daily, or Agora requires implementing that provider's server adapter in `server/services/liveRoom/providers/` and its browser adapter in `client/src/pages/live/providers/`. These services use different token formats, SDKs, meeting lifecycle APIs, and sometimes different user join experiences; they cannot be switched by changing credentials alone.
- Add each adapter to its corresponding registry. Both adapters must preserve the shared access checks and return/consume the normalized access fields. Unsupported providers fail explicitly.
- A provider being free or having a free tier is a separate pricing/usage-policy question; do not assume any provider is permanently free or allows unlimited concurrent participants.

## Resolver responsibilities

Each resolver owns the rules that are unique to its session type:

- `server/services/liveRoom/resolvers/booking.js` checks that the student or tutor belongs to a confirmed booking and that its join window is open.
- `server/services/liveRoom/resolvers/community.js` checks community registration, host/admin permissions, and the community session window. Course mentorship uses this resolver because it is a `CommunitySession` with its course teacher as host and registered students as participants.

Expected denials are returned as response codes such as `TOO_EARLY`, `NOT_PAID`, and `NOT_PARTICIPANT`; they are not server exceptions. The access controller maps those codes to HTTP status codes and does not return a token on denial.

## Adding a session type

1. Create a resolver with the same `resolve(sessionId, user)` interface and return the shared access fields (`allowed`, `code`, `message`, `opensAt`, `roomName`, `title`, `startsAt`, `closesAt`, `isModerator`, and `nextUrl`).
2. Register the resolver by type in `server/services/liveRoom/index.js`. Keep authorization and timing rules in the resolver rather than duplicating them in buttons.
3. Add a Join button that navigates with `liveRoomPath(newType, sessionId)`. `LiveRoomPage` and the access endpoint stay shared.

Room names should be derived from stable session IDs rather than stored separately. This keeps room identity aligned with the session record and avoids maintaining a second mapping.
