import { useEffect } from 'preact/hooks';
import type { JSX } from 'preact';

import { useAppSnapshot } from '../app/hooks.ts';
import { GalleryScreen, HeroScreen, MenuScreen, PrologueScreen, RulesScreen, SplashScreen } from './screens/StartScreens.tsx';
import { GameScreen, JournalScreen, SheetScreen } from './screens/GameScreens.tsx';
import { EndingScreen } from './screens/EndingScreen.tsx';
import { SavesScreen } from './screens/SavesScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';
import { LoreScreen } from './screens/LoreScreen.tsx';

/** Роутер без библиотеки: экран определяется состоянием хранилища. */
export function App(): JSX.Element {
  const { screen, settings } = useAppSnapshot();

  // Тема применяется на <html>, чтобы её видели и системные элементы.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = settings.theme;
  }, [settings.theme]);

  switch (screen) {
    case 'splash':
      return <SplashScreen />;
    case 'menu':
      return <MenuScreen />;
    case 'hero':
      return <HeroScreen />;
    case 'prologue':
      return <PrologueScreen />;
    case 'rules':
      return <RulesScreen />;
    case 'sheet':
      return <SheetScreen />;
    case 'journal':
      return <JournalScreen />;
    case 'gallery':
      return <GalleryScreen />;
    case 'saves':
      return <SavesScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'lore':
      return <LoreScreen />;
    case 'ending':
      return <EndingScreen />;
    case 'game':
    default:
      return <GameScreen />;
  }
}
