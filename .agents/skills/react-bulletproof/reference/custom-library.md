# Custom library structure

A custom library is a self-contained, framework-light module under `src/lib/<lib>/` that owns one capability (websocket, push notifications, pdf, browser detection). React is an adapter on top, not the core.

This file covers where library files go and how they are named. How to write the classes inside (interfaces, constructor injection, method naming, generics) is in the `typescript-oop` skill.

## Layout

Small lib (one class): a single file, `src/lib/pdf/pdf.ts`.

Bigger lib:

```
src/lib/websocket/
├── README.md                          # setup, usage, behavior, testing (short)
├── index.ts                           # public API: re-exports only
├── transport.types.ts                 # all shared types/interfaces of the lib
├── websocket-backoff.ts               # class WebSocketBackoffCalculator
├── websocket-heartbeat-monitor.ts     # class WebSocketHeartbeatMonitor
├── websocket-listener-registry.ts     # class WebSocketListenerRegistry<T>
├── websocket-reconnect-scheduler.ts   # class WebSocketReconnectScheduler
├── websocket-transport.ts             # class WebSocketTransport implements Transport
├── websocket-connection-manager.ts    # composition root: wires singletons, start/stop
├── react/                             # React adapter
│   ├── websocket-context.tsx          # createContext
│   ├── websocket-provider.tsx         # <Provider>
│   └── hooks.ts                       # useX hooks over the class instance
└── test-utils/
    └── fake-transport.ts              # fake implementing the interface, for consumers' tests
```

Layered variant (push-notification): `core/` (emitter, store, service), `domain/` (envelope parsing), `pwa/` or `<platform>/` (browser APIs), `services/` (HTTP), `react/` (adapter), `composition-root.ts` (wires everything), `index.ts`.

## Rules

1. **One class per file**, file name in kebab-case matching the class, prefixed with the lib name when the class is lib-specific (`websocket-heartbeat-monitor.ts`).
2. **Types grouped** in `<lib>.types.ts`, `<lib-specific>.d.ts` or `types/index.d.ts`.
3. **`index.ts` is the only entry point.** It re-exports the public classes/singletons, provider, hooks, and `export type` for public types. Consumers import `@/lib/<lib>`, never inner files (tests excepted).
4. **Composition root** (`<lib>-connection-manager.ts` or `composition-root.ts`) creates the singleton instances, wires them together and exposes `start()` / `stop()`. Nothing else instantiates the core.
5. **React lives in `react/`**: one file for the context, one for the provider, one `hooks.ts`. The core files never import React.
6. **Fakes for consumers** live in `test-utils/` and implement the lib's public interface.
7. **README.md** for any lib with more than one file: Setup, Usage in components, Behavior to know, Testing. Under ~60 lines.
8. **Tests** mirror the lib: `test/lib/<lib>/<file>.test.ts`.

## React adapter

```ts
// react/hooks.ts
const useTransport = () => {
  const transport = useContext(WebSocketContext)
  if (!transport) throw new Error('Websocket hooks must be used within <WebSocketProvider>')
  return transport
}

export const useConnectionStatus = (): ConnectionStatus => {
  const transport = useTransport()
  return useSyncExternalStore(
    (onStoreChange) => transport.onStatus(onStoreChange),
    () => transport.getStatus(),
  )
}
```

- Subscribe to class state with `useSyncExternalStore`.
- Keep handlers fresh with a ref (`handlerRef.current = handler`) and subscribe once per instance.
- The provider takes the instance as a prop so tests can pass a fake.
- Hooks throw a clear error when used outside the provider.

## Builders in utils

Fluent builders get their own folder: `src/utils/<name>-builder/{index.ts,<name>-builder.ts}`. `index.ts` exports the factory (`createPayload<T>()`) and the class.

## Checklist

- [ ] `src/lib/<lib>/index.ts` exports only the public surface
- [ ] one class per file, kebab-case names
- [ ] types grouped in `<lib>.types.ts` / `.d.ts`
- [ ] composition root owns instantiation
- [ ] React only under `react/`
- [ ] README.md (if more than one file)
- [ ] `test/lib/<lib>/*.test.ts` per class, fakes in `test-utils/` if consumers need them
