# CraftRN templates (`template to use/`)

The folder contains **CraftRN** reference screens (Stays search, Settings, Messaging, Onboarding, etc.). They rely on `react-native-unistyles` and `@/craftrn-ui` which are **not** bundled in Saheel.

## How we use them

| Template pattern | Saheel implementation |
|------------------|------------------------|
| Settings sections | `components/settings/SettingsGroup.tsx`, `SettingsRow.tsx`, `app/(modals)/settings.tsx` |
| Stays search | Discover search bar + region chips (`app/(tabs)/index.tsx`) |
| Profile | `app/(tabs)/profile.tsx` (Airbnb-style rows) |
| Pro command center | `components/pro/*` (business & partner) |

To port a template screen fully, copy UI structure only and restyle with our tokens: `#FF385C`, `mon` fonts, white cards, 16px radius.
