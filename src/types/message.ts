import { MessageParam } from '@anthropic-ai/sdk/resources';
/**
 * Type alias for Anthropic's {@link MessageParam} message type.
 *
 * Used as the canonical message type within this codebase while delegating
 * to the SDK's definition.
 */
export type Message  = MessageParam;

export const isMessageContentString = (content: Message['content']): content is string => {
    return typeof content === 'string';
}