import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, PanResponder, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AiConversationMessageRecord, AiInsightRecord, CareEventRecord, CareProfileRecord, CareRecommendationRecord, ObservationRecord, PhotoRecord, PlantDetailRecord, PlantRecord } from '../../garden-records/models/GardenRecordTypes';
import { GardenAgentDiagnostics } from '../../garden-agent/GardenAgentDiagnostics';
import { gardenAgentCareProfileService } from '../../garden-agent/GardenAgentCareProfileService';
import { gardenAgentCareService } from '../../garden-agent/GardenAgentCareService';
import { CareProfileDraftFields, CareRecommendationSuggestion } from '../../garden-agent/types';
import { gardenAgentChatService } from '../../garden-agent/GardenAgentChatService';
import { aiConversationRepository } from '../../garden-records/repositories/AiConversationRepository';
import { careEventRepository } from '../../garden-records/repositories/CareEventRepository';
import { careRecommendationRepository } from '../../garden-records/repositories/CareRecommendationRepository';
import { careProfileRepository, UpsertCareProfileInput } from '../../garden-records/repositories/CareProfileRepository';
import { fmtDate, relDays } from '../../garden-records/viewModels';
import { usePlantDetailRecord } from '../../garden-records/hooks/useGardenRecords';
import { BottomNav } from '../components/BottomNav';
import { buildCareActionPresentation, formatCareSource, formatCareType, formatDueLabel, isCareRelevantInsight, sortCareEvents } from '../careSectionHelpers';
import { GlyphIcon, IconButton, MonoText, PhotoTreatment, ScreenScaffold, SerifText, StatusDot } from '../components/primitives';
import { theme } from '../theme';

export function PlantDetailScreen() {
  const router = useRouter();
  const { plantId } = useLocalSearchParams();
  const id = Array.isArray(plantId) ? plantId[0] : plantId ?? '';
  const { data: detail, loading, error, reload } = usePlantDetailRecord(id);
  const [tab, setTab] = useState<'timeline' | 'chat' | 'care'>('timeline');

  if (!detail) {
    return (
      <ScreenScaffold>
        <View style={{ flex: 1, padding: 24, paddingTop: 80 }}>
          <Text style={{ color: error ? theme.accent : theme.ink, fontSize: 18 }}>{error ? error.message : loading ? 'Loading plant…' : 'Plant not found'}</Text>
        </View>
        <BottomNav />
      </ScreenScaffold>
    );
  }

  const { plant, photos, observations, careEvents, careRecommendations, careProfile, aiInsights } = detail;
  const latest = photos[0];
  const plantTitle = displayPlantName(plant.commonName || plant.displayName);
  const plantSubtitle = plant.varietyName && plant.varietyName !== plantTitle ? plant.varietyName : plant.displayName !== plantTitle ? displayPlantName(plant.displayName) : null;
  const plantDescription = displayDescription(plant.description, plantTitle);
  const yearsTracking = 2026 - (plant.startedYear ?? 2026) + 1;

  return (
    <ScreenScaffold>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={{ paddingBottom: tab === 'chat' ? 220 : 124 }}>
        <View style={{ width: '100%', aspectRatio: 1 / 1.04 }}>
          <PhotoTreatment tone={latest?.tone ?? plant.primaryColor ?? undefined} imageUri={latest?.localUri} style={{ flex: 1, borderRadius: 0 }} radius={0} />
          <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.12)' }} />
          <View style={{ position: 'absolute', top: 54, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton label="Back" onPress={() => router.push('/')} theme={theme}><GlyphIcon name="back" color={theme.ink} size={28} /></IconButton>
            <IconButton label="More" theme={theme}><Text style={{ color: theme.ink, fontWeight: '800' }}>•••</Text></IconButton>
          </View>
          <View style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
            <Text style={{ color: 'rgba(255,255,255,0.86)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>{plantSubtitle ?? 'Plant'}</Text>
            <SerifText style={{ color: '#fff', fontSize: 40, lineHeight: 43 }} numberOfLines={2}>{plantTitle}</SerifText>
            {plant.varietyName && plant.varietyName !== plantTitle ? <SerifText style={{ color: 'rgba(255,255,255,0.86)', fontSize: 14, fontStyle: 'italic', marginTop: 4 }} numberOfLines={1}>{plant.varietyName}</SerifText> : null}
          </View>
        </View>

        <View style={{ backgroundColor: theme.surface, borderBottomWidth: 0.5, borderBottomColor: theme.line, padding: 16, flexDirection: 'row', gap: 12 }}>
          <Stat value={`Y${yearsTracking}`} label="tracking" />
          <Divider />
          <Stat value={`${photos.length}`} label="photos" />
          <Divider />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}><StatusDot kind={plant.statusKind === 'archived' ? 'idle' : plant.statusKind} theme={theme} /><SerifText style={{ fontSize: 19, color: theme.ink }}>{plant.statusLabel}</SerifText></View>
            <Text style={{ color: theme.inkMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>status</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <SerifText style={{ color: theme.inkSoft, fontSize: 16, lineHeight: 23, fontStyle: 'italic' }}>{plantDescription}</SerifText>
          <Text style={{ color: theme.inkMuted, fontSize: 12, marginTop: 12 }}>📍 {plant.locationName} · Planted {plant.plantedDate ? fmtDate(plant.plantedDate, { year: true }) : 'unknown'}</Text>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 16, padding: 3, borderRadius: 12, backgroundColor: theme.bgSoft, flexDirection: 'row' }}>
          {[
            ['timeline', 'Timeline'],
            ['chat', 'Ask AI'],
            ['care', 'Care'],
          ].map(([key, label]) => (
            <Pressable key={key} onPress={() => setTab(key as typeof tab)} style={{ flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: 'center', backgroundColor: tab === key ? theme.surface : 'transparent' }}>
              <Text style={{ color: tab === key ? theme.ink : theme.inkSoft, fontSize: 13, fontWeight: '700' }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'timeline' ? <Timeline observations={observations} photos={photos} aiInsights={aiInsights} onCamera={() => router.push(`/camera?plantId=${plant.id}`)} /> : null}
        {tab === 'chat' ? <PlantChat detail={detail} /> : null}
        {tab === 'care' ? <CareSection plant={plant} events={careEvents} recommendations={careRecommendations} careProfile={careProfile ?? null} aiInsights={aiInsights} detail={detail} onCareLogged={reload} /> : null}
      </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav />
    </ScreenScaffold>
  );
}

function displayPlantName(name?: string | null) {
  const value = (name ?? '').trim();
  if (!value) return 'New plant';
  if (value.length <= 34 && !/[.;]/.test(value)) return value;
  const cleaned = value
    .replace(/^the\s+plant\s+(?:appears|looks|seems)\s+(?:most\s+)?(?:like|to\s+be)\s+/i, '')
    .replace(/^this\s+(?:appears|looks|seems)\s+(?:most\s+)?(?:like|to\s+be)\s+/i, '')
    .replace(/^it\s+(?:appears|looks|seems)\s+(?:most\s+)?(?:like|to\s+be)\s+/i, '')
    .replace(/^an?\s+/i, '')
    .split(/[.;:,()]/)[0]
    ?.trim();
  const short = (cleaned || value).split(/\s+/).slice(0, 4).join(' ');
  return short.charAt(0).toUpperCase() + short.slice(1);
}

function displayDescription(description?: string | null, title?: string | null) {
  const value = (description ?? '').trim();
  if (value) return value;
  return title ? `Added from camera identification: ${title}.` : 'Added from camera identification.';
}

function Divider() { return <View style={{ width: 0.5, backgroundColor: theme.line }} />; }
function Stat({ value, label }: { value: string; label: string }) {
  return <View style={{ flex: 1 }}><SerifText style={{ fontSize: 19, color: theme.ink }}>{value}</SerifText><Text style={{ color: theme.inkMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{label}</Text></View>;
}

function Timeline({ observations, photos, aiInsights, onCamera }: { observations: ObservationRecord[]; photos: PhotoRecord[]; aiInsights: AiInsightRecord[]; onCamera: () => void }) {
  const photoByObservation = new Map(photos.map((photo) => [photo.observationId, photo]));
  const insightByObservation = new Map(aiInsights.map((insight) => [insight.observationId, insight]));
  const byYear = observations.reduce<Record<string, ObservationRecord[]>>((acc, observation) => {
    const year = observation.observedOn.slice(0, 4);
    acc[year] ??= [];
    acc[year].push(observation);
    return acc;
  }, {});
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Pressable onPress={onCamera} style={{ borderRadius: 13, borderWidth: 1, borderColor: theme.primary, padding: 15, alignItems: 'center', marginBottom: 18 }}>
        <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>◉ Log a new photo</Text>
      </Pressable>
      {Object.keys(byYear).sort().reverse().map((year) => (
        <View key={year} style={{ marginBottom: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <SerifText style={{ color: theme.ink, fontSize: 23 }}>{year}</SerifText>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.line }} />
            <Text style={{ color: theme.inkMuted, fontSize: 11 }}>{byYear[year].length} entries</Text>
          </View>
          {byYear[year].map((observation) => {
            const photo = photoByObservation.get(observation.id);
            const insight = insightByObservation.get(observation.id);
            return (
              <View key={observation.id} style={{ flexDirection: 'row', gap: 14, marginBottom: 12 }}>
                <PhotoTreatment tone={photo?.tone ?? undefined} imageUri={photo?.localUri} style={{ width: 78, height: 78 }} radius={14} />
                <View style={{ flex: 1, paddingTop: 4 }}>
                  <MonoText style={{ fontSize: 11, color: theme.inkMuted }}>{fmtDate(observation.observedOn, { short: true }).toUpperCase()} · {relDays(observation.observedOn)}</MonoText>
                  <Text style={{ color: theme.ink, fontSize: 14, lineHeight: 20, marginTop: 4 }}>{observation.note}</Text>
                  {insight ? <AiInsightCard insight={insight} /> : null}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}


function AiInsightCard({ insight }: { insight: AiInsightRecord }) {
  return (
    <View style={{ marginTop: 8, borderRadius: 12, backgroundColor: theme.bgSoft, borderWidth: 0.5, borderColor: theme.line, padding: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <GlyphIcon name="sparkle" color={theme.primary} size={13} />
        <Text style={{ color: theme.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>AI note</Text>
      </View>
      {insight.title ? <Text style={{ color: theme.ink, fontSize: 13, fontWeight: '700', marginBottom: 3 }}>{insight.title}</Text> : null}
      <Text style={{ color: theme.inkSoft, fontSize: 12, lineHeight: 17 }}>{insight.body}</Text>
    </View>
  );
}

function PlantChat({ detail }: { detail: PlantDetailRecord }) {
  const { plant, photos, conversation } = detail;
  const [messages, setMessages] = useState<AiConversationMessageRecord[]>(detail.messages ?? []);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [diagnostics, setDiagnostics] = useState<GardenAgentDiagnostics | null>(null);

  useEffect(() => {
    let cancelled = false;
    aiConversationRepository.ensurePlantConversation({ id: conversation.id, plantId: plant.id, title: conversation.title }).then(() =>
      aiConversationRepository.listMessages(conversation.id)
    ).then((items) => {
      if (!cancelled) setMessages(items.length ? items : detail.messages ?? []);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [conversation.id, plant.id]);

  const prompts = [
    'Should I water this today?',
    photos.length > 1 ? 'What changed since the last photo?' : 'What should I watch next?',
    'Why might leaves be yellowing?',
    'Summarize this plant’s progress.',
  ];

  const sendQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;
    setDraft('');
    setSending(true);
    setDiagnostics(null);
    const now = new Date().toISOString();
    const userMessage: AiConversationMessageRecord = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      conversationId: conversation.id,
      plantId: plant.id,
      role: 'user',
      body: trimmed,
      status: 'pending',
      createdAt: now,
    };
    setMessages((current) => [...current, userMessage]);
    try {
      await aiConversationRepository.createMessage(userMessage);
      const result = await gardenAgentChatService.askPlantQuestion({ detail, question: trimmed, recentMessages: [...messages, userMessage], messageId: userMessage.id });
      if ('diagnostics' in result) {
        setDiagnostics(result.diagnostics);
        await aiConversationRepository.markMessageStatus(userMessage.id, 'failed');
        setMessages((current) => current.map((item) => item.id === userMessage.id ? { ...item, status: 'failed' as const } : item));
        return;
      }
      await aiConversationRepository.markMessageStatus(userMessage.id, 'sent');
      const assistant = await aiConversationRepository.createMessage({
        id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conversationId: conversation.id,
        plantId: plant.id,
        role: 'assistant',
        body: result.output.answer,
        status: 'sent',
        sourceRunId: result.runId,
        metadata: { suggestedQuestions: result.output.suggestedQuestions ?? [], confidence: result.output.confidence ?? null, sources: result.output.sources ?? [] },
      });
      setMessages((current) => current.map((item) => item.id === userMessage.id ? { ...item, status: 'sent' as const } : item).concat(assistant));
    } catch {
      await aiConversationRepository.markMessageStatus(userMessage.id, 'failed').catch(() => undefined);
      setMessages((current) => current.map((item) => item.id === userMessage.id ? { ...item, status: 'failed' as const } : item));
      setDiagnostics({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed', message: 'AI request failed; try again.' });
    } finally {
      setSending(false);
    }
  };

  const visibleMessages = messages.length ? messages : [{ id: 'intro', conversationId: conversation.id, plantId: plant.id, role: 'assistant' as const, body: `Hey — I’m tracking your ${plant.commonName ?? plant.displayName} with you. I can see ${photos.length} photos so far. What’s on your mind?`, status: 'sent' as const, createdAt: new Date().toISOString() }];

  return (
    <View style={{ paddingHorizontal: 20 }}>
      {diagnostics ? <View style={{ borderRadius: 14, backgroundColor: '#fff0df', borderWidth: 0.5, borderColor: theme.line, padding: 12, marginBottom: 12 }}><Text style={{ color: theme.accent, fontSize: 13, lineHeight: 18, fontWeight: '700' }}>{diagnostics.message}</Text></View> : null}
      <View style={{ backgroundColor: theme.bgSoft, borderRadius: 17, padding: 14, gap: 10 }}>
        {visibleMessages.map((message) => <ChatBubble key={message.id} me={message.role === 'user'} text={`${message.body}${message.status === 'failed' ? '\nFailed to send — try again.' : ''}`} />)}
        {sending ? <ChatBubble text="Thinking through this plant’s recent history…" /> : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
        {prompts.map((q) => <Pressable key={q} onPress={() => sendQuestion(q)} disabled={sending} style={{ paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, borderWidth: 0.5, borderColor: theme.line, opacity: sending ? 0.55 : 1 }}><Text style={{ color: theme.inkSoft, fontSize: 12 }}>{q}</Text></Pressable>)}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, backgroundColor: theme.surface, borderRadius: 999, borderWidth: 0.5, borderColor: theme.line }}>
        <TextInput editable={!sending} value={draft} onChangeText={setDraft} onSubmitEditing={() => sendQuestion(draft)} placeholder={`Ask about your ${plant.displayName.toLowerCase()}…`} placeholderTextColor={theme.inkMuted} style={{ flex: 1, color: theme.ink }} />
        <Pressable disabled={sending || !draft.trim()} onPress={() => sendQuestion(draft)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: draft.trim() ? theme.primary : theme.bgSoft, alignItems: 'center', justifyContent: 'center' }}><GlyphIcon name="send" color={draft.trim() ? theme.bg : theme.inkMuted} size={15} /></Pressable>
      </View>
    </View>
  );
}

function ChatBubble({ text, me = false }: { text: string; me?: boolean }) {
  const color = me ? theme.bg : theme.ink;
  return (
    <View style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '82%', borderRadius: 16, padding: 12, backgroundColor: me ? theme.primary : theme.surface }}>
      <FormattedChatText text={text} color={color} />
    </View>
  );
}

function FormattedChatText({ text, color }: { text: string; color: string }) {
  const nodes = parseBoldMarkdown(text);
  return (
    <Text style={{ color, fontSize: 14, lineHeight: 20 }}>
      {nodes.map((node, index) => (
        <Text key={`${index}-${node.text.slice(0, 8)}`} style={{ fontWeight: node.bold ? '800' : '400' }}>{node.text}</Text>
      ))}
    </Text>
  );
}

function parseBoldMarkdown(text: string): Array<{ text: string; bold: boolean }> {
  const parts: Array<{ text: string; bold: boolean }> = [];
  let cursor = 0;
  const pattern = /\*\*([^*\n][\s\S]*?[^*\n])\*\*/g;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ text: text.slice(cursor, start), bold: false });
    parts.push({ text: match[1], bold: true });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), bold: false });
  return parts.length ? parts : [{ text, bold: false }];
}

function CareSection({ plant, events, recommendations, careProfile, aiInsights, detail, onCareLogged }: { plant: PlantRecord; events: CareEventRecord[]; recommendations: CareRecommendationRecord[]; careProfile: CareProfileRecord | null; aiInsights: AiInsightRecord[]; detail: PlantDetailRecord; onCareLogged: () => void }) {
  const [localRecommendations, setLocalRecommendations] = useState<CareRecommendationRecord[]>(recommendations);
  const [hiddenRecommendationIds, setHiddenRecommendationIds] = useState<Set<string>>(new Set());
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  useEffect(() => {
    setLocalRecommendations((current) => mergeRecommendationState(recommendations, current));
  }, [recommendations]);
  const visibleRecommendations = localRecommendations.filter((item) => !hiddenRecommendationIds.has(item.id));
  const { nextAction, groups, promotedRecommendationId } = buildCareActionPresentation(plant, visibleRecommendations);
  const history = sortCareEvents(events);
  const careInsights = aiInsights.filter(isCareRelevantInsight);
  const sparse = visibleRecommendations.length === 0 && history.length === 0 && careInsights.length === 0;

  const completeNextAction = async () => {
    if (!nextAction.recommendationId) return;
    setCompletionMessage(null);
    const completedId = nextAction.recommendationId;
    setLocalRecommendations((current) => current.map((item) => item.id === completedId ? { ...item, status: 'completed' as const } : item));
    try {
      await careRecommendationRepository.markCompleted(completedId);
      setTimeout(onCareLogged, 250);
    } catch {
      setLocalRecommendations((current) => current.map((item) => item.id === completedId ? { ...item, status: 'suggested' as const } : item));
      setCompletionMessage('Could not complete this action. Try again.');
    }
  };

  const archiveRecommendation = async (recommendationId: string) => {
    setCompletionMessage(null);
    setHiddenRecommendationIds((current) => new Set([...Array.from(current), recommendationId]));
    try {
      await careRecommendationRepository.archiveRecommendation(recommendationId);
      setTimeout(onCareLogged, 250);
    } catch {
      setHiddenRecommendationIds((current) => { const next = new Set(current); next.delete(recommendationId); return next; });
      setCompletionMessage('Could not hide this recommendation. Try again.');
    }
  };

  return (
    <View style={{ paddingHorizontal: 20, gap: 14 }}>
      <CompletableNextActionCard key={nextAction.recommendationId ?? nextAction.title} nextAction={nextAction} onComplete={completeNextAction} />
      {completionMessage ? <Text style={{ color: theme.accent, fontSize: 12, fontWeight: '700' }}>{completionMessage}</Text> : null}
      <QuickCareLogger plantId={plant.id} onCareLogged={onCareLogged} />
      <CareProfileCard detail={detail} profile={careProfile} onSaved={onCareLogged} />

      {sparse ? <EmptyCareState /> : null}

      <AiCareRecommendationRequester detail={detail} onSaved={onCareLogged} />

      <CareSectionBlock title="Recommendations" empty={promotedRecommendationId && groups.inactive.length === 0 ? "No other recommendations queued." : "No recommendations yet. Ask AI or log care over time to build suggestions."}>
        {groups.active.length ? <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>Other recommendations</Text> : null}
        {groups.active.map((item) => <RecommendationCard key={item.id} recommendation={item} />)}
        {groups.inactive.length ? <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>Completed / dismissed</Text> : null}
        {groups.inactive.map((item) => <ArchivableRecommendationCard key={item.id} recommendation={item} onArchive={() => archiveRecommendation(item.id)} />)}
      </CareSectionBlock>

      <CareSectionBlock title="Care history" empty="No care logged yet.">
        {history.map((event) => <CareEventCard key={event.id} event={event} />)}
      </CareSectionBlock>

      {careInsights.length ? (
        <View style={{ gap: 8 }}>
          <CareHeading title="AI care notes" />
          {careInsights.map((insight) => <CarePanel key={insight.id} eyebrow={formatCareType(insight.kind)} title={insight.title ?? 'AI care note'} body={insight.body} meta={insight.confidence != null ? `Confidence ${Math.round(insight.confidence * 100)}%` : 'AI suggested'} />)}
        </View>
      ) : null}
    </View>
  );
}






function mergeRecommendationState(incoming: CareRecommendationRecord[], current: CareRecommendationRecord[]) {
  if (!current.length) return incoming;
  const currentById = new Map(current.map((item) => [item.id, item]));
  return incoming.map((item) => {
    const local = currentById.get(item.id);
    return local?.status === 'completed' && item.status !== 'completed' ? { ...item, status: 'completed' as const } : item;
  });
}

function CompletableNextActionCard({ nextAction, onComplete }: { nextAction: ReturnType<typeof buildCareActionPresentation>['nextAction']; onComplete: () => void }) {
  const completable = Boolean(nextAction.recommendationId);
  const translateX = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);

  const reset = () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 7 }).start(() => setDragging(false));
  const complete = () => {
    Animated.timing(translateX, { toValue: 420, duration: 180, useNativeDriver: true }).start(() => {
      translateX.setValue(0);
      setDragging(false);
      onComplete();
    });
  };

  useEffect(() => {
    translateX.setValue(0);
    setDragging(false);
  }, [nextAction.recommendationId, nextAction.title, translateX]);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => completable && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
    onPanResponderGrant: () => setDragging(true),
    onPanResponderMove: (_, gesture) => {
      if (!completable) return;
      translateX.setValue(Math.max(-110, Math.min(gesture.dx, 180)));
    },
    onPanResponderRelease: (_, gesture) => {
      if (completable && gesture.dx > 92) complete();
      else reset();
    },
    onPanResponderTerminate: reset,
  })).current;

  return (
    <View style={{ gap: 8 }}>
      <Animated.View {...(completable ? panResponder.panHandlers : {})} style={{ transform: [{ translateX }], opacity: dragging ? 0.94 : 1 }}>
        <View style={{ backgroundColor: theme.bgSoft, borderRadius: 15, borderWidth: 0.5, borderColor: theme.primary, padding: 15 }}>
          <Text style={{ color: theme.primary, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '800', marginBottom: 5 }}>Next action</Text>
          <SerifText style={{ color: theme.ink, fontSize: 20, lineHeight: 24 }}>{nextAction.title}</SerifText>
          {nextAction.body ? <Text style={{ color: theme.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 7 }}>{nextAction.body}</Text> : null}
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ color: theme.inkMuted, fontSize: 11, flex: 1 }}>{[formatDueLabel(nextAction.dueOn), formatCareSource(nextAction.source), nextAction.status].filter(Boolean).join(' · ')}</Text>
            {completable ? (
              <Pressable onPress={complete} style={{ borderRadius: 999, backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: theme.bg, fontSize: 11, fontWeight: '800' }}>Mark done</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Animated.View>
      {completable ? <Text style={{ color: theme.inkMuted, fontSize: 11, marginLeft: 4 }}>Swipe right to complete, or tap Mark done.</Text> : <Text style={{ color: theme.inkMuted, fontSize: 11, marginLeft: 4 }}>Log care to update this action.</Text>}
    </View>
  );
}

function CareProfileCard({ detail, profile, onSaved }: { detail: PlantDetailRecord; profile: CareProfileRecord | null; onSaved: () => void }) {
  const plantId = detail.plant.id;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draftFromAi, setDraftFromAi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    lightPreference: profile?.lightPreference ?? '',
    wateringRhythm: profile?.wateringRhythm ?? '',
    soilMoisturePreference: profile?.soilMoisturePreference ?? '',
    fertilizerCadence: profile?.fertilizerCadence ?? '',
    pruningNotes: profile?.pruningNotes ?? '',
    harvestNotes: profile?.harvestNotes ?? '',
    locationNotes: profile?.locationNotes ?? '',
    generalNotes: profile?.generalNotes ?? '',
  });

  useEffect(() => {
    if (!editing) {
      setForm({
        lightPreference: profile?.lightPreference ?? '',
        wateringRhythm: profile?.wateringRhythm ?? '',
        soilMoisturePreference: profile?.soilMoisturePreference ?? '',
        fertilizerCadence: profile?.fertilizerCadence ?? '',
        pruningNotes: profile?.pruningNotes ?? '',
        harvestNotes: profile?.harvestNotes ?? '',
        locationNotes: profile?.locationNotes ?? '',
        generalNotes: profile?.generalNotes ?? '',
      });
    }
  }, [profile?.id, editing]);

  const rows = [
    ['Light', profile?.lightPreference],
    ['Water rhythm', profile?.wateringRhythm],
    ['Moisture', profile?.soilMoisturePreference],
    ['Fertilizer', profile?.fertilizerCadence],
    ['Pruning', profile?.pruningNotes],
    ['Harvest', profile?.harvestNotes],
    ['Location', profile?.locationNotes],
    ['Notes', profile?.generalNotes],
  ].filter((row): row is [string, string] => typeof row[1] === 'string' && row[1].trim().length > 0);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await careProfileRepository.upsertProfile({ plantId, ...form, source: draftFromAi ? 'ai_assisted' : 'manual' } as UpsertCareProfileInput);
      setEditing(false);
      setDraftFromAi(false);
      setMessage('Care profile saved.');
      onSaved();
    } catch {
      setMessage('Could not save care profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const draftWithAi = async () => {
    setDrafting(true);
    setMessage(null);
    try {
      const result = await gardenAgentCareProfileService.requestCareProfileDraft({ detail });
      if ('diagnostics' in result) {
        setMessage(result.diagnostics.failureKind === 'request_failed' ? 'AI care profile draft failed; try again.' : result.diagnostics.message);
        return;
      }
      const draft = result.output.profile;
      setForm((current) => mergeDraftIntoForm(current, draft));
      setDraftFromAi(true);
      setEditing(true);
      setMessage('AI draft — review before saving.');
    } catch {
      setMessage('AI care profile draft failed; try again.');
    } finally {
      setDrafting(false);
    }
  };

  return (
    <View style={{ borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, backgroundColor: theme.surface, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 }}>Care profile</Text>
          <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '700' }}>{rows.length ? 'Known preferences for this plant' : 'No care profile yet'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}><Pressable disabled={drafting} onPress={draftWithAi} style={{ borderRadius: 999, backgroundColor: drafting ? theme.inkMuted : theme.bgSoft, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: theme.primary, fontSize: 12, fontWeight: '800' }}>{drafting ? 'Drafting…' : rows.length ? 'Improve AI' : 'Draft AI'}</Text></Pressable><Pressable onPress={() => { setEditing((value) => !value); setMessage(null); setDraftFromAi(false); }} style={{ borderRadius: 999, backgroundColor: theme.primary, paddingHorizontal: 13, paddingVertical: 9 }}>
          <Text style={{ color: theme.bg, fontSize: 12, fontWeight: '800' }}>{editing ? 'Cancel' : rows.length ? 'Edit' : 'Add'}</Text>
        </Pressable></View>
      </View>
      {!editing && rows.length ? rows.map(([label, value]) => <CareProfileRow key={label} label={label} value={value} />) : null}
      {!editing && !rows.length ? <Text style={{ color: theme.inkMuted, fontSize: 13, lineHeight: 18 }}>Add what this plant tends to prefer so future care advice has better context.</Text> : null}
      {editing ? <View style={{ gap: 9 }}>{careProfileFields.map(([key, label]) => <CareProfileInput key={key} label={label} value={form[key] ?? ''} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} />)}<Pressable disabled={saving} onPress={save} style={{ alignSelf: 'flex-end', borderRadius: 999, backgroundColor: saving ? theme.inkMuted : theme.primary, paddingHorizontal: 15, paddingVertical: 10 }}><Text style={{ color: theme.bg, fontSize: 12, fontWeight: '800' }}>{saving ? 'Saving…' : 'Save profile'}</Text></Pressable></View> : null}
      {message ? <Text style={{ color: message.startsWith('Could') ? theme.accent : theme.primary, fontSize: 12, fontWeight: '700' }}>{message}</Text> : null}
    </View>
  );
}


function mergeDraftIntoForm(current: Record<string, string>, draft: CareProfileDraftFields) {
  return {
    lightPreference: draft.lightPreference ?? current.lightPreference ?? '',
    wateringRhythm: draft.wateringRhythm ?? current.wateringRhythm ?? '',
    soilMoisturePreference: draft.soilMoisturePreference ?? current.soilMoisturePreference ?? '',
    fertilizerCadence: draft.fertilizerCadence ?? current.fertilizerCadence ?? '',
    pruningNotes: draft.pruningNotes ?? current.pruningNotes ?? '',
    harvestNotes: draft.harvestNotes ?? current.harvestNotes ?? '',
    locationNotes: draft.locationNotes ?? current.locationNotes ?? '',
    generalNotes: draft.generalNotes ?? current.generalNotes ?? '',
  };
}

const careProfileFields = [
  ['lightPreference', 'Light preference'],
  ['wateringRhythm', 'Watering rhythm'],
  ['soilMoisturePreference', 'Soil moisture'],
  ['fertilizerCadence', 'Fertilizer cadence'],
  ['pruningNotes', 'Pruning notes'],
  ['harvestNotes', 'Harvest notes'],
  ['locationNotes', 'Location notes'],
  ['generalNotes', 'General notes'],
] as const;

function CareProfileInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View><Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '800', marginBottom: 4 }}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={`Add ${label.toLowerCase()}…`} placeholderTextColor={theme.inkMuted} multiline style={{ minHeight: 44, borderRadius: 12, borderWidth: 0.5, borderColor: theme.line, padding: 10, color: theme.ink, backgroundColor: theme.bg }} /></View>;
}

function CareProfileRow({ label, value }: { label: string; value: string }) {
  return <View style={{ borderTopWidth: 0.5, borderTopColor: theme.line, paddingTop: 8 }}><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>{label}</Text><Text style={{ color: theme.inkSoft, fontSize: 13, lineHeight: 18 }}>{value}</Text></View>;
}

function AiCareRecommendationRequester({ detail, onSaved }: { detail: PlantDetailRecord; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<GardenAgentDiagnostics | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CareRecommendationSuggestion[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const requestSuggestions = async () => {
    setLoading(true);
    setDiagnostics(null);
    setSummary(null);
    setSuggestions([]);
    setSavedIds(new Set());
    try {
      const result = await gardenAgentCareService.requestCareRecommendations({ detail });
      if ('diagnostics' in result) {
        setDiagnostics(result.diagnostics.failureKind === 'request_failed' ? { ...result.diagnostics, message: 'AI care recommendation failed; try again.' } : result.diagnostics);
        return;
      }
      setSummary(result.output.summary);
      setSuggestions(result.output.recommendations ?? []);
    } catch {
      setDiagnostics({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed', message: 'AI care recommendation failed; try again.' });
    } finally {
      setLoading(false);
    }
  };

  const saveSuggestion = async (suggestion: CareRecommendationSuggestion, index: number) => {
    try {
      await careRecommendationRepository.createAiSuggestion({
        id: `care-rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        plantId: detail.plant.id,
        recommendationType: suggestion.recommendationType,
        title: suggestion.title,
        body: suggestion.body ?? suggestion.rationale ?? null,
        dueOn: suggestion.dueOn ?? null,
      });
      setSavedIds((current) => new Set([...Array.from(current), index]));
      onSaved();
    } catch {
      setDiagnostics({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed', message: 'Could not save suggestion. Try again.' });
    }
  };

  return (
    <View style={{ borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, backgroundColor: theme.surface, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 }}>AI care</Text>
          <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '700' }}>Ask AI for care suggestions</Text>
        </View>
        <Pressable disabled={loading} onPress={requestSuggestions} style={{ borderRadius: 999, backgroundColor: loading ? theme.inkMuted : theme.primary, paddingHorizontal: 13, paddingVertical: 9 }}>
          <Text style={{ color: theme.bg, fontSize: 12, fontWeight: '800' }}>{loading ? 'Checking…' : 'Ask AI'}</Text>
        </Pressable>
      </View>
      {diagnostics ? <Text style={{ color: diagnostics.failureKind ? theme.accent : theme.primary, fontSize: 12, lineHeight: 17, fontWeight: '700' }}>{diagnostics.message}</Text> : null}
      {summary ? <Text style={{ color: theme.inkSoft, fontSize: 13, lineHeight: 18 }}>{summary}</Text> : null}
      {suggestions.length ? <View style={{ gap: 8 }}>{suggestions.map((suggestion, index) => (
        <View key={`${suggestion.title}-${index}`} style={{ borderRadius: 12, borderWidth: 0.5, borderColor: theme.line, backgroundColor: theme.bgSoft, padding: 11 }}>
          <Text style={{ color: theme.primary, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 }}>{formatCareType(suggestion.recommendationType)} · {suggestion.confidence != null ? `${Math.round(suggestion.confidence * 100)}%` : 'AI suggested'}</Text>
          <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '800', marginBottom: 5 }}>{suggestion.title}</Text>
          {suggestion.body || suggestion.rationale ? <Text style={{ color: theme.inkSoft, fontSize: 12, lineHeight: 17 }}>{suggestion.body ?? suggestion.rationale}</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
            <Text style={{ color: theme.inkMuted, fontSize: 11 }}>{formatDueLabel(suggestion.dueOn) ?? 'No due date'}</Text>
            <Pressable disabled={savedIds.has(index)} onPress={() => saveSuggestion(suggestion, index)} style={{ borderRadius: 999, backgroundColor: savedIds.has(index) ? theme.inkMuted : theme.primary, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: theme.bg, fontSize: 11, fontWeight: '800' }}>{savedIds.has(index) ? 'Saved' : 'Save suggestion'}</Text>
            </Pressable>
          </View>
        </View>
      ))}</View> : null}
    </View>
  );
}

const quickCareTypes = [
  ['watered', 'Watered'],
  ['fertilized', 'Fertilized'],
  ['pruned', 'Pruned'],
  ['repotted', 'Repotted'],
  ['rotated', 'Rotated'],
  ['harvested', 'Harvested'],
  ['pest_check', 'Pest check'],
  ['other', 'Other'],
] as const;

function QuickCareLogger({ plantId, onCareLogged }: { plantId: string; onCareLogged: () => void }) {
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<(typeof quickCareTypes)[number][0]>('watered');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await careEventRepository.createCareEvent({
        id: `care-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        plantId,
        eventType,
        eventDate: localDateString(new Date()),
        note,
      });
      setNote('');
      setOpen(false);
      setMessage('Care logged.');
      onCareLogged();
    } catch {
      setMessage('Could not save care. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, backgroundColor: theme.surface, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 }}>Quick log</Text>
          <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '700' }}>Record care you just did</Text>
        </View>
        <Pressable onPress={() => setOpen((value) => !value)} style={{ borderRadius: 999, backgroundColor: theme.primary, paddingHorizontal: 13, paddingVertical: 9 }}>
          <Text style={{ color: theme.bg, fontSize: 12, fontWeight: '800' }}>{open ? 'Cancel' : 'Log care'}</Text>
        </Pressable>
      </View>
      {open ? (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
            {quickCareTypes.map(([value, label]) => (
              <Pressable key={value} onPress={() => setEventType(value)} style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 0.5, borderColor: eventType === value ? theme.primary : theme.line, backgroundColor: eventType === value ? theme.bgSoft : 'transparent' }}>
                <Text style={{ color: eventType === value ? theme.primary : theme.inkSoft, fontSize: 12, fontWeight: '700' }}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput value={note} onChangeText={setNote} placeholder="Optional note…" placeholderTextColor={theme.inkMuted} multiline style={{ minHeight: 54, borderRadius: 12, borderWidth: 0.5, borderColor: theme.line, padding: 11, color: theme.ink, backgroundColor: theme.bg }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: theme.inkMuted, fontSize: 11 }}>Date: today</Text>
            <Pressable disabled={saving} onPress={save} style={{ borderRadius: 999, backgroundColor: saving ? theme.inkMuted : theme.primary, paddingHorizontal: 15, paddingVertical: 10 }}>
              <Text style={{ color: theme.bg, fontSize: 12, fontWeight: '800' }}>{saving ? 'Saving…' : 'Save care'}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {message ? <Text style={{ color: message.startsWith('Could') ? theme.accent : theme.primary, fontSize: 12, fontWeight: '700' }}>{message}</Text> : null}
    </View>
  );
}

function localDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function CareSectionBlock({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children.flat().filter(Boolean) : children ? [children] : [];
  return (
    <View style={{ gap: 8 }}>
      <CareHeading title={title} />
      {childArray.length ? children : <Text style={{ color: theme.inkMuted, fontSize: 13, lineHeight: 18 }}>{empty}</Text>}
    </View>
  );
}

function CareHeading({ title }: { title: string }) {
  return <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>{title}</Text>;
}


function ArchivableRecommendationCard({ recommendation, onArchive }: { recommendation: CareRecommendationRecord; onArchive: () => void }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);
  const reset = () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 7 }).start(() => setDragging(false));
  const archive = () => {
    Animated.timing(translateX, { toValue: 420, duration: 180, useNativeDriver: true }).start(() => {
      translateX.setValue(0);
      setDragging(false);
      onArchive();
    });
  };
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
    onPanResponderGrant: () => setDragging(true),
    onPanResponderMove: (_, gesture) => translateX.setValue(Math.max(-110, Math.min(gesture.dx, 180))),
    onPanResponderRelease: (_, gesture) => { gesture.dx > 92 ? archive() : reset(); },
    onPanResponderTerminate: reset,
  })).current;

  return (
    <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX }], opacity: dragging ? 0.94 : 1 }}>
      <View style={{ gap: 8 }}>
        <RecommendationCard recommendation={recommendation} muted />
        <Pressable onPress={archive} style={{ alignSelf: 'flex-end', marginTop: -48, marginRight: 12, borderRadius: 999, backgroundColor: theme.bgSoft, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ color: theme.inkSoft, fontSize: 11, fontWeight: '800' }}>Hide</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function RecommendationCard({ recommendation, muted = false }: { recommendation: CareRecommendationRecord; muted?: boolean }) {
  return (
    <CarePanel
      eyebrow={`${formatCareType(recommendation.recommendationType)} · ${recommendation.status}`}
      title={recommendation.title}
      body={recommendation.body}
      meta={[formatDueLabel(recommendation.dueOn), formatCareSource(recommendation.source)].filter(Boolean).join(' · ')}
      muted={muted}
    />
  );
}

function CareEventCard({ event }: { event: CareEventRecord }) {
  return <CarePanel eyebrow={`${formatCareType(event.eventType)} · ${formatCareSource(event.source)}`} title={event.note || formatCareType(event.eventType)} meta={fmtDate(event.eventDate, { short: true })} />;
}

function CarePanel({ eyebrow, title, body, meta, featured = false, muted = false }: { eyebrow: string; title: string; body?: string | null; meta?: string | null; featured?: boolean; muted?: boolean }) {
  return (
    <View style={{ backgroundColor: featured ? theme.bgSoft : theme.surface, borderRadius: 15, borderWidth: 0.5, borderColor: featured ? theme.primary : theme.line, padding: 15, opacity: muted ? 0.72 : 1 }}>
      <Text style={{ color: featured ? theme.primary : theme.inkMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '800', marginBottom: 5 }}>{eyebrow}</Text>
      <SerifText style={{ color: theme.ink, fontSize: featured ? 20 : 17, lineHeight: featured ? 24 : 21 }}>{title}</SerifText>
      {body ? <Text style={{ color: theme.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 7 }}>{body}</Text> : null}
      {meta ? <Text style={{ color: theme.inkMuted, fontSize: 11, marginTop: 9 }}>{meta}</Text> : null}
    </View>
  );
}

function EmptyCareState() {
  return (
    <View style={{ borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, padding: 14, backgroundColor: theme.surface }}>
      <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>Care will get smarter as you log it.</Text>
      <Text style={{ color: theme.inkMuted, fontSize: 13, lineHeight: 18 }}>For now this section uses existing recommendations, care history, and AI care notes. Quick logging comes next.</Text>
    </View>
  );
}
