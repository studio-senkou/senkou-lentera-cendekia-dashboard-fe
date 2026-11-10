---
name: typescript-oop
description: Use when writing or reviewing a TypeScript class, custom library core, fluent builder, event emitter, store wrapper or other non-React domain logic in a React + TypeScript codebase. Enforces OOP-first design with advanced TypeScript (generics, constrained keys, mapped/literal types, interfaces, constructor injection), short behavior-named methods, one class per file and grouped type files. Triggers on "create a class", "write a lib", "builder", "refactor to OOP", "type this properly".
---

# TypeScript OOP

How to write the classes. Where they live (folder layout, `index.ts`, README, React adapter folder) is the `react-bulletproof` skill's job.

## Scope

- **Classes:** custom library cores (`src/lib/<lib>/`), fluent builders (`src/utils/<name>-builder/`), reusable domain logic.
- **Not classes:** React components and hooks (function components), feature services (plain async functions consumed by React Query), one-off pure helpers.

## Rules

1. **One class per file.** File name is the kebab-case of the class: `websocket-backoff.ts` holds `WebSocketBackoffCalculator`, `payload-builder.ts` holds `PayloadBuilder`.
2. **Types grouped, not scattered.** Shared interfaces and unions go in `<lib>.types.ts`, `<lib-specific>.d.ts` or `types/index.d.ts`. A class file may keep its own small options type (`BackoffOptions`) next to the class.
3. **Short, behavior-named methods.** A method name is the verb the object performs, usually 1-2 words, max 3: `connect`, `disconnect`, `send`, `add`, `notifyAll`, `emit`, `clear`, `build`, `blob`, `download`, `cancel`, `reset`, `computeDelay`. Not `handleConnectToSocketServer`, not `getBlobFromPdfDocument`. The class name supplies the noun, so don't repeat it (`transport.connect()`, not `transport.connectTransport()`). Private helpers follow the same rule: `closeSocket()`, `setStatus()`.
4. **Program to an interface.** The core class `implements` an exported interface (`class WebSocketTransport implements Transport`). Consumers and tests depend on the interface, so a fake can replace it.
5. **Inject dependencies through the constructor.** Browser globals, constructors and resolvers come in as options (`socketCtor`, `resolveUrl`) so tests run in `node` with fakes. Use parameter properties: `constructor(private readonly options: WebSocketTransportOptions) {}`.
6. **Encapsulate.** Mutable state is `private`; collaborators are `private readonly`; constants are `static readonly` (`static readonly DEFAULT`, `static readonly font`). Read state through methods (`getStatus()`), never public fields.
7. **Subscriptions return `Unsubscribe`.** Every `on*` / `add` returns `() => void`.
8. **Isolate listener failures.** Wrap each listener call in try/catch and log with a `[ClassName]` prefix, so one bad listener can't break the rest.
9. **Guard async races** with a generation counter: increment on connect/disconnect, and ignore callbacks whose captured generation is stale.
10. **Lazy-load heavy dependencies** inside the class (`await import('@react-pdf/renderer')`) and cache one-time setup behind a `private static ready` flag.
11. **No speculative hierarchy.** No abstract base class with one subclass, no interface that nothing fakes or swaps.

## Advanced TypeScript toolbox

Use these where they remove casts or encode invariants, not for decoration.

```ts
// Typed event map: the key constrains the payload
export class TypedEventEmitter<TEvents extends Record<string, unknown>> {
  private listeners = new Map<keyof TEvents, Set<(payload: never) => void>>()

  on<TKey extends keyof TEvents>(
    event: TKey,
    listener: (payload: TEvents[TKey]) => void,
  ): Unsubscribe { /* … */ }

  emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void { /* … */ }
}

// Fluent builder bound to a payload shape: keys and values checked per field
export class PayloadBuilder<T extends Record<string, PayloadValue>> {
  set<TKey extends keyof T>(key: TKey, value: T[TKey], options?: FieldOptions<T[TKey]>): this
  when(condition: boolean, callback: (builder: this) => void): this
  build(): T
}

// Constructor type as a dependency
export type SocketConstructor = new (url: string) => {
  send: (data: string) => void
  close: () => void
}

// Mapped type
type PartialShape<T extends ZodRawShape> = { [K in keyof T]: ZodOptional<T[K]> }

// Literal union state
export type ConnectionStatus =
  'idle' | 'connecting' | 'open' | 'closed' | 'offline' | 'auth_error'
```

Also reach for: `satisfies` for config objects, `as const` arrays with `(typeof X)[number]` for unions, discriminated unions for messages, `readonly` arrays in public signatures, overloads only when the return type truly depends on the input.

Avoid: `any` (use `unknown` and narrow), `enum` in libraries (use literal unions; feature `types/` may keep enums the API already uses), non-null `!` assertions to silence the compiler.

## Builders

- Folder `src/utils/<name>-builder/{index.ts,<name>-builder.ts}`. `index.ts` exports a factory (`createPayload<T>()`) plus the class.
- Methods return `this` for chaining and end in `build()`. Extra terminals are short verbs: `map`, `toFormData`, `toString`.
- Long generic signatures may use `// prettier-ignore` above the class to keep one signature per line, with a one-line comment above each method.

## Example shape

```ts
import type { BackoffOptions } from './websocket-backoff'
import type { ConnectionStatus, Transport, Unsubscribe } from './transport.types'

export class WebSocketTransport implements Transport {
  private status: ConnectionStatus = 'idle'
  private generation = 0
  private readonly statuses = new WebSocketListenerRegistry<ConnectionStatus>()

  constructor(private readonly options: WebSocketTransportOptions) {}

  connect(): void { /* … */ }
  disconnect(): void { /* … */ }
  send(data: unknown): void { /* … */ }
  getStatus(): ConnectionStatus {
    return this.status
  }
  onStatus(listener: (status: ConnectionStatus) => void): Unsubscribe {
    return this.statuses.add(listener)
  }

  private setStatus(status: ConnectionStatus): void { /* … */ }
}
```

## Checklist

- [ ] one class per file, kebab-case file name
- [ ] shared types in `<lib>.types.ts` / `.d.ts`
- [ ] implements an interface when something fakes or swaps it
- [ ] dependencies injected through the constructor
- [ ] methods are short verbs; state private, collaborators `private readonly`
- [ ] subscriptions return `Unsubscribe`; listener errors isolated
- [ ] no `any`
- [ ] each class has a test (see the `vitest-conventions` skill)
