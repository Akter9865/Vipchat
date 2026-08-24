import { store } from '../storage/store.js';
import { Server as SocketIOServer } from 'socket.io';

interface AutomationContext {
  triggerType: string;
  contact: any;
  conversationId?: string;
  messageContent?: string;
  oldStatus?: string;
  newStatus?: string;
  io?: SocketIOServer;
}

export async function runAutomations(ctx: AutomationContext) {
  try {
    const automations = await store.getAutomations();
    const activeRules = automations.filter((a: any) => a.isActive && a.triggerType === ctx.triggerType);

    for (const rule of activeRules) {
      let conditionsMet = true;

      // Evaluate conditions
      if (Array.isArray(rule.conditions) && rule.conditions.length > 0) {
        for (const cond of rule.conditions) {
          const { field, operator, value } = cond;

          let targetValue: any;
          if (field === 'leadStatus') targetValue = ctx.contact.leadStatus;
          else if (field === 'hasMobile') targetValue = !!ctx.contact.mobileNumber;
          else if (field === 'hasEmail') targetValue = !!ctx.contact.emailAddress;
          else if (field === 'assignedAgent') targetValue = ctx.contact.assignedAgentId;
          else if (field === 'keyword' && ctx.messageContent) {
            const hasKeyword = ctx.messageContent.toLowerCase().includes(String(value).toLowerCase());
            if (!hasKeyword) {
              conditionsMet = false;
              break;
            }
            continue;
          }

          if (operator === 'EQUALS' && targetValue !== value) {
            conditionsMet = false;
            break;
          } else if (operator === 'NOT_EQUALS' && targetValue === value) {
            conditionsMet = false;
            break;
          } else if (operator === 'CONTAINS' && !String(targetValue).toLowerCase().includes(String(value).toLowerCase())) {
            conditionsMet = false;
            break;
          }
        }
      }

      if (!conditionsMet) {
        await store.logAutomationExecution({
          automationId: rule.id,
          contactId: ctx.contact.id,
          triggerEvent: ctx.triggerType,
          status: 'SKIPPED',
          details: { reason: 'Conditions not matched' },
        });
        continue;
      }

      // Execute actions
      const executedActions: any[] = [];
      for (const act of rule.actions) {
        const { actionType, payload } = act;

        if (actionType === 'SEND_MESSAGE') {
          const targetConvoId: string = ctx.conversationId || (await store.getCustomerActiveConversation(ctx.contact.id)).id;

          let text = payload.content || '';
          text = text.replace(/\{\{name\}\}/gi, ctx.contact.fullName || 'Valued Guest');
          text = text.replace(/\{\{mobile\}\}/gi, ctx.contact.mobileNumber || '');
          text = text.replace(/\{\{email\}\}/gi, ctx.contact.emailAddress || '');
          text = text.replace(/\{\{agent_name\}\}/gi, 'VIP Support');
          text = text.replace(/\{\{date\}\}/gi, new Date().toLocaleDateString());

          const attachments = payload.attachments || [];
          if (payload.mediaUrl && attachments.length === 0) {
            attachments.push({
              fileName: payload.mediaName || 'Attachment',
              fileUrl: payload.mediaUrl,
              fileType: (payload.mediaType || 'IMAGE').toUpperCase(),
              fileSize: 102400,
              mimeType: payload.mediaType === 'video' ? 'video/mp4' : payload.mediaType === 'audio' ? 'audio/mpeg' : 'image/jpeg',
            });
          }

          const msg = await store.createMessage({
            conversationId: targetConvoId,
            senderType: 'AUTOMATION',
            senderName: 'VIP Concierge Bot',
            content: text,
            messageType: attachments.length > 0 ? (attachments[0].fileType || 'IMAGE') as any : 'TEXT',
            attachments,
          });

          if (ctx.io) {
            ctx.io.to(`conversation_${targetConvoId}`).emit('message:new', msg);
            ctx.io.to('admin_inbox').emit('conversation:updated', {
              conversationId: targetConvoId,
              lastMessageSnippet: msg.content,
              lastMessageAt: msg.createdAt,
              senderType: 'AUTOMATION',
            });
          }
          executedActions.push({ actionType, status: 'DONE', messageId: msg.id });
        } else if (actionType === 'ADD_TAG') {
          const tags = await store.getTags();
          const targetTag = tags.find((t: any) => t.name.toLowerCase() === payload.tagName?.toLowerCase());
          if (targetTag) {
            await store.addContactTag(ctx.contact.id, targetTag.id);
            executedActions.push({ actionType, tag: targetTag.name });
          }
        } else if (actionType === 'REMOVE_TAG') {
          const tags = await store.getTags();
          const targetTag = tags.find((t: any) => t.name.toLowerCase() === payload.tagName?.toLowerCase());
          if (targetTag) {
            await store.removeContactTag(ctx.contact.id, targetTag.id);
            executedActions.push({ actionType, tag: targetTag.name });
          }
        } else if (actionType === 'CHANGE_STATUS') {
          await store.updateContact(ctx.contact.id, { leadStatus: payload.status });
          executedActions.push({ actionType, status: payload.status });
        } else if (actionType === 'ASSIGN_AGENT') {
          await store.updateContact(ctx.contact.id, { assignedAgentId: payload.agentId });
          if (ctx.conversationId) {
            await store.updateConversation(ctx.conversationId, { assignedAgentId: payload.agentId });
          }
          executedActions.push({ actionType, agentId: payload.agentId });
        } else if (actionType === 'ADD_INTERNAL_NOTE') {
          await store.createInternalNote({
            conversationId: ctx.conversationId,
            contactId: ctx.contact.id,
            authorId: 'usr-admin-1',
            content: `[Automation: ${rule.name}] ${payload.note || ''}`,
          });
          executedActions.push({ actionType, note: payload.note });
        }
      }

      await store.logAutomationExecution({
        automationId: rule.id,
        contactId: ctx.contact.id,
        triggerEvent: ctx.triggerType,
        status: 'SUCCESS',
        details: { actions: executedActions },
      });
    }
  } catch (err: any) {
    console.error('Error executing automations:', err);
  }
}
