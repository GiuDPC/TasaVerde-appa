import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  prefix?: string;
}

export function AmountInput({
  value,
  onChangeText,
  label = 'Monto en USD',
  placeholder = '0.00',
  prefix = '$',
}: AmountInputProps) {
  const handleChange = (text: string) => {
    // Solo permitir números y punto decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Evitar múltiples puntos
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    onChangeText(cleaned);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.prefix}>{prefix}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          keyboardType="decimal-pad"
          maxLength={12}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    paddingHorizontal: 16,
  },
  prefix: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: 'bold',
    paddingVertical: 16,
  },
});
