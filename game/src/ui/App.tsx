import type { JSX } from 'preact';

import { useAppSnapshot } from '../app/hooks.ts';
import { GalleryScreen, HeroScreen, MenuScreen, PrologueScreen, SplashScreen } from './screens/StartScreens.tsx';
import { GameScreen, JournalScreen, SheetScreen } from './screens/GameScreens.tsx';
import { EndingScreen } from './screens/EndingScreen.tsx';

/** Роутер без библиотеки: экран определяется состоянием хранилища. */
export function App(): JSX.Element {
  const { screen } = useAppSnapshot();
  switch (screen) {
    case 'splash':
      return <SplashScreen />;
    case 'menu':
      return <MenuScreen />;
    case 'hero':
      return <HeroScreen />;
    case 'prologue':
      return <PrologueScreen />;
    case 'sheet':
      return <SheetScreen />;
    case 'journal':
      return <JournalScreen />;
    case 'gallery':
      return <GalleryScreen />;
    case 'ending':
      return <EndingScreen />;
    case 'game':
    default:
      return <GameScreen />;
  }
}
