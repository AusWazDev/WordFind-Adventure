/**
 * pages.config.js — Page routing configuration (hand-maintained).
 *
 * To add a new page: import it and add an entry to PAGES.
 * mainPage controls the landing route (must match a key in PAGES exactly).
 */
import DailyChallenge from './pages/DailyChallenge';
import Game from './pages/Game';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import __Layout from './Layout.jsx';


export const PAGES = {
    "DailyChallenge": DailyChallenge,
    "Game": Game,
    "Home": Home,
    "Settings": Settings,
    "Stats": Stats,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};