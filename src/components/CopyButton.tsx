import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { copyRatesToClipboard } from '../hooks/useClipboard';

interface CopyButtonProps {
  rates: {
    bcv: number;
    paralelo?: number;
    binance: number;
    bestOption: string;
  };
}

export function CopyButton({ rates }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyRatesToClipboard(rates);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity
      style={[styles.button, copied && styles.buttonCopied]}
      onPress={handleCopy}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{copied ? '✅' : '📋'}</Text>
      <Text style={styles.text}>
        {copied ? '¡Copiado!' : 'Copiar para WhatsApp'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  buttonCopied: {
    backgroundColor: '#22C55E',
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
