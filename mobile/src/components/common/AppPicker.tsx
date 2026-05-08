import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  LENDING_APPS,
  POPULAR_APP_IDS,
  LendingApp,
  getLendingApp,
} from "../../lib/lending-apps";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";

const CATEGORY_LABELS: Record<LendingApp["category"], string> = {
  lending: "Lending Apps",
  bnpl: "Buy Now, Pay Later",
  ewallet: "E-Wallet Loans",
  bank: "Banks & Digital Banks",
};

const CATEGORY_ORDER: LendingApp["category"][] = ["lending", "bnpl", "ewallet", "bank"];

interface AppPickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function AppPicker({ value, onChange }: AppPickerProps) {
  const [search, setSearch] = useState("");
  const selectedApp = getLendingApp(value);

  const query = search.toLowerCase().trim();

  const sections = useMemo(() => {
    const filtered = query
      ? LENDING_APPS.filter(
          (a) =>
            a.id !== "Other" &&
            (a.name.toLowerCase().includes(query) || a.id.toLowerCase().includes(query))
        )
      : LENDING_APPS.filter((a) => a.id !== "Other");

    const result: { title: string; data: LendingApp[] }[] = [];

    if (!query) {
      const popular = POPULAR_APP_IDS.map((id) => getLendingApp(id)!).filter(Boolean);
      if (popular.length > 0) {
        result.push({ title: "Popular", data: popular });
      }
    }

    for (const cat of CATEGORY_ORDER) {
      const apps = filtered.filter((a) => a.category === cat);
      if (apps.length > 0) {
        result.push({ title: CATEGORY_LABELS[cat], data: apps });
      }
    }

    return result;
  }, [query]);

  const handleSelect = (id: string) => {
    onChange(id);
    setSearch("");
  };

  if (value && !search) {
    return (
      <TouchableOpacity style={styles.selectedRow} onPress={() => onChange("")}>
        <AppIcon app={selectedApp} size={28} />
        <Text style={[typography.body, { flex: 1 }]}>
          {selectedApp?.name ?? value}
        </Text>
        <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lending apps..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          autoFocus
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.appRow} onPress={() => handleSelect(item.id)}>
            <AppIcon app={item} size={32} />
            <Text style={typography.body}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.appRow, styles.otherRow]}
            onPress={() => handleSelect("Other")}
          >
            <View style={styles.otherIcon}>
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.mutedForeground} />
            </View>
            <Text style={typography.body}>Other (enter name manually)</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          query ? (
            <View style={styles.empty}>
              <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
                No apps found for "{search}"
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function AppIcon({ app, size }: { app: LendingApp | undefined; size: number }) {
  const [error, setError] = useState(false);

  if (!app?.iconUrl || error) {
    return (
      <View
        style={[
          styles.fallbackIcon,
          { width: size, height: size, borderRadius: size * 0.2 },
        ]}
      >
        <Ionicons name="business" size={size * 0.5} color={colors.mutedForeground} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: app.iconUrl }}
      style={{ width: size, height: size, borderRadius: size * 0.2 }}
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  container: { maxHeight: 360 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.foreground,
    height: 44,
  },
  list: { marginTop: spacing.sm },
  sectionHeader: {
    backgroundColor: colors.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.mutedForeground,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  otherRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  fallbackIcon: {
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    height: 48,
  },
  otherIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
});
