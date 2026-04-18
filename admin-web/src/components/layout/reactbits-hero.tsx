import React, { useEffect, useMemo, useState } from 'react';

type Props = {
  pendingCount: number;
  dueCount: number;
  openConflicts: number;
};

type ReactBitsModule = {
  View: React.ComponentType<{ style?: unknown; children?: React.ReactNode }>;
  Text: React.ComponentType<{ style?: unknown; children?: React.ReactNode }>;
  StyleSheet: {
    create: (styles: Record<string, unknown>) => Record<string, unknown>;
  };
};

export const ReactBitsHero = ({ pendingCount, dueCount, openConflicts }: Props) => {
  const [bits, setBits] = useState<ReactBitsModule | null>(null);

  useEffect(() => {
    let mounted = true;

    import('react-bits')
      .then((mod) => {
        if (!mounted) {
          return;
        }

        setBits({
          View: mod.View as ReactBitsModule['View'],
          Text: mod.Text as ReactBitsModule['Text'],
          StyleSheet: mod.StyleSheet as ReactBitsModule['StyleSheet'],
        });
      })
      .catch(() => {
        // Keep fallback rendering if react-bits fails to initialize.
        if (mounted) {
          setBits(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const styles = useMemo(() => {
    if (!bits) {
      return null;
    }

    return bits.StyleSheet.create({
      shell: {
        borderRadius: 14,
        padding: 18,
        backgroundColor: '#f2f7ff',
        borderColor: '#c7dbff',
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      },
      label: {
        color: '#234f9a',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
        fontWeight: '700',
      },
      title: {
        color: '#11223a',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 4,
      },
      subtitle: {
        color: '#445a76',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 6,
      },
      statsRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
      },
      statChip: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#b8cff7',
        backgroundColor: '#ffffff',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
      },
      statText: {
        color: '#1f4d95',
        fontSize: 12,
        fontWeight: '700',
      },
    }) as Record<string, unknown>;
  }, [bits]);

  if (!bits || !styles) {
    return (
      <section className="card reactbits-fallback">
        <p className="reactbits-fallback__label">React Bits Surface</p>
        <h2>Admin Control Tower</h2>
        <p>Moderate market quality, settle outcomes quickly, and track queue health.</p>
        <div className="reactbits-fallback__chips">
          <span>Pending: {pendingCount}</span>
          <span>Due: {dueCount}</span>
          <span>Open conflicts: {openConflicts}</span>
        </div>
      </section>
    );
  }

  const BitsView = bits.View;
  const BitsText = bits.Text;

  return (
    <BitsView style={styles.shell as unknown}>
      <BitsText style={styles.label as unknown}>React Bits Surface</BitsText>
      <BitsView>
        <BitsText style={styles.title as unknown}>Admin Control Tower</BitsText>
        <BitsText style={styles.subtitle as unknown}>Moderate market quality, settle outcomes quickly, and track queue health.</BitsText>
      </BitsView>
      <BitsView style={styles.statsRow as unknown}>
        <BitsView style={styles.statChip as unknown}>
          <BitsText style={styles.statText as unknown}>Pending: {pendingCount}</BitsText>
        </BitsView>
        <BitsView style={styles.statChip as unknown}>
          <BitsText style={styles.statText as unknown}>Due: {dueCount}</BitsText>
        </BitsView>
        <BitsView style={styles.statChip as unknown}>
          <BitsText style={styles.statText as unknown}>Open conflicts: {openConflicts}</BitsText>
        </BitsView>
      </BitsView>
    </BitsView>
  );
};
