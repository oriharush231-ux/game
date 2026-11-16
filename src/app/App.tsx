import { lazy, Suspense, useEffect } from 'react';
import { useGame, type ScreenId } from '../store/gameStore';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { ModeSelectScreen } from '../screens/mode/ModeSelectScreen';
import { CountrySelectScreen } from '../screens/country/CountrySelectScreen';
import { RoleSelectScreen } from '../screens/role/RoleSelectScreen';
import { ToastHost } from '../ui/Toast';
import { Emblem } from '../ui/Brand';

// The game shell is the heaviest screen – load it on demand.
const GameScreen = lazy(() => import('../screens/game/GameScreen'));

const SCREENS: Record<ScreenId, React.ComponentType> = {
  splash: SplashScreen,
  mode: ModeSelectScreen,
  country: CountrySelectScreen,
  role: RoleSelectScreen,
  game: GameScreen,
};

export function App() {
  const screen = useGame((s) => s.screen);
  const hasSession = useGame((s) => Boolean(s.session));

  // Sync with browser/phone back button.
  useEffect(() => {
    window.history.replaceState({ screen: useGame.getState().screen }, '');
    const onPop = (e: PopStateEvent) => {
      const target = (e.state?.screen as ScreenId | undefined) ?? 'splash';
      useGame.getState().navigate(target, { fromHistory: true });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Guard: never show the game shell without a session.
  const active: ScreenId = screen === 'game' && !hasSession ? 'splash' : screen;
  const Screen = SCREENS[active];

  // Warm the game chunk while the player is in the setup flow.
  useEffect(() => {
    if (active === 'role' || active === 'splash') void import('../screens/game/GameScreen');
  }, [active]);

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Screen key={active} />
      </Suspense>
      <ToastHost />
    </>
  );
}

function Loading() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <Emblem size={84} spin />
    </div>
  );
}
