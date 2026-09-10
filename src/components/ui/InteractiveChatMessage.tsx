import React from 'react';
import { Check, CheckCheck, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { Message } from '@/types';

export interface InteractiveChatMessageProps {
  message: Message;
  nextMessage?: Message;
  formatTime: (dateStr?: string | null) => string;
}

export function parseInteractiveOptions(rawText: string) {
  if (!rawText) return null;

  // Check for Button message format: [Options: Option 1 | Option 2 | Option 3]
  const optionsMatch = rawText.match(/\[Options:\s*([^\]]+)\]/i);
  if (optionsMatch) {
    const optionsPart = optionsMatch[1];
    const buttons = optionsPart.split('|').map((opt) => opt.trim()).filter(Boolean);
    const bodyText = rawText.replace(/\[Options:\s*[^\]]+\]/i, '').trim();

    return {
      type: 'BUTTONS' as const,
      bodyText,
      buttons,
    };
  }

  // Check for List message format: [List: Button Title]
  const listMatch = rawText.match(/\[List:\s*([^\]]+)\]/i);
  if (listMatch) {
    const buttonTitle = listMatch[1].trim();
    const bodyText = rawText.substring(0, listMatch.index).trim();
    const listContent = rawText.substring((listMatch.index || 0) + listMatch[0].length).trim();

    // Parse sections & rows
    const lines = listContent.split('\n').map((l) => l.trim()).filter(Boolean);
    const items: { section?: string; title: string; description?: string }[] = [];
    let currentSection: string | undefined;

    lines.forEach((line) => {
      if (line.startsWith('*') && line.endsWith('*')) {
        currentSection = line.slice(1, -1).trim();
      } else if (line.startsWith('•')) {
        const itemText = line.slice(1).trim();
        const descMatch = itemText.match(/^(.+?)\s*\((.+?)\)$/);
        if (descMatch) {
          items.push({
            section: currentSection,
            title: descMatch[1].trim(),
            description: descMatch[2].trim(),
          });
        } else {
          items.push({
            section: currentSection,
            title: itemText,
          });
        }
      }
    });

    return {
      type: 'LIST' as const,
      bodyText,
      buttonTitle,
      items,
    };
  }

  return null;
}

export function formatInboundChoice(text: string): { isChoice: boolean; formatted: string } {
  const trimmed = (text || '').trim();
  const lower = trimmed.toLowerCase();

  const idMap: Record<string, string> = {
    prop_type_apartment: 'Apartment',
    prop_type_villa: 'Villa',
    prop_type_plot: 'Plot / Land',
    prop_type_commercial: 'Commercial',
    prop_type_independent_house: 'Independent House',
    timeline_immediate: 'Immediate (< 1 mo)',
    timeline_3_months: 'Within 3 Months',
    timeline_exploring: 'Just Exploring',
    band_0: 'Under ₹50L',
    band_1: '₹50L - ₹1 Cr',
    band_2: '₹1 Cr - ₹2 Cr',
    band_3: '₹2 Cr+',
  };

  if (idMap[lower]) {
    return { isChoice: true, formatted: idMap[lower] };
  }

  return { isChoice: false, formatted: trimmed };
}

export function InteractiveChatMessage({
  message,
  nextMessage,
  formatTime,
}: InteractiveChatMessageProps) {
  const isInbound = message.direction === 'INBOUND';
  const isTemplate = message.messageType === 'TEMPLATE';
  const isAutoReply = message.messageType === 'AUTO_REPLY';

  // Determine if next message was the user's selected choice
  const nextInboundText =
    nextMessage && nextMessage.direction === 'INBOUND' ? nextMessage.rawText.toLowerCase().trim() : '';

  const parsedInteractive = !isInbound ? parseInteractiveOptions(message.rawText) : null;
  const inboundChoice = isInbound ? formatInboundChoice(message.rawText) : null;

  return (
    <div className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-2xs transition-all ${
          isInbound
            ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
            : 'bg-blue-600 text-white rounded-tr-xs'
        }`}
      >
        {/* Type Badges */}
        {isTemplate && (
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
            <Sparkles className="h-3 w-3" />
            <span>Brochure Template</span>
          </div>
        )}

        {isAutoReply && (
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
            Automated Qualification Question
          </div>
        )}

        {/* Message Content */}
        {parsedInteractive?.type === 'BUTTONS' ? (
          <div className="space-y-2.5">
            <p className="text-xs leading-relaxed whitespace-pre-wrap font-normal">
              {parsedInteractive.bodyText}
            </p>

            {/* Render Buttons */}
            <div className="mt-2.5 pt-2 border-t border-blue-500/40 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-1">
                Options Presented:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {parsedInteractive.buttons.map((btn, idx) => {
                  const isSelected =
                    nextInboundText &&
                    (nextInboundText.includes(btn.toLowerCase()) ||
                      btn.toLowerCase().includes(nextInboundText));

                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-xs font-bold'
                          : 'bg-white/15 border-white/25 text-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      <span>{btn}</span>
                      {isSelected && <span className="text-[10px] font-normal opacity-90">(Selected)</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ) : parsedInteractive?.type === 'LIST' ? (
          <div className="space-y-2.5">
            <p className="text-xs leading-relaxed whitespace-pre-wrap font-normal">
              {parsedInteractive.bodyText}
            </p>

            {/* Render List Options */}
            <div className="mt-2.5 pt-2 border-t border-blue-500/40 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-1">
                <span>List Options ({parsedInteractive.buttonTitle})</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {parsedInteractive.items.map((item, idx) => {
                  const isSelected =
                    nextInboundText &&
                    (nextInboundText.includes(item.title.toLowerCase()) ||
                      item.title.toLowerCase().includes(nextInboundText));

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-white font-bold shadow-xs'
                          : 'bg-white/15 border-white/20 text-white'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{item.title}</span>
                        {item.description && (
                          <span className={`block text-[10px] ${isSelected ? 'text-emerald-100' : 'text-blue-200'}`}>
                            {item.description}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded">
                          <Check className="h-2.5 w-2.5" />
                          <span>Selected</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : inboundChoice?.isChoice ? (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              <CheckCircle2 className="h-3 w-3 text-blue-600" />
              <span>Button Selection: {inboundChoice.formatted}</span>
            </span>
          </div>
        ) : (
          <p className="text-xs leading-relaxed whitespace-pre-wrap select-text font-normal">
            {message.rawText}
          </p>
        )}

        {/* Time & Delivery Status Footer */}
        <div
          className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
            isInbound ? 'text-slate-400' : 'text-blue-200'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {!isInbound && (
            <span>
              {message.status === 'READ' ? (
                <span title="Read"><CheckCheck className="h-3 w-3 text-emerald-300 inline" /></span>
              ) : message.status === 'DELIVERED' ? (
                <span title="Delivered"><CheckCheck className="h-3 w-3 text-blue-200 inline" /></span>
              ) : (
                <span title="Sent"><Check className="h-3 w-3 text-blue-200 inline" /></span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
