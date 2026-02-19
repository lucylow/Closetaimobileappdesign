import { createBrowserRouter } from "react-router";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { WardrobeScreen } from "./components/screens/WardrobeScreen";
import { AddItemScreen } from "./components/screens/AddItemScreen";
import { OutfitSuggestionsScreen } from "./components/screens/OutfitSuggestionsScreen";
import { TryOnScreen } from "./components/screens/TryOnScreen";
import { ContentStudioScreen } from "./components/screens/ContentStudioScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: OnboardingScreen,
  },
  {
    path: "/home",
    Component: HomeScreen,
  },
  {
    path: "/wardrobe",
    Component: WardrobeScreen,
  },
  {
    path: "/add-item",
    Component: AddItemScreen,
  },
  {
    path: "/outfits",
    Component: OutfitSuggestionsScreen,
  },
  {
    path: "/try-on",
    Component: TryOnScreen,
  },
  {
    path: "/content-studio",
    Component: ContentStudioScreen,
  },
  {
    path: "/settings",
    Component: SettingsScreen,
  },
]);
