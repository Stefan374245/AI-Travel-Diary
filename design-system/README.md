# Design System Documentation

## 🎨 Übersicht

Hochwertiges Design-System mit klarer Typografie-Hierarchie, präzisen Spacings und konsistentem vertikalem Rhythmus.

---

## 📐 Typografie-System

### Font Sizes (Modular Scale 1.25 - Major Third)

```
xs    → 12px / 0.75rem
sm    → 14px / 0.875rem
base  → 16px / 1rem      (Body Standard - Minimum)
lg    → 18px / 1.125rem
xl    → 20px / 1.25rem
2xl   → 24px / 1.5rem
3xl   → 30px / 1.875rem
4xl   → 36px / 2.25rem
5xl   → 48px / 3rem
6xl   → 60px / 3.75rem
```

### Font Weights

```
normal    → 400
medium    → 500
semibold  → 600
bold      → 700
extrabold → 800
```

### Line Heights

- **Tight** (1.25): Große Überschriften
- **Snug** (1.375): Mittlere Überschriften
- **Normal** (1.5): Standard
- **Relaxed** (1.625): Body Text
- **Loose** (2): Besondere Betonung

### Letter Spacing

- Überschriften: `-0.025em` bis `-0.035em` (enger)
- Body: `0` (neutral)
- Labels/Meta: `0.01em` bis `0.025em` (weiter)

---

## 📏 Spacing-System (4px Basis)

```
0.5 → 2px
1   → 4px
2   → 8px
3   → 12px
4   → 16px
5   → 20px
6   → 24px
7   → 28px
8   → 32px
10  → 40px
12  → 48px
14  → 56px
16  → 64px
20  → 80px
24  → 96px
32  → 128px
```

---

## 🎭 Komponenten

### Typography Components

#### `<Heading>`
Automatische Hierarchie mit Level 1-6:

```tsx
<Heading level={1}>H1 - 48px, Bold, Tight</Heading>
<Heading level={2}>H2 - 36px, Bold, Tight</Heading>
<Heading level={3}>H3 - 30px, Semibold</Heading>
<Heading level={4}>H4 - 24px, Semibold</Heading>
<Heading level={5}>H5 - 20px, Semibold</Heading>
<Heading level={6}>H6 - 18px, Semibold</Heading>
```

**Props:**
- `level`: 1-6 (default: 2)
- `as`: Optional semantisches HTML-Tag überschreiben
- `className`: Zusätzliche Klassen

#### `<Text>`
Flexible Text-Varianten:

```tsx
<Text variant="body">Standard Body (16px)</Text>
<Text variant="body-large">Großer Body (18px)</Text>
<Text variant="small">Kleinerer Text (14px)</Text>
<Text variant="label">Label Text (14px, Medium)</Text>
<Text variant="meta">Meta Info (12px, Uppercase)</Text>
```

**Color Props:**
```tsx
<Text color="primary">Dunkelgrau</Text>
<Text color="secondary">Mittelgrau</Text>
<Text color="muted">Hellgrau</Text>
<Text color="success">Grün</Text>
<Text color="warning">Orange</Text>
<Text color="error">Rot</Text>
```

#### `<Display>`, `<Lead>`, `<Caption>`

```tsx
<Display>Große Headline (60px)</Display>
<Lead>Einleitender Absatz (20px)</Lead>
<Caption>Bildunterschrift (14px)</Caption>
```

---

### Layout Components

#### `<Stack>`
Verwaltet vertikalen Abstand zwischen Kindern:

```tsx
<Stack spacing="md">
  <div>Element 1</div>
  <div>Element 2</div>
  <div>Element 3</div>
</Stack>
```

**Spacing Values:**
- `xs` → 8px
- `sm` → 16px
- `md` → 24px (default)
- `lg` → 32px
- `xl` → 48px
- `2xl` → 64px

#### `<Card>`
Container mit Schatten und Padding:

```tsx
<Card variant="elevated" padding="lg">
  Inhalt
</Card>
```

**Variants:**
- `default`: Leichter Schatten
- `elevated`: Starker Schatten
- `outlined`: Rahmen statt Schatten
- `ghost`: Hintergrund ohne Schatten

**Padding:**
- `none`, `sm`, `md` (default), `lg`

#### `<Grid>`
Responsive Grid Layout:

```tsx
<Grid cols={3} gap="md">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</Grid>
```

**Cols:** 1, 2, 3, 4, 6, 12 (automatisch responsive)

#### `<Container>`
Zentrierter Content-Container:

```tsx
<Container size="md" padding>
  Content
</Container>
```

**Sizes:**
- `sm` → 672px
- `md` → 896px (default)
- `lg` → 1152px
- `xl` → 1280px
- `full` → 100%

#### `<Section>`
Großflächige Content-Bereiche:

```tsx
<Section spacing="lg">
  Großer Bereich
</Section>
```

**Spacing:** `sm` (32px), `md` (48px), `lg` (64px)

#### `<Divider>`
Horizontale Trennlinie:

```tsx
<Divider spacing="md" />
```

#### `<Box>`
Generischer Container mit Padding:

```tsx
<Box padding="lg">Content</Box>
```

---

## 🎨 Farben

### Primary (Indigo)
```
50  → #eef2ff
500 → #6366f1  (Haupt)
600 → #4f46e5  (Hover)
700 → #4338ca  (Active)
```

### Neutral (Graustufen)
```
50  → #fafafa  (Fast Weiß)
200 → #e5e5e5  (Border)
500 → #737373  (Text Muted)
700 → #404040  (Text Secondary)
900 → #171717  (Text Primary)
```

### Success, Warning, Error
Jeweils mit Stufen 50, 500, 600, 700

---

## 📱 Mobile-First Approach

Alle Komponenten sind mobile-first designed:

- Body Text mindestens 16px für optimale Lesbarkeit
- Touch-Targets min. 44x44px
- Responsive Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## ✅ Best Practices

1. **Vertikaler Rhythmus**: Immer Vielfache von 4px verwenden
2. **Hierarchie**: Mindestens 2 Stufen Unterschied zwischen Überschriften
3. **Weißraum**: Großzügig nutzen für bessere Lesbarkeit
4. **Konsistenz**: Design-System-Komponenten statt Custom-Styles
5. **Accessibility**: Semantische HTML-Tags, ausreichende Kontraste

---

## 🚀 Usage Example

```tsx
import { Heading, Text, Stack, Card, Grid, Container } from '../design-system';

function MyComponent() {
  return (
    <Container size="lg">
      <Stack spacing="xl">
        <Heading level={1}>Willkommen</Heading>
        <Text variant="body-large" color="secondary">
          Eine hochwertige Einleitung.
        </Text>

        <Grid cols={3} gap="lg">
          <Card variant="elevated">
            <Stack spacing="sm">
              <Heading level={4}>Feature 1</Heading>
              <Text>Beschreibung</Text>
            </Stack>
          </Card>
          {/* ... */}
        </Grid>
      </Stack>
    </Container>
  );
}
```

---

## 🔧 Tailwind Config

Das System nutzt eine erweiterte Tailwind-Konfiguration (`tailwind.config.js`).  
Alle Tokens sind auch als TypeScript-Konstanten verfügbar (`design-system/tokens.ts`).

---

**Ziel:** Ruhiges, elegantes, professionelles UI-Design auf Senior-Level.
