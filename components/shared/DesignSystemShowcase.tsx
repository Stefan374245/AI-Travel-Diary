import React from 'react';
import {
  Heading,
  Text,
  Display,
  Lead,
  Caption,
  Stack,
  Card,
  Grid,
  Container,
  Section,
  Divider,
  Box,
} from '../design-system';

/**
 * Design System Showcase
 * Demonstriert alle Komponenten und deren Verwendung
 */

const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <Section spacing="lg" className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <Container size="lg">
          <Stack spacing="lg">
            <Display>Design System Showcase</Display>
            <Lead className="text-primary-50">
              Ein hochwertiges Design-System mit klarer Typografie-Hierarchie und konsistentem Spacing.
            </Lead>
          </Stack>
        </Container>
      </Section>

      {/* Typography Section */}
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="xl">
            <div>
              <Text variant="meta" color="primary" className="mb-2">TYPOGRAPHY</Text>
              <Heading level={2}>Typografie-Hierarchie</Heading>
              <Text variant="body" color="secondary">
                Klare visuelle Hierarchie durch konsistente Größen, Gewichte und Abstände.
              </Text>
            </div>

            <Card variant="elevated">
              <Stack spacing="lg">
                <Heading level={1}>Heading 1 - Display Headline</Heading>
                <Heading level={2}>Heading 2 - Section Title</Heading>
                <Heading level={3}>Heading 3 - Subsection</Heading>
                <Heading level={4}>Heading 4 - Card Title</Heading>
                <Heading level={5}>Heading 5 - Small Section</Heading>
                <Heading level={6}>Heading 6 - Component Header</Heading>
                
                <Divider spacing="md" />
                
                <Text variant="body-large">
                  Body Large: Größerer Fließtext für besondere Betonung und bessere Lesbarkeit in wichtigen Bereichen.
                </Text>
                <Text variant="body">
                  Body: Standard-Fließtext mit optimaler Lesbarkeit. Mindestens 16px für komfortables Lesen auf allen Geräten.
                </Text>
                <Text variant="small">
                  Small: Kleinerer Text für Nebentexte und zusätzliche Informationen, die weniger Aufmerksamkeit benötigen.
                </Text>
                <Text variant="label">
                  Label: Text für Formulare und Beschriftungen mit erhöhtem Gewicht für bessere Lesbarkeit.
                </Text>
                <Text variant="meta">
                  Meta: Metainformationen wie Datum, Tags oder Kategorien in Großbuchstaben.
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>

      {/* Colors Section */}
      <Section spacing="lg" className="bg-neutral-100">
        <Container size="lg">
          <Stack spacing="xl">
            <div>
              <Text variant="meta" color="primary" className="mb-2">COLORS</Text>
              <Heading level={2}>Farb-Varianten</Heading>
            </div>

            <Grid cols={3} gap="md">
              <Card>
                <Text color="primary">Primary Color</Text>
                <Caption>Haupttext, dunkelstes Grau</Caption>
              </Card>
              <Card>
                <Text color="secondary">Secondary Color</Text>
                <Caption>Nebentexte, mittleres Grau</Caption>
              </Card>
              <Card>
                <Text color="muted">Muted Color</Text>
                <Caption>Zurückhaltende Texte</Caption>
              </Card>
              <Card>
                <Text color="success">Success Color</Text>
                <Caption>Erfolgsmeldungen</Caption>
              </Card>
              <Card>
                <Text color="warning">Warning Color</Text>
                <Caption>Warnhinweise</Caption>
              </Card>
              <Card>
                <Text color="error">Error Color</Text>
                <Caption>Fehlermeldungen</Caption>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Cards Section */}
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="xl">
            <div>
              <Text variant="meta" color="primary" className="mb-2">CARDS</Text>
              <Heading level={2}>Card-Varianten</Heading>
            </div>

            <Grid cols={2} gap="lg">
              <Card variant="default" padding="lg">
                <Heading level={4}>Default Card</Heading>
                <Text color="secondary">Leichter Schatten für subtile Elevation.</Text>
              </Card>

              <Card variant="elevated" padding="lg">
                <Heading level={4}>Elevated Card</Heading>
                <Text color="secondary">Starker Schatten für deutliche Hervorhebung.</Text>
              </Card>

              <Card variant="outlined" padding="lg">
                <Heading level={4}>Outlined Card</Heading>
                <Text color="secondary">Rahmen statt Schatten für flaches Design.</Text>
              </Card>

              <Card variant="ghost" padding="lg">
                <Heading level={4}>Ghost Card</Heading>
                <Text color="secondary">Dezenter Hintergrund ohne Schatten.</Text>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Spacing Section */}
      <Section spacing="lg" className="bg-neutral-100">
        <Container size="lg">
          <Stack spacing="xl">
            <div>
              <Text variant="meta" color="primary" className="mb-2">SPACING</Text>
              <Heading level={2}>Spacing-System</Heading>
              <Text variant="body" color="secondary">
                Konsistente Abstände basierend auf einer 4px-Einheit.
              </Text>
            </div>

            <Card variant="elevated">
              <Stack spacing="sm">
                <Text variant="label">Stack Spacing: xs (8px)</Text>
                <Box className="bg-primary-100 rounded" padding="sm">
                  <Text variant="small">Element</Text>
                </Box>
              </Stack>

              <div className="mt-6">
                <Stack spacing="md">
                  <Text variant="label">Stack Spacing: md (24px)</Text>
                  <Box className="bg-primary-100 rounded" padding="sm">
                    <Text variant="small">Element</Text>
                  </Box>
                </Stack>
              </div>

              <div className="mt-8">
                <Stack spacing="lg">
                  <Text variant="label">Stack Spacing: lg (32px)</Text>
                  <Box className="bg-primary-100 rounded" padding="sm">
                    <Text variant="small">Element</Text>
                  </Box>
                </Stack>
              </div>
            </Card>
          </Stack>
        </Container>
      </Section>

      {/* Grid Section */}
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="xl">
            <div>
              <Text variant="meta" color="primary" className="mb-2">GRID</Text>
              <Heading level={2}>Grid-Layouts</Heading>
            </div>

            <div>
              <Text variant="label" className="mb-4">2-Spalten Grid</Text>
              <Grid cols={2} gap="md">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} variant="outlined" padding="lg">
                    <Text>Grid Item {i}</Text>
                  </Card>
                ))}
              </Grid>
            </div>

            <div>
              <Text variant="label" className="mb-4">3-Spalten Grid</Text>
              <Grid cols={3} gap="lg">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} variant="outlined" padding="md">
                    <Text>Item {i}</Text>
                  </Card>
                ))}
              </Grid>
            </div>

            <div>
              <Text variant="label" className="mb-4">4-Spalten Grid</Text>
              <Grid cols={4} gap="sm">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} variant="ghost" padding="sm">
                    <Text variant="small">{i}</Text>
                  </Card>
                ))}
              </Grid>
            </div>
          </Stack>
        </Container>
      </Section>

      {/* Usage Example */}
      <Section spacing="lg" className="bg-primary-50">
        <Container size="md">
          <Stack spacing="lg">
            <div className="text-center">
              <Text variant="meta" color="primary" className="mb-2">EXAMPLE</Text>
              <Heading level={2}>Praktisches Beispiel</Heading>
              <Lead>So sieht eine typische Card-Komponente aus.</Lead>
            </div>

            <Card variant="elevated" padding="lg">
              <Stack spacing="md">
                <Heading level={3}>Reise nach Barcelona</Heading>
                <Text variant="body" color="secondary">
                  Eine unvergessliche Reise durch die katalanische Hauptstadt. Von der Sagrada Familia
                  bis zum Park Güell – Gaudís Architektur beeindruckt auf Schritt und Tritt.
                </Text>
                <Divider spacing="sm" />
                <div className="flex items-center justify-between">
                  <Text variant="meta" color="muted">15. NOV 2025</Text>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full">
                      Spanien
                    </span>
                    <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full">
                      Architektur
                    </span>
                  </div>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>

      {/* Footer */}
      <Section spacing="sm" className="bg-neutral-900 text-white">
        <Container size="lg">
          <div className="text-center">
            <Text variant="small" as="p" className="text-neutral-400">
              Design System © 2025 - Hochwertige visuelle Sprache
            </Text>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default DesignSystemShowcase;
