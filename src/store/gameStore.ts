import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { attemptPromotion, performAction } from '../game/actions';
import { advanceTurn, createSession } from '../game/session';
import type { CountryId, GameSession, Ideology, NewGameSetup, StartPath, WorldMode } from '../game/types';

export type ScreenId = 'splash' | 'mode' | 'country' | 'role' | 'game';

export const SETUP_FLOW: ScreenId[] = ['mode', 'country', 'role'];

export interface Toast {
  id: number;
  text: string;
  tone: 'success' | 'danger' | 'info';
}

interface GameStore {
  screen: ScreenId;
  setup: Partial<NewGameSetup>;
  session: GameSession | null;
  toast: Toast | null;

  navigate: (screen: ScreenId, opts?: { fromHistory?: boolean }) => void;
  setMode: (mode: WorldMode) => void;
  setCountry: (id: CountryId) => void;
  setPath: (path: StartPath) => void;
  setIdentity: (name: string, ideology: Ideology) => void;
  startGame: () => void;
  continueGame: () => void;
  endTurn: () => void;
  doAction: (actionId: string) => void;
  runForOffice: () => void;
  abandonGame: () => void;
  showToast: (text: string, tone?: Toast['tone']) => void;
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: 'splash',
      setup: { mode: undefined, ideology: 'centrist', name: '' },
      session: null,
      toast: null,

      navigate: (screen, opts) => {
        if (screen === get().screen) return;
        if (!opts?.fromHistory && typeof window !== 'undefined') window.history.pushState({ screen }, '');
        set({ screen });
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
      },

      setMode: (mode) => set((s) => ({ setup: { ...s.setup, mode } })),
      setCountry: (countryId) => set((s) => ({ setup: { ...s.setup, countryId } })),
      setPath: (path) => set((s) => ({ setup: { ...s.setup, path } })),
      setIdentity: (name, ideology) => set((s) => ({ setup: { ...s.setup, name, ideology } })),

      startGame: () => {
        const { setup } = get();
        if (!setup.mode || !setup.countryId || !setup.path) return;
        const session = createSession({
          mode: setup.mode,
          countryId: setup.countryId,
          path: setup.path,
          name: setup.name ?? '',
          ideology: setup.ideology ?? 'centrist',
        });
        set({ session });
        get().navigate('game');
      },

      continueGame: () => {
        if (get().session) get().navigate('game');
      },

      endTurn: () => {
        const { session } = get();
        if (session) set({ session: advanceTurn(session) });
      },

      doAction: (actionId) => {
        const { session } = get();
        if (!session) return;
        const next = performAction(session, actionId);
        if (next !== session) {
          set({ session: next });
          const headline = next.news[0];
          get().showToast(headline.headline, headline.tone === 'negative' ? 'danger' : 'success');
        }
      },

      runForOffice: () => {
        const { session } = get();
        if (!session) return;
        const result = attemptPromotion(session);
        set({ session: result.session });
        get().showToast(result.session.news[0].headline, result.success ? 'success' : 'danger');
      },

      abandonGame: () => {
        set({ session: null, setup: { ideology: 'centrist', name: '' } });
        get().navigate('splash');
      },

      showToast: (text, tone = 'info') => set({ toast: { id: Date.now(), text, tone } }),
    }),
    {
      name: 'wl61-save',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ session: s.session, setup: s.setup }),
    },
  ),
);
