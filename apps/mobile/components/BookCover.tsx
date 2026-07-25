import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

/**
 * Procedural abstract cover art (moon / arch / plant / mountain motifs)
 * matching the mockup's illustration style. Deterministic per seed so the
 * same book always renders the same artwork.
 */

const PALETTES = [
  { bg: '#1F2A44', accent: '#E8D5A3', secondary: '#2E3D5C', tertiary: '#49657D' },
  { bg: '#1A4334', accent: '#E4B363', secondary: '#2A5C48', tertiary: '#8FA88A' },
  { bg: '#C4784A', accent: '#F2E3C6', secondary: '#A65E38', tertiary: '#E0A87E' },
  { bg: '#5B7C99', accent: '#F0E6D2', secondary: '#49657D', tertiary: '#7C97AF' },
  { bg: '#2F4F4A', accent: '#EFE3D3', secondary: '#3D6159', tertiary: '#8FA88A' },
  { bg: '#8FA88A', accent: '#F5EFDF', secondary: '#76906F', tertiary: '#5C7856' },
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function MoonMotif({ p }: { p: (typeof PALETTES)[number] }) {
  return (
    <>
      <View
        style={[
          styles.abs,
          {
            top: '14%',
            alignSelf: 'center',
            width: '42%',
            aspectRatio: 1,
            borderRadius: 999,
            backgroundColor: p.accent,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            bottom: '18%',
            left: '-10%',
            width: '120%',
            height: '16%',
            borderTopLeftRadius: 999,
            borderTopRightRadius: 999,
            backgroundColor: p.secondary,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            bottom: 0,
            left: '-10%',
            width: '120%',
            height: '14%',
            borderTopLeftRadius: 999,
            borderTopRightRadius: 999,
            backgroundColor: p.tertiary,
          },
        ]}
      />
    </>
  );
}

function ArchMotif({ p }: { p: (typeof PALETTES)[number] }) {
  return (
    <>
      <View
        style={[
          styles.abs,
          {
            top: '16%',
            alignSelf: 'center',
            width: '52%',
            height: '68%',
            borderTopLeftRadius: 999,
            borderTopRightRadius: 999,
            backgroundColor: p.secondary,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            top: '26%',
            alignSelf: 'center',
            width: '30%',
            aspectRatio: 1,
            borderRadius: 999,
            backgroundColor: p.accent,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            bottom: 0,
            left: 0,
            width: '100%',
            height: '12%',
            backgroundColor: p.tertiary,
          },
        ]}
      />
    </>
  );
}

function PlantMotif({ p }: { p: (typeof PALETTES)[number] }) {
  const leaf = (rot: string, left: string, top: string): ViewStyle => ({
    position: 'absolute',
    left: left as ViewStyle['left'],
    top: top as ViewStyle['top'],
    width: '30%',
    height: '46%',
    borderRadius: 999,
    backgroundColor: p.accent,
    transform: [{ rotate: rot }],
  });
  return (
    <>
      <View style={leaf('-24deg', '12%', '18%')} />
      <View style={leaf('0deg', '36%', '10%')} />
      <View style={leaf('24deg', '58%', '18%')} />
      <View
        style={[
          styles.abs,
          {
            bottom: 0,
            alignSelf: 'center',
            width: '10%',
            height: '38%',
            backgroundColor: p.secondary,
          },
        ]}
      />
    </>
  );
}

function MountainMotif({ p }: { p: (typeof PALETTES)[number] }) {
  return (
    <>
      <View
        style={[
          styles.abs,
          {
            top: '12%',
            right: '14%',
            width: '26%',
            aspectRatio: 1,
            borderRadius: 999,
            backgroundColor: p.accent,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            bottom: '-26%',
            left: '-16%',
            width: '70%',
            aspectRatio: 1,
            borderRadius: 28,
            backgroundColor: p.secondary,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            bottom: '-32%',
            right: '-18%',
            width: '78%',
            aspectRatio: 1,
            borderRadius: 28,
            backgroundColor: p.tertiary,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
    </>
  );
}

const MOTIFS = [MoonMotif, ArchMotif, PlantMotif, MountainMotif];

export function BookCover({
  seed,
  style,
  radius = 14,
}: {
  seed: string;
  style?: ViewStyle;
  radius?: number;
}) {
  const h = hashSeed(seed);
  const palette = PALETTES[h % PALETTES.length];
  const Motif = MOTIFS[Math.floor(h / 7) % MOTIFS.length];

  return (
    <View
      style={[
        {
          backgroundColor: palette.bg,
          borderRadius: radius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Motif p={palette} />
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
