export type EventAction =
  | "click"
  | "submit"
  | "create"
  | "view"
  | "add"
  | "invite"
  | "update"
  | "delete"
  | "remove"
  | "start"
  | "complete"
  | "cancel"
  | "fail"
  | "success"
  | "generate"
  | "send";

export type EventContext = "social_profiles" | "appearance" | "unknown";

type PropertyValue = string | number | boolean;

type DefineEvents<
  T extends {
    [N in keyof T]: N extends `${string}:${EventAction}`
      ? Record<string, PropertyValue>
      : never;
  },
> = T;

type Events = DefineEvents<{
  "social_profile_link:click": { platform: "linkedin" | "github" };
  "theme_toggle:click": { theme: "light" | "dark" };
}>;

type EventName = keyof Events;
type ObjectOf<N> = N extends `${infer O}:${string}` ? O : never;
type EventObject = ObjectOf<EventName>;
type ActionOf<O extends string, N = EventName> = N extends `${O}:${infer A}`
  ? A
  : never;

export type TrackEvent<O extends EventObject, A extends ActionOf<O>> = {
  name: [O, A] | `${O}:${A}`;
  properties: { context: EventContext } & Events[`${O}:${A}` & EventName];
};

type PostHogClient = {
  capture: (event: string, properties?: Record<string, PropertyValue>) => void;
  logger?: {
    info: (message: string, attributes?: Record<string, PropertyValue>) => void;
  };
};

function send(name: string, properties: Record<string, PropertyValue>) {
  const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
  posthog?.capture(name, properties);
  posthog?.logger?.info(name, properties);
}

function toName(name: [string, string] | string) {
  return Array.isArray(name) ? name.join(":") : name;
}

export function track<O extends EventObject, A extends ActionOf<O>>(
  event: TrackEvent<O, A>
) {
  send(toName(event.name), event.properties);
}

export function clickTracking<
  O extends EventObject,
  A extends ActionOf<O> & "click",
>(event: TrackEvent<O, A>) {
  return {
    "data-track": toName(event.name),
    "data-track-properties": JSON.stringify(event.properties),
  };
}

export function initClickTracking() {
  document.addEventListener("click", (event) => {
    const element = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-track]"
    );
    if (!element?.dataset.track) return;

    send(
      element.dataset.track,
      JSON.parse(element.dataset.trackProperties ?? "{}")
    );
  });
}
