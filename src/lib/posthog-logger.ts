type PostHogWindow = Window & {
  posthog?: {
    logger?: {
      info: (message: string, attributes?: Record<string, string>) => void;
    };
  };
};

export function logPostHogInteraction(
  message: string,
  attributes: Record<string, string>
) {
  (window as PostHogWindow).posthog?.logger?.info(message, attributes);
}
