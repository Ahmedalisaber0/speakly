import { Language } from "@/types";

export interface UIStrings {
  clarificationTitle: string;
  clarificationYes: string;
  clarificationNo: string;
  clarificationDismissAria: string;
  listenAria: string;
  translationUnavailable: string;
  statusThinking: string;
  statusSpeaking: string;
  statusListening: string;
  statusIdle: string;
  stopSpeakingAria: string;
}

const STRINGS: Record<Language, UIStrings> = {
  English: {
    clarificationTitle: "Did you mean this?",
    clarificationYes: "Yes, send this",
    clarificationNo: "No, dismiss",
    clarificationDismissAria: "Dismiss",
    listenAria: "Listen to pronunciation",
    translationUnavailable: "translation unavailable",
    statusThinking: "Thinking…",
    statusSpeaking: "Speaking…",
    statusListening: "Listening… tap mic to stop",
    statusIdle: "Type or tap the mic to speak",
    stopSpeakingAria: "Stop speaking",
  },
  Spanish: {
    clarificationTitle: "¿Quisiste decir esto?",
    clarificationYes: "Sí, enviar esto",
    clarificationNo: "No, descartar",
    clarificationDismissAria: "Descartar",
    listenAria: "Escuchar la pronunciación",
    translationUnavailable: "traducción no disponible",
    statusThinking: "Pensando…",
    statusSpeaking: "Hablando…",
    statusListening: "Escuchando… toca el micro para detener",
    statusIdle: "Escribe o toca el micro para hablar",
    stopSpeakingAria: "Detener voz",
  },
  French: {
    clarificationTitle: "Vouliez-vous dire ceci ?",
    clarificationYes: "Oui, envoyer",
    clarificationNo: "Non, ignorer",
    clarificationDismissAria: "Ignorer",
    listenAria: "Écouter la prononciation",
    translationUnavailable: "traduction indisponible",
    statusThinking: "Réflexion en cours…",
    statusSpeaking: "Lecture…",
    statusListening: "Écoute… touchez le micro pour arrêter",
    statusIdle: "Écrivez ou touchez le micro pour parler",
    stopSpeakingAria: "Arrêter la lecture",
  },
  German: {
    clarificationTitle: "Meinten Sie das?",
    clarificationYes: "Ja, senden",
    clarificationNo: "Nein, verwerfen",
    clarificationDismissAria: "Verwerfen",
    listenAria: "Aussprache anhören",
    translationUnavailable: "Übersetzung nicht verfügbar",
    statusThinking: "Denke nach…",
    statusSpeaking: "Spricht…",
    statusListening: "Höre zu… Mikro zum Stoppen tippen",
    statusIdle: "Tippen oder Mikro antippen zum Sprechen",
    stopSpeakingAria: "Stoppen",
  },
  Italian: {
    clarificationTitle: "Intendevi questo?",
    clarificationYes: "Sì, invia",
    clarificationNo: "No, annulla",
    clarificationDismissAria: "Annulla",
    listenAria: "Ascolta la pronuncia",
    translationUnavailable: "traduzione non disponibile",
    statusThinking: "Sto pensando…",
    statusSpeaking: "Sto parlando…",
    statusListening: "In ascolto… tocca il microfono per fermare",
    statusIdle: "Scrivi o tocca il microfono per parlare",
    stopSpeakingAria: "Interrompi la voce",
  },
  Portuguese: {
    clarificationTitle: "Você quis dizer isto?",
    clarificationYes: "Sim, enviar",
    clarificationNo: "Não, descartar",
    clarificationDismissAria: "Descartar",
    listenAria: "Ouvir pronúncia",
    translationUnavailable: "tradução indisponível",
    statusThinking: "Pensando…",
    statusSpeaking: "Falando…",
    statusListening: "Ouvindo… toque o microfone para parar",
    statusIdle: "Digite ou toque o microfone para falar",
    stopSpeakingAria: "Parar de falar",
  },
  Japanese: {
    clarificationTitle: "これでよろしいですか？",
    clarificationYes: "はい、送信する",
    clarificationNo: "いいえ、閉じる",
    clarificationDismissAria: "閉じる",
    listenAria: "発音を聞く",
    translationUnavailable: "翻訳できません",
    statusThinking: "考え中…",
    statusSpeaking: "再生中…",
    statusListening: "聞いています… マイクをタップして停止",
    statusIdle: "入力するか、マイクをタップして話してください",
    stopSpeakingAria: "再生を停止",
  },
  Korean: {
    clarificationTitle: "이렇게 말씀하셨나요?",
    clarificationYes: "네, 보내기",
    clarificationNo: "아니요, 닫기",
    clarificationDismissAria: "닫기",
    listenAria: "발음 듣기",
    translationUnavailable: "번역을 사용할 수 없습니다",
    statusThinking: "생각 중…",
    statusSpeaking: "말하는 중…",
    statusListening: "듣는 중… 마이크를 눌러 중지",
    statusIdle: "입력하거나 마이크를 눌러 말하세요",
    stopSpeakingAria: "재생 중지",
  },
  Arabic: {
    clarificationTitle: "هل تقصد هذا؟",
    clarificationYes: "نعم، أرسل هذا",
    clarificationNo: "لا، إلغاء",
    clarificationDismissAria: "إلغاء",
    listenAria: "استمع للنطق",
    translationUnavailable: "الترجمة غير متاحة",
    statusThinking: "جارٍ التفكير…",
    statusSpeaking: "يتحدث…",
    statusListening: "يستمع… اضغط الميكروفون للإيقاف",
    statusIdle: "اكتب أو اضغط الميكروفون للتحدث",
    stopSpeakingAria: "إيقاف الصوت",
  },
  Chinese: {
    clarificationTitle: "您是这个意思吗？",
    clarificationYes: "是的，发送",
    clarificationNo: "不，关闭",
    clarificationDismissAria: "关闭",
    listenAria: "听发音",
    translationUnavailable: "翻译不可用",
    statusThinking: "思考中…",
    statusSpeaking: "正在播放…",
    statusListening: "正在聆听… 点击麦克风停止",
    statusIdle: "输入或点击麦克风说话",
    stopSpeakingAria: "停止播放",
  },
};

export function getStrings(language: Language | null): UIStrings {
  if (!language) return STRINGS.English;
  return STRINGS[language] ?? STRINGS.English;
}
