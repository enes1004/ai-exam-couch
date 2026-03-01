import { MessageParam } from '@anthropic-ai/sdk/resources';
/**
 * An interpolate for the message types.
 */
export type Message  = MessageParam;

export const isMessageContentString = (content: Message['content']): content is string => {
    return typeof content === 'string';
}